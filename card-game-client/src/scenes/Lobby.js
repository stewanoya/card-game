import io from "socket.io-client";
import Player from "../helpers/player";

export default class Lobby extends Phaser.Scene {
  constructor() {
    super({
      key: "Lobby",
    });
  }

  preload() {}

  create() {
    let self = this;
    let players = [];
    let startGameText;
    this.socket = io("http://localhost:3000");

    // ON CONNECT WE CREATE NEW PLAYER AND PASS TO SERVER
    this.socket.on("connect", () => {
      self.player = new Player();
      this.socket.emit("newPlayer", self.player);
    });

    self.playerLobbyText = this.add.text(0, 0, [""]);
    this.lobbyPlayersContainer = this.add.rectangle(
      640,
      300,
      400,
      300,
      0x6666ff
    );
    this.socket.on("initPlayerDetails", (initPlayerDetails) => {
      self.player = initPlayerDetails;
      if (self.player.isHost) {
        self.startGameText = this.add
          .text(100, 600, ["START GAME"])
          .setFontSize(25)
          .setFontFamily("Calibri")
          .setColor("#ffffff")
          .setInteractive();
      }
    });

    this.socket.on("connectedPlayer", (players) => {
      self.players = [...players];
      self.playerLobbyText;
      this.lobbyPlayersContainer = this.add.rectangle(
        640,
        300,
        400,
        300,
        0x6666ff
      );
      for (let i = 0; i < self.players.length; i++) {
        self.playerLobbyText = this.add
          .text(450, 170 + 25 * i, [self.players[i].playerName])
          .setFontSize(18).text;
      }
      if (self.players.length >= 4) {
        self.startGameText.setColor("#6666ff").setInteractive();
        self.startGameText.on("pointerdown", () => {
          self.scene.start("Game");
        });
      }
    });

    this.socket.on("disconnectedPlayer", (players) => {
      self.players = [...players];
      this.lobbyPlayersContainer = this.add.rectangle(
        640,
        300,
        400,
        300,
        0x6666ff
      );
      for (let i = 0; i < self.players.length; i++) {
        self.playerLobbyText = this.add
          .text(450, 170 + 25 * i, [self.players[i].playerName])
          .setFontSize(18).text;
      }
      if (self.players.length < 4) {
        self.startGameText.setColor("#ffffff").disableInteractive();
      }
    });

    this.lobbyTitleText = this.add
      .text(600, 50, ["LOBBY"])
      .setFontSize(25)
      .setFontFamily("Calibri")
      .setColor("#00FFFF")
      .disableInteractive();
  }

  update() {}
}
