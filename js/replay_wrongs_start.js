getQuiz = () => {
  const userInput = document.getElementById("quiz-text").value;
  window.location.href = "/pages/replay_wrongs_game.html?category=" + userInput;
}

// Submit answer by "Enter" or click
document.onkeydown = function (e) {
  var buttonEvent = e || window.event;
  switch (buttonEvent.which || buttonEvent.keyCode) {
      case 13 : 
          e.preventDefault();
          getQuiz();
  }
}