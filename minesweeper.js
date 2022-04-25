import Game from "./game.js";

const game = new Game();

function init() {
    game.init();
}

document.getElementById("new-game").addEventListener("click", init);

init();
