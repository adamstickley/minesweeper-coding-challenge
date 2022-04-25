export default class Cell {
    x;
    y;
    state; // -1 = bomb, 0 = empty, 1+ = number of bombs around
    revealed; // true = revealed, false = hidden
    flagged; // true = flagged, false = not flagged
    board; // board object
    DOMCell; // DOM element of cell

    constructor(board, y, x) {
        this.y = y;
        this.x = x;
        this.state = 0;
        this.flagged = false;
        this.revealed = false;
        this.board = board;
    }

    get isBomb() {
        return this.state === -1;
    }

    get isFlagged() {
        return this.flagged;
    }

    get isEmpty() {
        return this.state === 0;
    }

    get isRevealed() {
        return this.revealed;
    }

    setState(num) {
        this.state = num;
    }

    setBomb() {
        this.setState(-1);
    }

    setFlagged(bool) {
        this.flagged = bool;
        if (bool) {
            this.DOMCell.append(this.createCellContent());
            this.board.bombsRemaining--;
            this.board.bombsRemainingDOM.innerHTML = this.board.bombsRemaining;
        } else {
            this.DOMCell.replaceChildren();
            this.board.bombsRemaining++;
            this.board.bombsRemainingDOM.innerHTML = this.board.bombsRemaining;
        }
    }

    removeCellContent() {
        this.DOMCell.replaceChildren();
    }

    createCellContent() {
        this.removeCellContent();
        const content = document.createElement('div');
        content.classList.add('cell-content');
        if (this.isFlagged) {
            content.textContent = '🚩';
        } else if (this.isBomb) {
            content.textContent = '💣';
        } else if (this.isEmpty) {
            content.textContent = ' ';
        } else {
            content.textContent = this.state;
        }

        return content;
    }

    drawCellAsHTML() {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', this.handleClick.bind(this));
        cell.addEventListener('contextmenu', this.handleRightClick.bind(this));

        this.DOMCell = cell;

        return cell;
    }

    revealBadFlag() {
        this.DOMCell.classList.add('bad-flag');
        this.reveal();
    }

    reveal() {
        this.revealed = true;
        this.DOMCell.classList.add('revealed');
        this.DOMCell.append(this.createCellContent());
        if (!this.board.complete) {
            this.board.checkWin();
        }
    }

    checkCell() {
        if (this.isRevealed) {
            return;
        }
        if (this.isBomb && !this.isFlagged) {
            this.DOMCell.classList.add('bomb');
            this.reveal();
            if (!this.board.loss) {
                this.board.loss = true;
                this.board.gameOver();
            }
        } else if (!this.isFlagged) {
            this.reveal();
            if (this.state === 0) {
                this.board.checkNeighbors(this);
            }
        }
    }

    lost() {
        if(this.isBomb && !this.isFlagged) {
            this.reveal();
        }
        if(!this.isBomb && this.isFlagged) {
            this.revealBadFlag();
        }
        this.DOMCell.classList.add('lost');
    }

    handleClick() {
        if (this.board.complete) {
            return;
        }
        if(!this.board.started) {
            this.board.startGame(this);
        }

        if (this.isFlagged) {
            return;
        }
        if (this.isRevealed) {
            this.specialCheck();
        }
        this.checkCell();
    }

    handleRightClick(event) {
        if (this.board.complete) {
            return;
        }
        if(!this.board.started) {
            this.board.startGame();
        }
        event.preventDefault();
        event.stopPropagation();
        if (this.isRevealed) {
            return;
        }
        this.setFlagged(!this.isFlagged);
    }

    specialCheck() {
        if (this.state === this.board.countFlaggedNeighbors(this)) {
            this.board.checkNeighbors(this);
        }
    }
}
