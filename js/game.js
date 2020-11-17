const question = document.getElementById('question');
const questionCounterText = document.getElementById("question-counter");
const scoreText = document.getElementById("score");

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [];

const currentURL = new URL(window.location.href);
const category = currentURL.searchParams.get('category');
const fileToFetch = "/questions/" + category + ".json";
console.log(fileToFetch)
var loc = window.location.pathname;
console.log(loc);
localStorage.setItem("category", category);
fetch(fileToFetch)
    .then(result => {
        return result.json();
    }).then(loadedQuestions => {
        questions = loadedQuestions;
        startGame();
    })
    .catch(err => {
        console.error(err);
    });

const form = document.getElementById("form");
const log = document.getElementById("log");

// Game constants - not really constant because changed later
const CORRECT_BONUS = 10;
var MAX_QUESTIONS = 10;

startGame = () => {
    // Set game questions to total number of questions
    MAX_QUESTIONS = questions.length;
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    getNewQuestion();
};

getNewQuestion = () => {
    if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem("mostRecentScore", score);
        // Go to the end page
        return window.location.assign('/pages/end.html');
    }

    // Empty form text
    document.getElementById("answer-text").value = "";
    // Update question counter on HUD
    questionCounter++;
    questionCounterText.innerText = questionCounter + "/" + MAX_QUESTIONS;

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerText = currentQuestion.question;

    availableQuestions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

submitAnswer = () => {
    if (!acceptingAnswers) return;
    acceptingAnswers = false;
    const textBox = document.getElementById("answer-text");
    const userAnswer = document.getElementById("answer-text").value;
    const correctAnswer = currentQuestion["answer"];
    // Want to allow user to submit full name or just last name
    var lastName = "";
    if (correctAnswer.indexOf(" ") > -1) {
        lastName = currentQuestion["answer"].split(" ");
        lastName = lastName[lastName.length - 1];
    } else {
        lastName = currentQuestion["answer"]
    }

    const userAnswerStripped = sanitizeAnswer(userAnswer);
    const correctAnswerStripped = sanitizeAnswer(correctAnswer);
    const lastNameStripped = sanitizeAnswer(lastName);

    const classToApply = (userAnswerStripped == correctAnswerStripped || userAnswerStripped == lastNameStripped) ? "correct" : "incorrect";
    if (classToApply === "correct") {
        incrementScore(CORRECT_BONUS);
    } else {
        textBox.value = correctAnswer;
    }
    
    textBox.classList.add(classToApply);
    setTimeout( () => {
        textBox.classList.remove(classToApply);
        textBox.value = "";
        getNewQuestion();
    }, 1000);
};

incrementScore = num => {
    score += num;
    scoreText.innerText = score;
};

//Submit answer by "Enter" or click
document.onkeydown = function (e) {
    var buttonEvent = e || window.event;
    switch (buttonEvent.which || buttonEvent.keyCode) {
        case 13 : 
            e.preventDefault();
            submitAnswer();
    }
}

sanitizeAnswer = dirtyAnswer => {
    const userAnswerStripped = dirtyAnswer.replaceAll(" ", "").replaceAll(".", "").replaceAll(",", "").replaceAll("(", "").replaceAll(")", "").replaceAll("'", "").replaceAll("-", "").replaceAll("!", "").replaceAll("?", "").toLowerCase();
    return userAnswerStripped;
}