submitGameId = () => {
    const gameId = document.getElementById("answer-text").value;
    localStorage.setItem("gameId", gameId);     
    window.location.assign("/pages/game_show.html")
}