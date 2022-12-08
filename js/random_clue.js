const clue = document.getElementById('question');
const answer = document.getElementById('answer');
const category = document.getElementById('category');
const value = document.getElementById('score');
const year = document.getElementById('question-counter');

let acceptingAnswers = false;
let currentQuestion = {};

fetch("https://jservice.io/api/random")
      .then(result => {
          return result.json();
      }).then(randomClue => {
          showRandomClue(randomClue[0]);
      })
      .catch(err => {
          console.error(err);
      });

getRandomClue = () => {
  fetch("https://jservice.io/api/random")
      .then(result => {
          return result.json();
      }).then(randomClue => {
          showRandomClue(randomClue[0]);
      })
      .catch(err => {
          console.error(err);
      });
}

showRandomClue = (randomClue) => {
  //console.log(randomClue);
  // Is this necessary? Maybe not
  document.getElementById("answer-text").value = "";
  clue.innerText = randomClue.question;
  currentQuestion.question = randomClue.question;
  category.innerText = randomClue.category.title.toUpperCase();
  currentQuestion.category = randomClue.category.title.toUpperCase();;
  currentQuestion.answer = randomClue.answer
    .replaceAll("<i>", "")
    .replaceAll("</i>", "")
    .replaceAll("\', '");
  value.innerText = "$" + randomClue.value;
  year.innerText = randomClue.airdate.substring(0, 4);
  acceptingAnswers = true;
}

submitAnswer = () => {
  if (!acceptingAnswers) return;
  acceptingAnswers = false;
  const textBox = document.getElementById("answer-text");
  const userAnswer = document.getElementById("answer-text").value;
  const correctAnswer = currentQuestion.answer;
  // Want to allow user to submit full name or just last name
  var lastName = "";
  if (correctAnswer.indexOf(" ") > -1) {
      lastName = currentQuestion.answer.split(" ");
      lastName = lastName[lastName.length - 1];
  } else {
      lastName = currentQuestion.answer;
  }

  const userAnswerStripped = sanitizeAnswer(userAnswer);
  const correctAnswerStripped = sanitizeAnswer(correctAnswer);
  const lastNameStripped = sanitizeAnswer(lastName);

  const classToApply = (userAnswerStripped == correctAnswerStripped 
    || userAnswerStripped == lastNameStripped) ? "correct" : "incorrect";
  if (classToApply === "correct") {
      textBox.value = correctAnswer;
  } else {
      textBox.value = correctAnswer;
  }
  
  textBox.classList.add(classToApply);
  setTimeout( () => {
      textBox.classList.remove(classToApply);
      textBox.value = "";
      getRandomClue();
  }, 1000);
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
  const answerStripped = dirtyAnswer
    .replaceAll(" ", "")
    .replaceAll(".", "")
    .replaceAll(",", "")
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replaceAll("'", "")
    .replaceAll("-", "")
    .replaceAll("!", "")
    .replaceAll("?", "")
    .replaceAll("a ", "")
    .replaceAll("the ", "")
    .replaceAll("&", "")
    .replaceAll("\"", "")
    .replaceAll("\'", "")
    .toLowerCase();
  return answerStripped;
}