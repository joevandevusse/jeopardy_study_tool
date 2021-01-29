let json = {};

fetch('/js/test.json')
    .then(result => {
        return result.json();
    }).then(loadedJSON => {
        json = loadedJSON;
        //initGame();
        const game = new TriviaGameShow(document.querySelector(".app"), {});
        game.initGame(json);
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
        
        // Elements
        this.boardElement = element.querySelector(".board");
        this.scoreCountElement = element.querySelector(".score-count");
        this.formElement = element.querySelector("form");
        this.inputElement = element.querySelector("input[name=user-answer]");
        this.modalElement = element.querySelector(".card-modal");
        this.clueTextElement = element.querySelector(".clue-text");
        this.resultElement = element.querySelector(".result");
        this.resultTextElement = element.querySelector(".result_correct-answer-text");
        this.successTextElement = element.querySelector(".result_success");
        this.failTextElement = element.querySelector(".result_fail");
    }

    initGame(json) {
        console.log(json);
        this.updateScore(0);
        this.fetchCategories(json);

        this.boardElement.addEventListener("click", event => {
            if (event.target.dataset.clueId) {
                this.handleClueClick(event);
            }
        })

        this.formElement.addEventListener("submit", event => {
            this.handleFormSubmit(event);
        })
    }

    updateScore(change) {
        this.score += change;
        this.scoreCountElement.textContent = this.score;
    }

    fetchCategories(json) {
        // const proxyurl = "https://cors-anywhere.herokuapp.com/";
        // const categories = this.useCategoryIds.map(categoryId => {
        //     return new Promise((resolvve, reject) => {
        //         fetch(proxyurl + 'https://jservice.io/app/category?id=${categoryId}')
        //         .then(response => response.json()).then(data => {
        //             resolve(data)
        //         })
        //     })
        // })

        // Promise.all(categories).then(results => {
        //     results.forEach((category, categoryIndex) => {
        //         var newCategory = {
        //             title: category.title,
        //             clues: []
        //         }

        //         var clues = shuffle(result.clues).splice(0, 5).forEach((clue, index) => {
        //             var clueId = categoryIndex + "-" + index;
        //             newCategory.clues.push(clueId);
        //             this.clues[clueId] = {
        //                 question: clue.question,
        //                 answer: clue.answer,
        //                 value: (index + 1) * 100
        //             }
        //         })
        //         this.categories.push(newCategory);
        //     })
        // })

        this.clues = json.clues;
        this.categories = json.categories;

        this.categories.forEach(c => {
            this.renderCategory(c);
        })
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
            ul.innerHTML += `<li><button data-clue-id=${clueId}>${clue.value}</button></li>`
        }) 

        this.boardElement.appendChild(column);
    }

    handleClueClick(event) {
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

    handleFormSubmit(event) {
        event.preventDefault();

        var isCorrect = this.inputElement.value === this.currentClue.answer;
        if (isCorrect) {
            this.updateScore(this.currentClue.value);
        }

        // Show answer
        this.revealAnswer(isCorrect);
    }

    revealAnswer(isCorrect) {
        // Show the individual success/fail case
        this.successTextElement.style.display = isCorrect ? "block" : "none";
        this.failTextElement.style.display = !isCorrect ? "block" : "none";

        // Show the whole result container
        this.modalElement.classList.add("showing-result");

        // Disappear after a little bit
        setTimeout(() => {
            this.modalElement.classList.remove("visible");
        }, 3000);
    }
}

//const game = new TriviaGameShow(document.querySelector(".app"), {});
//game.initGame();