// constants and variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const nextTetrominoCanvas = document.getElementById("next-tetromino");
const nextTetrominoCtx = nextTetrominoCanvas.getContext("2d")

const content = document.getElementById("content");
const gameOverScreen = document.getElementById("game-over-screen");

const score = document.getElementById("score");
const gameOverScore = document.getElementById("game-over-score");
const level = document.getElementById("level");
const name = document.getElementById("name");
name.textContent = localStorage.getItem("current-player")

const leaderboard = document.getElementById("leaderboard");
const menuButton = document.getElementById("menu-button");

const audioContext = new window.AudioContext();
const volume = audioContext.createGain();

const squareSize = 25;

const boardHeight = 20;
const boardWidth = 10;
const startX = 3;
const startY = 0;
const nextTetrominoStartX = 1;
const nextTetrominoStartY = 1;

const pointsForNewLevel = 200;
let frameLengthMs = 1000;
let timeStart;

let tetromino;
let nextTetromino;
let currX;
let currY;

let isGameRunning = true;


// creating board
let board = [];
for (let i = 0; i < boardHeight; i++) {

    board[i] = [];

    for (let j = 0; j < boardWidth; j++) {
        board[i][j] = 0;
    }
}


// tetrominos array
const tetrominos = [
    {
        letter: "I",
        color: "#8DCFE3",
        array: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    },

    {
        letter: "J",
        color: "#8891E3",
        array: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ]
    },

    {
        letter: "L",
        color: "#F2B252",
        array: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ]
    },

    {
        letter: "O",
        color: "#bcbcb6",
        array: [
            [1, 1],
            [1, 1]
        ]
    },

    {
        letter: "S",
        color: "#7BD481",
        array: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ]
    },

    {
        letter: "Z",
        color: "#F27E7E",
        array: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ]
    },

    {
        letter: "T",
        color: "#CDB9EC",
        array: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ]
    }
]


// functions
function getRandTetromino() {
    let t = tetrominos[Math.floor(Math.random() * tetrominos.length)]
    return {
        letter: t.letter,
        color: t.color,
        array: t.array.map(arr => arr.slice())
    }
}

function createNewTetromino() {
    if (nextTetromino === undefined) {
        nextTetromino = getRandTetromino();
    }

    tetromino = nextTetromino;
    while (nextTetromino.letter === tetromino.letter) {
        nextTetromino = getRandTetromino();
    }

    currX = tetromino.letter === "O" ? startX + 1 : startX;
    currY = tetromino.letter === "I" ? startY - 1 : startY;

    if (!isValidTetrominoPosition()) {
        isGameRunning = false;
        setTimeout(gameOver, 1000);
        playGameOverSound();
        cancelAnimationFrame(animation);
    }

    drawNextTetromino();

    update();
}

function isValidTetrominoPosition(array = tetromino.array) {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[0].length; j++) {
            if (array[i][j]){

                let isInsideBoardByX = currX + j >= 0 && currX + j < boardWidth;
                let isInsideBoardByY = currY + i < boardHeight;

                if (!isInsideBoardByX || !isInsideBoardByY || board[currY + i][currX + j] !== 0) {
                    return false
                }
            }
        }
    }

    return true;
}

function drawNextTetromino() {

    let arrayLen = nextTetromino.array.length;

    let startX = nextTetrominoStartX;
    if (arrayLen === 2) {
        startX++;
    }

    let startY = nextTetrominoStartY;
    if (arrayLen !== 4) {
        startY++;
    }

    nextTetrominoCtx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < arrayLen; i++) {
        for (let j = 0; j < arrayLen; j++) {
            if (nextTetromino.array[i][j]) {
                nextTetrominoCtx.fillStyle = nextTetromino.color;
                nextTetrominoCtx.fillRect((startX + j) * squareSize, (startY + i) * squareSize, squareSize - 1, squareSize - 1);
            }
        }
    }
}

function placeTetromino() {
    playPlaceSound();

    for (let i = 0; i < tetromino.array.length; i++) {
        for (let j = 0; j < tetromino.array[0].length; j++) {
            if (tetromino.array[i][j]) {
                board[currY + i][currX + j] = tetromino.color;
            }
        }
    }

    removeFormedLines();
    createNewTetromino();
}

function removeFormedLines() {
    let soundPlayed = false;

    for (let k = boardHeight - 1; k >= 0; k--) {
        if (board[k].every(cell => !!cell)) {
            score.textContent = (parseInt(score.textContent) + 10).toString();

            for (let i = k; i > 0 ; i--) {
                for (let j = 0; j < boardWidth; j++) {
                    board[i][j] = board[i - 1][j];
                }
            }
            board[0].fill(0);

            k++;

            if (!soundPlayed) {
                playLinesRemovalSound()
                soundPlayed = true;
            }
        }
    }

    update();
}

function tetrominoFall() {
    currY++;
    score.textContent++;

    if (!isValidTetrominoPosition()) {
        currY--;
        placeTetromino();
    }

    update();
}

function rotateTetrominoArray() {
    let len = tetromino.array.length;
    return tetromino.array.map((row, i) => row.map((val, j) => tetromino.array[len - 1 - j][i]));
}

document.addEventListener("keydown", function(event) {
    if(!isGameRunning) {
        return;
    }

    switch (event.code) {
        case "KeyA": {
            currX--;

            if(!isValidTetrominoPosition()) {
                currX++;
            }

            update();
            break;
        }

        case "KeyD": {
            currX++;

            if(!isValidTetrominoPosition()) {
                currX--;
            }

            update();
            break;
        }

        case "KeyS": {
            tetrominoFall();
            break;
        }

        case "KeyW": {
            let rotatedArray = rotateTetrominoArray();

            if(isValidTetrominoPosition(rotatedArray)) {
                tetromino.array = rotatedArray;
            }

            update();
            break;
        }

        case "Space": {
            while (isValidTetrominoPosition()) {
                currY++;
                score.textContent++;
            }
            currY--;

            placeTetromino();

            break;
        }
    }
});

menuButton.addEventListener("click", function () {
    window.location.href = "index.html"
})

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < boardHeight; i++) {
        for (let j = 0; j < boardWidth; j++) {
            if (board[i][j]) {
                ctx.fillStyle = board[i][j];
                ctx.fillRect(j * squareSize, i * squareSize, squareSize - 1, squareSize - 1);
            }
        }
    }

    for (let i = 0; i < tetromino.array.length; i++) {
        for (let j = 0; j < tetromino.array[0].length; j++) {
            if (tetromino.array[i][j]) {
                ctx.fillStyle = tetromino.color;
                ctx.fillRect((currX + j) * squareSize, (currY + i) * squareSize, squareSize - 1, squareSize - 1);
            }
        }
    }

    level.textContent = Math.floor(score.textContent / pointsForNewLevel + 1).toString();
}

function playPlaceSound() {
    const oscillator = audioContext.createOscillator();

    oscillator.type = 'sawtooth';
    volume.gain.value = 0.1

    oscillator.frequency.setValueAtTime(73.42, audioContext.currentTime);


    oscillator.connect(volume);
    volume.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playLinesRemovalSound() {
    const oscillator = audioContext.createOscillator();

    oscillator.type = 'sawtooth';
    volume.gain.value = 0.1

    oscillator.frequency.setValueAtTime(164.81, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(174.61, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(185.0, audioContext.currentTime + 0.2);

    oscillator.connect(volume);
    volume.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playGameOverSound() {
    const oscillator = audioContext.createOscillator();

    oscillator.type = 'sawtooth';
    volume.gain.value = 0.1

    oscillator.frequency.setValueAtTime(82.41, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(77.78, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(87.31, audioContext.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(82.41, audioContext.currentTime + 0.3);

    oscillator.connect(volume);
    volume.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.4);
}

function loop(timestamp) {
    if (timeStart === undefined) {
        timeStart = timestamp;
    }

    const elapsed = timestamp - timeStart;

    if (elapsed > frameLengthMs * Math.max(1 - (level.textContent - 1) / 15, 0.1)) {
        timeStart = timestamp;
        tetrominoFall();
    }

    if (isGameRunning) {
        animation = requestAnimationFrame(loop);
    }
}

function gameOver() {
    gameOverScore.textContent = score.textContent;
    content.style.filter = "blur(3px)";
    gameOverScreen.style.visibility = "visible"

    let leaderboardArray = JSON.parse(localStorage.getItem("leaderboard"));

    let newPlayer = true;
    for (let i = 0; i < leaderboardArray.length; i++) {
        if (leaderboardArray[i].lbName === name.textContent) {
            leaderboardArray[i].lbScore = score.textContent;
            newPlayer = false;
            break;
        }
    }
    if (newPlayer) {
        leaderboardArray.push({
            lbName: name.textContent,
            lbScore: score.textContent
        })
    }

    leaderboardArray.sort((a, b) => {
        let aScore = parseInt(a.lbScore);
        let bScore = parseInt(b.lbScore);

        if (aScore === bScore) {
            return 0;
        } else {
            return aScore > bScore ? -1 : 1;
        }
    })

    localStorage.setItem("leaderboard", JSON.stringify(leaderboardArray));


    for (let i = 0; i < Math.min(leaderboardArray.length, 8); i++) {
        let row = leaderboard.tBodies[0].insertRow();
        row.insertCell().innerText = leaderboardArray[i].lbName;
        row.insertCell().innerText = leaderboardArray[i].lbScore;
    }
}

function init() {
    createNewTetromino();
    animation = requestAnimationFrame(loop);
}

let animation;
init();