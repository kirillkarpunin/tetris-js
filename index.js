let playerName = document.getElementById("player-name");
let playButton = document.getElementById("play-button")

playerName.addEventListener("keydown", function(event) {
    if (event.code === "Enter") {
        event.preventDefault();
        playButton.click();
    }
});

if (localStorage.getItem("leaderboard") === null) {
    localStorage.setItem("leaderboard", JSON.stringify([]))
}

playButton.addEventListener("click", function() {
    if (playerName.value.length !== 0) {
        localStorage.setItem("current-player", playerName.value);
        window.location.href = "game.html"
    }
})
