submitGameId = () => {
    const gameId = document.getElementById("answer-text").value;
    localStorage.setItem("gameId", gameId);     
    window.location.assign("/pages/game_show.html")
}

// Submit by pressing "Enter" or clicking "Play"
document.onkeydown = function (e) {
    var buttonEvent = e || window.event;
    switch (buttonEvent.which || buttonEvent.keyCode) {
        case 13 : 
            e.preventDefault();
            submitGameId();
    }
}