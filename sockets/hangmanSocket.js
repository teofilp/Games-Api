let hangmanService = require('../service/hangmanService');
let gamesService = require('../service/gamesService');

const isNewSession = (gameData, sessionKey) => {
    if(gameData.hasOwnProperty(sessionKey) && !gameData[sessionKey].data)
        return true;
    return !gameData.hasOwnProperty(sessionKey);
}

const createSession = async (gameData, sessionKey) => {
    gameData[sessionKey] = {};
    let session = await (hangmanService.getSessionByKey(sessionKey));
    gameData[sessionKey].data = session.data;
    gameData[sessionKey].messages = [];
}

const getSessionMessages = (gameData, sessionKey) => {

    if(!gameData.hasOwnProperty(sessionKey))
        throw new Error('No session has been found for the given key');

    return gameData[sessionKey].messages;

}

const getSessionData = (gameData) => {
    return (sessionKey) => {
        if(!gameData.hasOwnProperty(sessionKey))
            throw new Error('No session has been found for the given key');

        return {
            data: gameData[sessionKey].data,
            id: sessionKey
        }
    }
}

module.exports = function(io, getSession, gameData) {

    io.of('/hangman').on('connection', async (socket) => {

        let sessionKey = socket.handshake.query.roomName;
        let userId = socket.handshake.query.userId;

        if(isNewSession(gameData, sessionKey)){
            await createSession(gameData, sessionKey);
        }

        socket.join(sessionKey, async () => {
            await hangmanService.addUserToSession(userId, sessionKey, getSessionData(gameData));

            
            socket.emit('sessionUpdated', getSessionData(gameData)(sessionKey));
            socket.emit('getMessages', getSessionMessages(gameData, sessionKey));
            socket.emit('newUser', {sender: "server", userId: userId});

            const hangmanSocketService = hangmanService.getHangmanSocketService(socket, getSession, getSessionData(gameData));
            const gameSocketService = gamesService.getGamesSocketService(socket, getSession, getSessionMessages(gameData, sessionKey));

            socket.on('newMessage', gameSocketService.handleChat);
            socket.on('letterPressed', hangmanSocketService.letterPressed);

        });

    });
}