import Board from "./board.js";


export default class Game {
    board;
    init() {
        const bombs = +document.getElementById("bombs").value;
        const gridSize = +document.getElementById("board-size").value;

        if(!bombs || !gridSize) {
            alert("Please enter a value for bombs and board size");
            return;
        }

        if((gridSize * gridSize) - 1 < bombs) {
            alert("Cannot fit bombs in the board");
            return;
        }

        document.getElementById('board').innerHTML = '';
        this.board = new Board(gridSize, bombs);
    }
}
