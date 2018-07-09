// Self invoking function hides currentWord from the console
(function() {
  /*
   * Pick from alphabet keypad. Returns the letter chosen.
   */
  $("#alphabet-keypad").on("click", ".letter-button", pickLetter);

  function pickLetter() {
    var letterPicked = $(this);

    letterPicked
      .removeClass("letter-button")
      .addClass("letter-disabled");

    letterPicked = letterPicked.html();
    handlePickedLetter(letterPicked);
  }

  function handlePickedLetter(letterPicked) {
    var resultMatches = [];
    var ind = currentWord.indexOf(letterPicked);

    // if letterPicked matches one or more letters in the current word
    // push all instances of that letter to resultMatches
    while (ind !== -1) {
      resultMatches.push(ind);
      ind = currentWord.indexOf(letterPicked, ind + 1);
    }

    //if resultMatches is greater than 0 proceed to place them in the dom
    if (resultMatches.length > 0) {
      var letterBlocks = document.getElementsByClassName("is-letter");
      resultMatches.map(function(num) {

        var domElem = document.createElement("span");
        domElem.innerHTML = currentWord[num].toUpperCase();
        letterBlocks[num].appendChild(domElem);
        displayCongratulatoryMessageOnWin();

      });
    //if letterBlock is not greater than 0 put the letter in the graveyard
    } else {
      var domElem = document.createElement("div");
      domElem.className = "grave-letter";
      domElem.innerHTML = letterPicked;
      document.getElementById("letter-graveyard").appendChild(domElem);
      hangmanGraphic.addBodyPart();
      displayGameOverMessageOnLose();
    }
  }

  function displayCongratulatoryMessageOnWin(){
    var correctlyGuessedLettersCount = $(".is-letter > span").length;
    if (correctlyGuessedLettersCount === currentWord.length) {
      $("#congratulatory_message").modal('show');
    }
  }

  function displayGameOverMessageOnLose() {
    var incorrectlyGuessedLettersCount = $("#letter-graveyard > div").length;
    //If number of letters guessed is equal to maxParts
    if (incorrectlyGuessedLettersCount === 7 ) {
      $("#gameover_message").modal('show');
      var gameOverMessage = "Uh oh. You took too many tries to guess the word. The correct word is - '" + currentWord + "'. Better luck next time.";
      $(".lead").text(gameOverMessage);
    }
  }

  /*
   * Hangman graphic with methods addBodyPart() and reset()
   */
  var hangmanGraphic = function () {
    var bodyParts = 0,
        maxParts = 7;
    return {
      addBodyPart : function () {
        if (bodyParts < maxParts) {
          ++bodyParts;
          $("#hangman-frame" + bodyParts).css("opacity", 1);
        }
      },

      reset : function () {
        $(".hangman-frames").css("opacity", 0);
        $("#hangman-frame0").css("opacity", 1);
        bodyParts = 0;
        resetAlphabetKeypad();
        removeGraveyardLetters();
        removeCorrectlyGuessedLetters();
        removeFillInTheBlanksAroundOldWord();
        hangmanWords();
      }
    };
  }();

  // Next 2 lines will be refactored into interface for
  //   losing a life and reseting the game
  $(".reset").on("click", hangmanGraphic.reset);

  function resetAlphabetKeypad(){
    $("#alphabet-keypad > .letter-disabled").each(function(index, element){
      $(element).removeClass().addClass('letter-button');
    });
  }

  function removeGraveyardLetters(){
    $('#letter-graveyard > div').each(function(index, element){
      $(element).remove();
    });
  }

  function removeCorrectlyGuessedLetters(){
    $('#word-to-guess').each(function(index, element){
      $(element).children().html('');
    });
  }

  function removeFillInTheBlanksAroundOldWord(){
    $("#word-to-guess").html('');
  }

  // adding dictionary and word filter //
  var movieSeed =
    [
      "the","of","and","a","to","in","is","you","that","it","he",
       "was","for","on","are","as","with","his","they","i","at","be",
       "this","have","from","or","one","had","by","word","but","not",
       "what","all","were","we","when","your","can","said","there",
       "use","an","each","which","she","do","how","their","if","will",
       "up","other","about","out","many","then","them","these","so",
       "some","her","would","make","like","him","into","time","has",
       "look","two","more","write","go","see","number","no","way",
       "could","people","my","than","first","water","been","call",
       "who","oil","its","now","find","long","down","day","did","get",
       "come","made","may","part","alien","jaws"
    ];
  // Change hangmanwords to draw from API search //
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  var hangmanWords = function(){
    var titleStart = wordSelect(movieSeed);

    var queryURL = "https://www.omdbapi.com/?t=" + titleStart + "&y=&plot=short&apikey=trilogy";

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(response){
      console.log(response);
      console.log(response.Title);
      setWordToBeGuessed(response.Title.toUpperCase());
      // return response.Title;
    });
  };

  function wordSelect(array) {
    var num = Math.floor(Math.random() * (array.length - 1));
    var word = array[num];
    return word;
  }

  function removeSpaces(str){
    var noSpaces = str.split("");

    return noSpaces.filter(a => alphabet.includes(a));
  }

  function setWordToBeGuessed(movie){

    //creates blocks in the DOM indicating where there are letters and spaces
    // word = word.split(" ");
    movie.split("").map(function(character) {
      var guessWordBlock = document.getElementById("word-to-guess");

      var domElem = document.createElement("div");

      if (alphabet.includes(character)) {
        domElem.className = "character-block is-letter";
        // console.log(character);
      } else if (character === " ") {
        domElem.innerHTML = character;
        domElem.className = "character-block c-block-span";
        console.log(character);
      } else {
        // domElem.className = "character-block span";
        // var domElem = document.createElement("span");
        domElem.innerHTML = character;
      }

      guessWordBlock.appendChild(domElem);
    });
    currentWord = removeSpaces(movie);
  }


  var currentWord;

  hangmanWords();
})();
