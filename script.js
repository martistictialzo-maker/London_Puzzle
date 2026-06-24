const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const board = document.getElementById("board");
const timerText = document.getElementById("timer");

const SIZE = 3;
const MOVE_DELAY_MS = 92;

let currentImage = "";
let pieces = [];

let tiles = [];
let emptyIndex = 8;

let undoStack = [];

let timer;
let startTime;

// ============================
// START PUZZLE
// ============================

function startPuzzle(type) {

    currentImage = `images/${type}.png`;
    board.style.backgroundImage = `url('${currentImage}')`;
    menuScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    loadAndSliceImage();
}

// ============================
// IMAGE SLICING
// ============================

function loadAndSliceImage() {

    pieces = [];

    const img = new Image();

    img.onload = () => {

        const pieceWidth = img.width / SIZE;
        const pieceHeight = img.height / SIZE;

        for (let row = 0; row < SIZE; row++) {

            for (let col = 0; col < SIZE; col++) {

                const canvas = document.createElement("canvas");

                canvas.width = pieceWidth;
                canvas.height = pieceHeight;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(
                    img,
                    col * pieceWidth,
                    row * pieceHeight,
                    pieceWidth,
                    pieceHeight,
                    0,
                    0,
                    pieceWidth,
                    pieceHeight
                );

                pieces.push(canvas.toDataURL());
            }
        }

        createPuzzle();
    };

    img.src = currentImage;
}

// ============================
// CREATE PUZZLE
// ============================

function createPuzzle() {

    undoStack = [];

    tiles = [0,1,2,3,4,5,6,7,8];

    shuffleSolvable();

    render();

    startTimer();

    document
        .getElementById("winBox")
        .classList.add("hidden");
}

// ============================
// SHUFFLE
// ============================

function shuffleSolvable() {

    do {

        tiles = [0,1,2,3,4,5,6,7,8];

        for (let i = tiles.length - 1; i > 0; i--) {

            const j = Math.floor(
                Math.random() * (i + 1)
            );

            [tiles[i], tiles[j]] =
            [tiles[j], tiles[i]];
        }

    } while (
        !isSolvable(tiles) ||
        checkWin()
    );

    emptyIndex = tiles.indexOf(8);
}

function isSolvable(arr) {

    let inv = 0;

    for (let i = 0; i < arr.length; i++) {

        for (let j = i + 1; j < arr.length; j++) {

            if (
                arr[i] === 8 ||
                arr[j] === 8
            ) continue;

            if (arr[i] > arr[j])
                inv++;
        }
    }

    return inv % 2 === 0;
}

// ============================
// RENDER
// ============================

function render() {

    board.innerHTML = "";

    tiles.forEach((pieceIndex, boardIndex) => {

        const tile =
            document.createElement("div");

        tile.classList.add("tile");

        if (pieceIndex === 8) {

            tile.classList.add("empty");

        } else {

            const img =
                document.createElement("img");

            img.src = pieces[pieceIndex];

            img.draggable = false;

            img.style.width = "100%";
            img.style.height = "100%";
            img.style.display = "block";
            img.style.objectFit = "cover";
            img.style.pointerEvents = "none";

            tile.appendChild(img);
        }

        tile.addEventListener(
            "click",
            () => move(boardIndex)
        );

        board.appendChild(tile);
    });
}

// ============================
// MOVE
// ============================

function move(index) {

    if (!adjacent(index, emptyIndex))
        return;

    setTimeout(() => {

        undoStack.push([...tiles]);

        [tiles[index], tiles[emptyIndex]] =
        [tiles[emptyIndex], tiles[index]];

        emptyIndex = index;

        render();

        if (checkWin()) {

            clearInterval(timer);

            document
                .getElementById("winBox")
                .classList.remove("hidden");
        }

    }, MOVE_DELAY_MS);
}

// ============================
// ADJACENT
// ============================

function adjacent(a, b) {

    const r1 = Math.floor(a / SIZE);
    const c1 = a % SIZE;

    const r2 = Math.floor(b / SIZE);
    const c2 = b % SIZE;

    return (
        Math.abs(r1 - r2) +
        Math.abs(c1 - c2)
    ) === 1;
}

// ============================
// CHECK WIN
// ============================

function checkWin() {

    for (let i = 0; i < 9; i++) {

        if (tiles[i] !== i)
            return false;
    }

    return true;
}

// ============================
// TIMER
// ============================

function startTimer() {

    clearInterval(timer);

    startTime = Date.now();

    timer = setInterval(() => {

        const sec =
            ((Date.now() - startTime) / 1000)
            .toFixed(1);

        timerText.textContent =
            `Time: ${sec}s`;

    }, 100);
}

// ============================
// UNDO
// ============================

document
.getElementById("undoBtn")
.onclick = () => {

    if (!undoStack.length)
        return;

    tiles = undoStack.pop();

    emptyIndex =
        tiles.indexOf(8);

    render();
};

// ============================
// RESET
// ============================

document
.getElementById("resetBtn")
.onclick = () => {

    createPuzzle();
};

// ============================
// RETRY
// ============================

document
.getElementById("retryBtn")
.onclick = () => {

    createPuzzle();
};

// ============================
// BACK
// ============================

document
.getElementById("backBtn")
.onclick = () => {

    clearInterval(timer);

    gameScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
};