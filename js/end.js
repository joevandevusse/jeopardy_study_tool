const userName = document.getElementById("username");
const saveScoreBtn = document.getElementById("save-score-btn");
const finalScore = document.getElementById("final-score");
const mostRecentScore = localStorage.getItem("mostRecentScore");
const highScores = JSON.parse(localStorage.getItem("highScores")) || [];

const MAX_HIGH_SCORES = 5;

finalScore.innerText = mostRecentScore;

window.onload = () => {
    const category = localStorage.getItem("category");
    const playAgainURL = "/pages/game.html?category=" + category;
    document.getElementById("play-again").href = playAgainURL;
};

userName.addEventListener("keyup", () => {
    saveScoreBtn.disabled = !userName.value;
});

saveHighScore = (e) => {
    e.preventDefault();

    const score = {
        score: mostRecentScore,
        name: userName.value
    };
    
    highScores.push(score);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(MAX_HIGH_SCORES);
    localStorage.setItem("highScores", JSON.stringify(highScores));
    window.location.assign("/");
};