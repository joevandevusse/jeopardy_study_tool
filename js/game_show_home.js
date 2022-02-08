submitGameId = () => {
    const dateSelected = document.getElementById("date-selected").value;
    const fileToFetch = "/games/date_to_game_id.json";
    fetch(fileToFetch)
        .then(response => {
            console.log(response);
            return response.json();
        })
        .then(data => {
            const gameId = data[dateSelected];
            localStorage.setItem("gameId", gameId);     
            window.location.assign("/pages/game_show.html")
        });
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