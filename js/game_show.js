const SINGLE_JEOAPRDY = "sj";
const DOUBLE_JEOAPRDY = "dj";
const FINAL_JEOAPRDY = "fj";

var gameJSON = {};
gameJSON["categories_sj"] = [];
gameJSON["categories_dj"] = [];
gameJSON["categories_fj"] = [];
gameJSON["clues_sj"] = {};
gameJSON["clues_dj"] = {};
gameJSON["clues_fj"] = {};

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
            this.handleFormSubmit(event);
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
        this.scoreCountElement.textContent = "$" + this.score;
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
            this.clues = json.clues_Fj;
            this.categories = json.categories_fj;
            handleFinalJeopardy();
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
       //console.log(category);
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

    handleFormSubmit(event) {
        event.preventDefault();
        var isPass = this.inputElement.value === "";
        var isCorrect = this.cleanseAnswer(this.inputElement.value) === this.cleanseAnswer(this.currentClue.answer);
        this.updateScore(this.currentClue.value, isPass, isCorrect);

        // Show answer
        this.revealAnswer(isPass, isCorrect);
    }

    cleanseAnswer(input) {
        var friendlyAnswer = input.toLowerCase();
        friendlyAnswer = friendlyAnswer.replaceAll("<i>", "");
        friendlyAnswer = friendlyAnswer.replaceAll("</i>", "");
        // Remove spaces
        friendlyAnswer.replace(/"/g, "");
        // Remove "a" article
        friendlyAnswer = friendlyAnswer.replace(/^a /, "");
        // Remove "an" article
        friendlyAnswer = friendlyAnswer.replace(/^an /, "");  
        // Remove "an" article
        friendlyAnswer = friendlyAnswer.replace(/^the /, "");  
        // Remove quotes
        friendlyAnswer = friendlyAnswer.replaceAll("\"", "");
        friendlyAnswer = friendlyAnswer.replaceAll("\'", "");
        // Remove parens
        //friendlyAnswer = friendlyAnswer.replaceAll("(", "");
        //friendlyAnswer = friendlyAnswer.replaceAll(")", "");
        // Remove optional text between parens
        friendlyAnswer = friendlyAnswer.replaceAll(/ *\([^)]*\) */g, "");
        console.log(friendlyAnswer);
        return friendlyAnswer.trim();
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
                    var cleanAnswer = finalChop.replaceAll("&quot;", "\"").replaceAll("<i>", "").replaceAll("</i>", "").replaceAll("\\", "").replaceAll("&amp;", "&");
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
var userGameID = prompt("Please enter the gameID of the Jeopardy! game you'd like to play:\n (For reference - game: 6922 was played on 1/27/2021)");
//getGame(6922);
getGame(userGameID);
