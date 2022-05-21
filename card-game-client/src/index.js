import Phaser from "phaser";
import Game from "./scenes/Game";
import Lobby from "./scenes/Lobby";

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 1280,
  height: 780,
  scene: [Lobby, Game],
};

const newGame = new Phaser.Game(config);
