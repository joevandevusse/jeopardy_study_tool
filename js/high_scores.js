const highScoresList = document.getElementById("high-scores-list");
const highScores = JSON.parse(localStorage.getItem("highScores")) || [];

highScoresList.innerHTML = 
    highScores.map(score => {
        var listItem = "<li class='high-score'>" + score.name + " - " + score.score + "%" + "</li>"
        return listItem;
        // Join with empty string to get a string data type
    }).join("");