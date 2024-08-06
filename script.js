// GLOBAL VARIABLES
let board = [];
let score = 0;
const tile = { width: 20, height: 20 };
const maxY = 19;
const minX = 0;
const maxX = 9;

// CLASS FOR BOARD
class Board{
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    init(id) {
        const canvasBoard = document.getElementById(id);
        canvasBoard.width = this.width;
        canvasBoard.height = this.height;

        const ctx = canvasBoard.getContext("2d");
        return ctx;
    }
    draw(ctx, Y, X) {
        for (let y = 0; y <= Y; y++){
            board[y] = [];
            for (let x = 0; x <= X; x++){
                board[y][x] = "7";
                this.fill(ctx, "#c9c9c9", x, y);
            }
        }
        board[20] = ['7', '7', '7', '7', '7', '7', '7', '7', '7', '7'];
    }
    fill(ctx, color, x, y) {
        ctx.fillStyle = color;
        ctx.strokeStyle = "black";

        ctx.fillRect(x * tile.width, y * tile.height, tile.width, tile.height);
        ctx.strokeRect(x * tile.width, y * tile.height, tile.width, tile.height);
    }
}
class Positions{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
// CLASS FOR PIECES
class Tetrominoes{
    static colors = ["#ddff00", "#1100ff", "#ff0008", "#3cff00", "#ff8800", "#00eeff", "#ff00ee", "#c9c9c9"];
    static pos = [
        new Positions([4, 5, 4, 5], [-1, -1, 0, 0]), // x+2, y+3
        new Positions([3, 4, 5, 6], [-1, -1, -1, -1]),
        new Positions([4, 4, 5, 6], [-1, 0, 0, 0]),
        new Positions([6, 4, 5, 6], [-1, 0, 0, 0]),
        new Positions([6, 5, 5, 4], [-1, -1, 0, 0]),
        new Positions([4, 5, 5, 6], [-1, -1, 0, 0]),
        new Positions([5, 4, 5, 6], [-1, 0, 0, 0]),
    ]
    constructor(type, ctx) {
        this.type = type;
        this.color = Tetrominoes.colors[type];
        this.position = {...Tetrominoes.pos[type]};
        this.ctx = ctx;
    }
    fill(color = undefined) {
        this.ctx.fillStyle = color || this.color;
        let i = [0, 1, 2, 3];

        i.map(i => {
            this.ctx.clearRect(this.position.x[i] * tile.width, this.position.y[i] * tile.height, tile.width, tile.height);
            this.ctx.fillRect(this.position.x[i]* tile.width, this.position.y[i] * tile.height, tile.width, tile.height);
            this.ctx.strokeRect(this.position.x[i] * tile.width, this.position.y[i] * tile.height, tile.width, tile.height);
        });
    }
    move(key) {
        this.fill("#c9c9c9");
        if (key === "ArrowLeft" && !isHorizontallyCollided(this) && !this.position.x.includes(0))
            this.position.x = this.position.x.map(this.subOne);
        else if (key === "ArrowRight" && !isHorizontallyCollided(this) && !this.position.x.includes(9))
            this.position.x = this.position.x.map(this.addOne);
        else if (key === "ArrowDown" && !isVerticallyCollided(this))
            this.position.y = this.position.y.map(this.addOne);
        else if (key === "ArrowUp")
            this.rotate();
        this.fill();
    }
    rotate() {
        // ONLY 3 words for this code and that is, IT LOOKS HORRIBLE !!
        // Some variables
        const matrix = [[0, -1], [1, 0]];
        let coords = [this.position.x[2], this.position.y[2]];
        let x = [...this.position.x];
        let y = [...this.position.y];

        for (let i = 0; i < 4; i++){
            // Changing the third element to origin point
            x[i] = x[i] - coords[0];
            y[i] = y[i] - coords[1];

            // multiplying with the matrix
            let tempX = (((x[i] * matrix[0][0]) + (y[i] * matrix[1][0]))) + coords[0];
            let tempY = (((x[i] * matrix[0][1]) + (y[i] * matrix[1][1]))) + coords[1];
            
            // checking for valid positions
            if (tempX < minX || tempX > maxX || tempY > maxY || board[tempY+1][tempX] !== '7')
                return;
            x[i] = tempX;
            y[i] = tempY;
        }
        // storing in main x and y
        this.position.x = [...x];
        this.position.y = [...y];
    }
    addOne(p) {
        return p + 1;
    }
    subOne(p) {
        return p - 1;
    }
}

// next shape
const nextShape = new Board(6*20, 6*20);
const nextCtx = nextShape.init("nextCanvas");
nextShape.draw(nextCtx, 6, 6);

// main
const gameArea = new Board(200, 400);
const ctx = gameArea.init("canvas");
gameArea.draw(ctx, maxY, maxX);
mainLoop();

async function mainLoop() {
    while (!isGameOver()) {
        let type = returnRandom();
        let newTetromino = new Tetrominoes(type, ctx);

        window.onkeydown = function (event) {
            newTetromino.move(event.key);
        }
        await main(newTetromino);
    }
}

async function main(newTetromino) {
    while (!isVerticallyCollided(newTetromino)) {
        newTetromino.move("ArrowDown");
        score++;
        await sleep();
    }
    let x = newTetromino.position.x;
    let y = newTetromino.position.y;
    let type = newTetromino.type.toString();

    for (let idx = 0; idx < 4; idx++)
        board[y[idx] + 1][x[idx]] = type;

    let lines = clearLine(y, Tetrominoes.colors);
    score(lines);
}
// FUNCTIONS
function score(lines) {
    if (lines === 1)
        score += 40;
    else if (lines === 2)
        score += 100;
    else if (lines === 3)
        score += 300;
    else if (lines === 4)
        score += 1200;
}
function clearLine(y, colors) {
    let linesCleared = 0;
    for (let i = 0; i < 4; i++){
        if (!board[y[i] + 1].includes('7')) {
            linesCleared++;
            for (let j = y[i]; j >= 0; j--){
                board[j + 1] = [...board[j]];
            }
        }
    }
    
    for (let k = 0; k <= maxY; k++){
        for (let m = 0; m <= maxX; m++){
            let c = Number(board[k + 1][m]);
            ctx.fillStyle = colors[c];
            ctx.strokeStyle = "black";

            ctx.fillRect(m * tile.width, k * tile.height, tile.width, tile.height);
            ctx.strokeRect(m * tile.width, k * tile.height, tile.width, tile.height);
        }
    }
    return linesCleared;
}
function isHorizontallyCollided(shape) {
    let i = [0, 1, 2, 3];
    let collide = false;
    collide = i.some(idx => {
        let y = shape.position.y[idx];
        let x = shape.position.x[idx];
        return ((x - 1) >= minX && board[y+1][x-1] !== '7') || ((x + 1) <= maxX && board[y+1][x+1] !== '7');
    });
    return collide;
}
function isVerticallyCollided(shape) {
    let collide = false;
    let i = [0, 1, 2, 3];
    collide = i.some(idx => {
        let y = shape.position.y[idx];
        let x = shape.position.x[idx];
        return (((y + 1) <= maxY && board[y + 2][x] !== '7')) || y === maxY;
    });
    return collide;
}
function returnRandom() {
    return Math.floor((Math.random() * 7));
}
function sleep() {
    return new Promise(resolve => {setTimeout(resolve, 500);});
}
function isGameOver() {
    let bool = false;
    for (let i = 0; i < 7; i++){
        if (board[0].includes(i.toString()))
            bool = true;
    }
    return bool;
}