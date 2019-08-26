var firebase = require('firebase/app');
require('firebase/firestore');

class HangmanModel{
    constructor(){

        this.session = {
          availablePlaces:4,
          gameEnded:false,
          phrase:"",
          guessedLetters:[],
          timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
          activeUser: "",
          users: {} /// key: score
        }
      this.nrOfLivesPerActiveUser = 4;
    }

}

module.exports = HangmanModel;