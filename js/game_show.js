let json = {};
const SINGLE_JEOAPRDY = "sj";
const DOUBLE_JEOAPRDY = "dj";
const FINAL_JEOAPRDY = "fj";

fetch('/js/test.json')
    .then(result => {
        return result.json();
    }).then(loadedJSON => {
        json = loadedJSON;
        const game = new TriviaGameShow(document.querySelector(".app"), {});
        game.initGame(json, SINGLE_JEOAPRDY);
    })
    .catch(err => {
        console.error(err);
    });

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i - 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return x;
}

class TriviaGameShow {
    constructor(element, options={}) {
        // https://jservice.io/search
        this.useCategoryIds = options.useCategoryIds || [1892, 4483, 88, 218];
        
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
        var id = 6923;
        var jArchiveJSON = this.getGame(id);
        //console.log(json);
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

    getGame(gameId) {
        var xhr = new XMLHttpRequest();
        //const proxyURL = "https://cors-anywhere.herokuapp.com/";
        xhr.open("GET", "http://www.j-archive.com/showgame.php?game_id=" + gameId, true);
        xhr.responseType = "document";

        var gameJSON = {}
        gameJSON["categories_sj"] = []
        gameJSON["categories_dj"] = []
        gameJSON["categories_fj"] = []
        gameJSON["clues_sj"] = {}
        gameJSON["clues_dj"] = {}
        gameJSON["clues_fj"] = {}
        console.log(gameJSON);

        xhr.onload = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                // Parse J! Archive page source
                var response = xhr.responseXML;
                // Parse categories
                var categories = response.querySelectorAll(".category_name");
                var categoryCounter = 0;
                while (categoryCounter < 13) {
                    ["0-0", "0-1", "0-2", "0-3", "0-4"]
                    var categoryToAppend = {}
                    categoryToAppend["title"] = categories[categoryCounter].innerHTML;
                    categoryToAppend["clues"] = [categoryCounter % 6 + "-0", categoryCounter % 6 + "-1", categoryCounter % 6 + "-2", categoryCounter % 6 + "-3", categoryCounter % 6 + "-4"]
                    if (categoryCounter < 6) {
                        gameJSON["categories_sj"].push(categoryToAppend);
                    } else if (categoryCounter < 12) {
                        gameJSON["categories_dj"].push(categoryToAppend);
                    } else {
                        gameJSON["categories_fj"].push(categoryToAppend);
                    }
                    categoryCounter += 1;
                }
                console.log(categories);
            }
        };

        xhr.onerror = function() {
            console.error(xhr.status, xhr.statusText);
        };

        xhr.send();
        return gameJSON;
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
        })
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
        this.clueCount = this.clueCount + 10;

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
        friendlyAnswer = friendlyAnswer.replace("<i>", "");
        friendlyAnswer = friendlyAnswer.replace("</i>", "");
        // Remove spaces
        friendlyAnswer.replace(/"/g, "");
        // Remove "a" article
        friendlyAnswer = friendlyAnswer.replace(/^a /, "");
        // Remove "an" article
        friendlyAnswer = friendlyAnswer.replace(/^an /, "");    
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
            this.initGame(json, DOUBLE_JEOAPRDY);
        } else if (this.clueCount === 60) {
            this.initGame(json, FINAL_JEOPARDY);
        }
    }
}

//const game = new TriviaGameShow(document.querySelector(".app"), {});
//game.initGame();