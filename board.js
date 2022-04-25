import Cell from "./cell.js";

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default class Board {
    bombsRemainingDOM = document.getElementById("bombs-remaining");
    timerDOM = document.getElementById("timer");
    bestTimeDOM = document.getElementById("best-time");
    timer;
    startTime;
    bombsRemaining;
    board;
    started = false;
    loss = false;
    win = false;
    width;
    height;
    grid;
    bombs;

    constructor(gridSize, bombs) {
        this.board = document.getElementById('board');
        this.bombsRemaining = bombs;
        this.bombsRemainingDOM.innerHTML = this.bombsRemaining;
        this.bombs = bombs;
        this.width = gridSize;
        this.height = gridSize;
        this.bestTimeDOM.innerHTML = this.getBestWinFromLocationStorage();
        this.makeGrid();
    }

    get complete() {
        return this.win || this.loss;
    }


    addWinToLocalStorageArray(time) {
        const winsStorage = localStorage.getItem("wins");
        let winArray = [];
        if (winsStorage !== null) {
            winArray = JSON.parse(winsStorage);
        }
        winArray.push({
            gridSize: this.width,
            bombs: this.bombs,
            time: time || 0.1 // min time
        });
        localStorage.setItem("wins", JSON.stringify(winArray));
    }

    getBestWinFromLocationStorage() {
        const winsStorage = localStorage.getItem("wins");
        let winArray = [];
        if (winsStorage !== null) {
            winArray = JSON.parse(winsStorage);
        }
        winArray = winArray.filter(w => w.gridSize === this.width && w.bombs === this.bombs).sort((a, b) => a.time - b.time);
        return `(Grid ${this.width} | Bombs ${this.bombs}) ${winArray.length ? winArray[0].time : 'No wins yet'}`;
    }

    startTimer() {
        this.stopTimer();
        this.startTime = Date.now();
        this.timerDOM.innerHTML = 0;
        this.timer = setInterval(() => {
            const timeToOneDecimalPlace = (Date.now() - this.startTime) / 1000;
            this.timerDOM.innerHTML = timeToOneDecimalPlace.toFixed(1);
        }, 100);
    }

    stopTimer(win = false) {
        if (this.timer) {
            clearInterval(this.timer);
        }
        if (win) {
            this.addWinToLocalStorageArray(parseFloat(this.timerDOM.innerHTML));
            this.bestTimeDOM.innerHTML = this.getBestWinFromLocationStorage();
        }
    }

    startGame(cell) {
        this.loss = false;
        this.win = false;
        this.setBombs(cell);
        this.assignNeighbors();
        this.started = true;
        this.startTimer();
    }

    setBombs(excludeCell) {
        let bombCount = 0;
        while (bombCount < this.bombs) {
            let x = getRandomInt(0, this.width - 1);
            let y = getRandomInt(0, this.height - 1);
            const exclude = excludeCell && excludeCell.x === x && excludeCell.y === y;
            if (this.grid[y][x].isBomb === false && !exclude) {
                this.grid[y][x].setBomb();
                bombCount++;
            }
        }
    }

    draw() {
        for (let y = 0; y < this.height; y++) {

            let row = document.createElement('div');
            row.classList.add('row');
            for (let x = 0; x < this.width; x++) {
                row.append(this.grid[y][x].drawCellAsHTML());
            }
            this.board.append(row);
        }
    }

    makeGrid() {
        this.grid = [];
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                const cell = new Cell(this, y, x);
                this.grid[y].push(cell);
            }
        }
        this.draw();
    }


    getNeighbors(x, y) {
        let neighbors = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) {
                    continue;
                }
                const neighborX = x + i;
                const neighborY = y + j;
                if (neighborX >= 0 &&
                    neighborX < this.width &&
                    neighborY >= 0 &&
                    neighborY < this.height &&
                    this.grid[neighborY][neighborX].isBomb
                ) {
                    neighbors++;
                }
            }
        }
        return neighbors;
    }

    assignNeighbors() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                if (cell.isBomb) {
                    continue;
                }
                cell.state = this.getNeighbors(x, y);
            }
        }
    }

    countFlaggedNeighbors(cell) {
        let flaggedNeighbors = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) {
                    continue;
                }
                const neighborX = cell.x + i;
                const neighborY = cell.y + j;
                if (neighborX >= 0 &&
                    neighborX < this.width &&
                    neighborY >= 0 &&
                    neighborY < this.height &&
                    this.grid[neighborY][neighborX].isFlagged
                ) {
                    flaggedNeighbors++;
                }
            }
        }
        return flaggedNeighbors;
    }

    checkNeighbors(cell) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) {
                    continue;
                }
                const neighborX = cell.x + i;
                const neighborY = cell.y + j;
                if (neighborX >= 0 &&
                    neighborX < this.width &&
                    neighborY >= 0 &&
                    neighborY < this.height &&
                    !this.grid[neighborY][neighborX].isRevealed
                ) {
                    this.grid[neighborY][neighborX].checkCell();
                }
            }
        }
    }

    isValidPos(pos) {
        return (pos[0] >= 0 && pos[0] < this.height && pos[1] >= 0 && pos[1] < this.width);
    }

    revealAll() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x].reveal();
            }
        }
    }

    checkWin() {
        let revealed = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                if (cell.isRevealed && !cell.isBomb) {
                    revealed++;
                }
            }
        }
        if (revealed === (this.width * this.height) - this.bombs) {
            this.stopTimer(true);
            this.win = true;
            this.revealAll();
            setTimeout(() => {
                alert('You win!');
            });
        }
    }

    gameOver() {
        this.stopTimer();
        this.loss = true;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x].lost();
            }
        }
    }
}
