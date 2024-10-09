// constants and variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const nextTetrominoCanvas = document.getElementById("next-tetromino");
const nextTetrominoCtx = nextTetrominoCanvas.getContext("2d")

const score = document.getElementById("score");
const level = document.getElementById("level");

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
        letter: "A",
        color: "#A55355",
        array: [
            [0, 1, 1, 1],
            [1, 1, 0, 1],
            [1, 1, 1, 1],
            [0, 1, 0, 1]
        ]
    },
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

document.addEventListener('keydown', function(event) {
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
        requestAnimationFrame(loop);
    }
}

function init() {
    createNewTetromino();
    requestAnimationFrame(loop);
}

init();