const SINGLE_JEOAPRDY = "sj";
const DOUBLE_JEOAPRDY = "dj";
const FINAL_JEOAPRDY = "fj";

var gameJSON = {};

class TriviaGameShow {
    constructor(element, options={}) {

        // Database
        this.categories = [];
        this.clues = {};

        // State
        this.currentClue = null;
        this.score = 0;
        this.clueCount = 0;

        // Elements
        this.boardElement = element.querySelector(".board");
        this.titleElement = element.querySelector(".title");
        this.scoreCountElement = element.querySelector(".score-count");
        this.formElement = element.querySelector("form");
        this.inputElement = element.querySelector("input[name=user-answer]");
        this.modalElement = element.querySelector(".card-modal");
        this.clueTextElement = element.querySelector(".clue-text");
        this.resultElement = element.querySelector(".result");
        this.resultTextElement = element.querySelector(".result_correct-answer-text");
        this.successTextElement = element.querySelector(".result_success");
        this.failTextElement = element.querySelector(".result_fail");
        this.passTextElement = element.querySelector(".result_pass");
    }

    initGame(json, round) {
        this.updateScore(0);
        this.fetchCategories(json, round);

        this.boardElement.addEventListener("click", event => {
            if (event.target.dataset.clueId) {
                this.handleClueClick(event);
            }
        })

        this.formElement.addEventListener("submit", event => {
            this.handleFormSubmit(event, round);
        })
    }

    updateScore(change, isPass, isCorrect) {
        if (!isPass) {
            if (isCorrect) {
                this.score += change;
            } else {
                this.score -= change;
            }
        }
        if (this.score >= 0) {
            this.scoreCountElement.textContent = "$" + this.score;
        } else {
            let scoreAbs = this.score * -1;
            this.scoreCountElement.textContent = "-$" + scoreAbs;
        }
        
    }

    fetchCategories(json, round) {
        // Single vs. Double Jeopardy
        if (round === SINGLE_JEOAPRDY) {
            this.titleElement.textContent = "J! Study Tool - Single Jeopardy";
            this.clues = json.clues_sj;
            this.categories = json.categories_sj;
        } else if (round === DOUBLE_JEOAPRDY) {
            this.titleElement.textContent = "J! Study Tool - Double Jeopardy";
            this.removeOldCategories();
            this.clues = json.clues_dj;
            this.categories = json.categories_dj;
        } else {
            this.titleElement.textContent = "J! Study Tool - Final Jeopardy";
            this.removeOldCategories();
            this.clues = json.clues_Fj;
            this.categories = json.categories_fj;
            //handleFinalJeopardy();
        }

        this.categories.forEach(c => {
            this.renderCategory(c);
        });
    }

    removeOldCategories() {
        document.getElementsByClassName("column")[0].remove();
        document.getElementsByClassName("column")[0].remove();
        document.getElementsByClassName("column")[0].remove();
        document.getElementsByClassName("column")[0].remove();
        document.getElementsByClassName("column")[0].remove();
        document.getElementsByClassName("column")[0].remove();
    }

    renderCategory(category) {
        let column = document.createElement("div");
        column.classList.add("column");

        column.innerHTML = (
            `<header>${category.title}</header><ul></ul>`
        )
        var ul = column.querySelector("ul");
        category.clues.forEach(clueId => {
            var clue = this.clues[clueId];
            ul.innerHTML += `<li><button data-clue-id=${clueId}>$${clue.value}</button></li>`
        }) 

        this.boardElement.appendChild(column);
    }

    handleClueClick(event) {
        // Increment clue count
        this.clueCount += 1;
        var clue = this.clues[event.target.dataset.clueId];

        // Mark this clue/button as used
        event.target.classList.add("used");

        // Clear out the input field
        this.inputElement.value = "";

        // Update current clue
        this.currentClue = clue;

        // Update the text
        this.clueTextElement.textContent = this.currentClue.question;
        this.resultTextElement.textContent = this.currentClue.answer;

        // Hide the result
        this.modalElement.classList.remove("showing-result");

        // Show the modal
        this.modalElement.classList.add("visible");
        this.inputElement.focus();
    }

    // Currently not working
    handleFinalJeopardy() {
        // Just like the above method
        var clue = this.clues["0-0"];
        this.inputElement.value = "";
        this.currentClue = clue;
        this.clueTextElement.textContent = this.currentClue.question;
        this.resultTextElement.textContent = this.currentClue.answer;
        this.modalElement.classList.remove("showing-result");
        this.modalElement.classList.add("visible");
        this.inputElement.focus();
    }

    handleFormSubmit(event, round) {
        event.preventDefault();
        var isPass = this.inputElement.value === "";
        var isCorrect = this.checkCorrectness(this.inputElement.value, this.currentClue.answer);
        var valueToPass = this.currentClue.value;
        // For some reason, update is called twice in Double Jeopardy
        // Setting this to 0 only affects one of the 2 calls fixing the issue
        // Note - I'd like to make this cleaner at some point
        if (round === "dj") {
          valueToPass = 0;
        }
        this.updateScore(valueToPass, isPass, isCorrect);

        // Show answer
        this.revealAnswer(isPass, isCorrect);
    }

    checkCorrectness(userAnswer, correctAnswer) {
      var userAnswerStripped = this.cleanseAnswer(userAnswer);
      var correctAnswerStripped = this.cleanseAnswer(correctAnswer);
      // If normal or stripped are equal, return true
      if (userAnswer === correctAnswer || userAnswerStripped === correctAnswerStripped) {
        return true;
      }
      // Check parentheses
      if (correctAnswer.includes("(") && correctAnswer.includes(")")) {
        // Parentheses to start answer
        if (correctAnswer.indexOf("(") === 0) {
          var correctAnswerNoParentheses = correctAnswer.substring(correctAnswer.indexOf(")") + 1);
          var noParensStripped = this.cleanseAnswer(correctAnswerNoParentheses);
          if (userAnswer === correctAnswerNoParentheses || userAnswerStripped === noParensStripped) {
            return true;
          }
        } else if (correctAnswer.indexOf(")") === correctAnswer.length - 1) {
          // Parentheses to end answer
          var correctAnswerNoParentheses = correctAnswer.substring(0, correctAnswer.indexOf("("));
          var noParensStripped = this.cleanseAnswer(correctAnswerNoParentheses);
          if (userAnswer === correctAnswerNoParentheses || userAnswerStripped === noParensStripped) {
            return true;
          }
        }
      }
      // Names (with 2 words at least)
      if (correctAnswer.split(" ").length === 2 || userAnswer.split(" ").length === 2) {
        if (correctAnswer.split(" ").length === 2 && userAnswer.split(" ").length === 1) {
          var correctPart1 = correctAnswer.split(" ")[0];
          var correctPart1Stripped = this.cleanseAnswer(correctPart1);
          var correctPart2 = correctAnswer.split(" ")[1];
          var correctPart2Stripped = this.cleanseAnswer(correctPart2);
          if (userAnswerStripped === correctPart1Stripped || userAnswerStripped === correctPart2Stripped) {
            return true;
          }
        } else if (userAnswer.split(" ").length === 2 && correctAnswer.split(" ").length === 1) {
          var userPart1 = userAnswer.split(" ")[0];
          var userPart1Stripped = this.cleanseAnswer(userPart1);
          var userPart2 = userAnswer.split(" ")[1];
          var userPart2Stripped = this.cleanseAnswer(userPart2);
          if (correctAnswerStripped === userPart1Stripped || correctAnswerStripped === userPart2Stripped) {
            return true;
          }
        }
      }
      return false;
    }

    cleanseAnswer(dirtyAnswer) {
      const answerStripped = dirtyAnswer
        .replaceAll(".", "")
        .replaceAll(",", "")
        .replaceAll("(", "")
        .replaceAll(")", "")
        .replaceAll("'", "")
        .replaceAll("-", "")
        .replaceAll("!", "")
        .replaceAll("?", "")
        .replaceAll("a ", "")
        .replaceAll("an ", "")
        .replaceAll("the ", "")
        .replaceAll("to ", "")
        .replaceAll("and ", "")
        .replaceAll("&", "")
        .replaceAll("\"", "")
        .replaceAll("\'", "")
        .replaceAll(" ", "")
        .toLowerCase();
        return answerStripped;
    }

    revealAnswer(isPass, isCorrect) {
        // Show the individual success/fail/pass case
        if (isPass) {
            this.passTextElement.style.display = "block";
            this.successTextElement.style.display = "none";
            this.failTextElement.style.display = "none";
        } else {
            this.passTextElement.style.display = "none";
            this.successTextElement.style.display = isCorrect ? "block" : "none";
            this.failTextElement.style.display = !isCorrect ? "block" : "none";
        }
        // Show the whole result container
        this.modalElement.classList.add("showing-result");

        // Disappear after a little bit
        setTimeout(() => {
            this.modalElement.classList.remove("visible");
        }, 3000);
    
        // Reset game for Double Jeopardy
        if (this.clueCount === 30) {
            this.initGame(gameJSON, DOUBLE_JEOAPRDY);
        } else if (this.clueCount === 60) {
            this.initGame(gameJSON, FINAL_JEOPARDY);
        }
    }
}

getGame = (gameId) =>  {
    var xhr = new XMLHttpRequest();
    //const proxyURL = "https://cors-anywhere.herokuapp.com/";
    xhr.open(
        "GET", 
        "http://www.j-archive.com/showgame.php?game_id=" + gameId, 
        true
    );
    xhr.responseType = "document";

    xhr.onload = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Parse J! Archive page source
            var response = xhr.responseXML;
            // Parse categories
            var categories = response.querySelectorAll(".category_name");
            var categoryCounter = 0;
            while (categoryCounter < 13) {
                var categoryToAppend = {}
                categoryToAppend["title"] = categories[categoryCounter].innerHTML.replaceAll("&amp;", "&");
                categoryToAppend["clues"] = [categoryCounter % 6 + "-0", categoryCounter % 6 + "-1", categoryCounter % 6 + "-2", categoryCounter % 6 + "-3", categoryCounter % 6 + "-4"]
                if (categoryCounter < 6) {
                    gameJSON["categories_sj"].push(categoryToAppend);
                } else if (categoryCounter < 12) {
                    gameJSON["categories_dj"].push(categoryToAppend);
                } else {
                    categoryToAppend["clues"] = ["0-0"];
                    gameJSON["categories_fj"].push(categoryToAppend);
                }
                categoryCounter += 1;
            }
            // Parse clue answers
            var answers = response.querySelectorAll("table tr td");
            var clue_answers = [];
            var answerCount = 0;
            answers.forEach(e => {
                var onMouseOver = e.innerHTML;
                if (onMouseOver.includes("correct_response")) {
                    var correctLoc = onMouseOver.indexOf("correct_response");                        
                    var choppedDown = onMouseOver.substring(correctLoc);
                    var answerLoc = choppedDown.indexOf(">");
                    var choppedDown2 = choppedDown.substring(answerLoc + 1);
                    var endOfAnswerLoc = choppedDown2.indexOf("</em>")
                    var finalChop = choppedDown2.substring(0, endOfAnswerLoc);
                    var cleanAnswer = finalChop
                      .replaceAll("&quot;", "\"")
                      .replaceAll("<i>", "")
                      .replaceAll("</i>", "")
                      .replaceAll("\\", "")
                      .replaceAll("&amp;", "&");
                    answerCount += 1
                    if (answerCount % 2 == 1) {
                        clue_answers.push(cleanAnswer);
                    }
                }
            });
            // Parse clue questions
            var clues = response.querySelectorAll(".clue_text");
            var clue_questions = [];
            clues.forEach(e => {
                var clue = e.innerHTML;
                if (clue.includes("href")) {
                    var start = clue.indexOf("<a");
                    var end = clue.indexOf("blank\">");
                    var newClue = clue.substring(0, start) + "<image> " + clue.substring(end + 7, clue.length);
                    clue = newClue;
                }
                // Remove a second href if there is one
                if (clue.includes("href")) {
                    var start = clue.indexOf("<a");
                    var end = clue.indexOf("blank\">");
                    var newClue = clue.substring(0, start) + "<image> " + clue.substring(end + 7, clue.length);
                    clue = newClue;
                }
                var cleanClue = clue.replaceAll("<br>", "").replaceAll("&amp;", "&")
                    .replaceAll("</a>", "").replaceAll("<span class=\"nobreak\">--</span>", "-");
                clue_questions.push(cleanClue);
            });
            // Build JSON
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 5; j++) {
                    var addClueSJ = {};
                    addClueSJ["question"] = clue_questions[j * 6 + i]
                    addClueSJ["answer"] = clue_answers[j * 6 + i]
                    addClueSJ["value"] = (j + 1) * 200;
                    addClueSJ["is_dd"] = false;
                    gameJSON["clues_sj"][i + "-" + j] = addClueSJ;
                    var addClueDJ = {};
                    addClueDJ["question"] = clue_questions[j * 6 + i + 30];
                    addClueDJ["answer"] = clue_answers[j * 6 + i + 30];
                    addClueDJ["value"] = (j + 1) * 400;
                    addClueDJ["is_dd"] = false;
                    gameJSON["clues_dj"][i + "-" + j] = addClueDJ;
                }
            }
            var addClueFJ = {};
            addClueFJ["question"] = clue_questions[60];
            addClueFJ["answer"] = clue_answers[60];
            addClueFJ["value"] = 10000;
            addClueFJ["is_dd"] = false;
            gameJSON["clues_fj"]["0-0"] = addClueFJ;

            // Start the game
            const game = new TriviaGameShow(document.querySelector(".app"), {});
            game.initGame(gameJSON, SINGLE_JEOAPRDY);
        }
    };

    xhr.onerror = function() {
        console.error(xhr.status, xhr.statusText);
    };

    xhr.send();
}

// Get whatever game the user wants to play
//var userGameID = prompt("Please enter the gameID of the Jeopardy! game you'd like to play:\nCurrently supports Season 37 (gameID: 6821-6942)\n(For reference - gameID: 6922 was played on 1/27/2021)");
var userGameID = localStorage.getItem('gameId');
const fileToFetch = "/games/" + userGameID + ".json";

fetch(fileToFetch)
    .then(result => {
        return result.json();
    }).then(loadedJSON => {
        gameJSON = loadedJSON;
        const game = new TriviaGameShow(document.querySelector(".app"), {});
        game.initGame(gameJSON, SINGLE_JEOAPRDY);
    })
    .catch(err => {
        console.error(err);
    });


