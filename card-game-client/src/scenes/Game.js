import Card from "../helpers/Card";
import Zone from "../helpers/Zone";
import io from "socket.io-client";
import Dealer from "../helpers/dealer";
import Player from "../helpers/player";

export default class Game extends Phaser.Scene {
  constructor() {
    super({
      key: "Game",
    });
  }

  preload() {
    this.load.image("assassinCard", "src/assets/characters/assassin.jpg");
    this.load.image("characterCardBack", "src/assets/characters/cardback.jpg");
    this.load.image("thiefCard", "src/assets/characters/thief.jpg");
    this.load.image("magicianCard", "src/assets/characters/magician.jpg");
    this.load.image("kingCard", "src/assets/characters/king.jpg");
    this.load.image("bishopCard", "src/assets/characters/bishop.jpg");
    this.load.image("merchantCard", "src/assets/characters/merchant.jpg");
    this.load.image("architectCard", "src/assets/characters/architect.jpg");
    this.load.image("warlordCard", "src/assets/characters/warlord.jpg");
  }

  create() {
    let self = this; // so you don't have to worry about scope here?

    // designates which player you are, can be anything
    //this.player = "" and then fill the string with some unique identifier.
    this.players = [];

    this.zone = new Zone(this);

    this.dropZone = this.zone.renderZone();
    this.outline = this.zone.renderOutline(this.dropZone);
    this.dealer = new Dealer(this);

    this.socket = io("http://localhost:3000");
    this.socket.on("connect", () => {
      self.player = new Player();
      this.socket.emit("newPlayer", self.player);
    });

    this.socket.on("initPlayerDetails", (initPlayerDetails) => {
      self.player = initPlayerDetails;
      console.log(self.player);
      if (self.player.isHost) {
        this.startGameText = this.add
          .text(400, 400, ["START GAME"])
          .setFontSize(25)
          .setFontFamily("Calibri")
          .setColor("#00FFFF");
      }
    });

    this.socket.on("dealCards", () => {
      self.dealer.dealCards();
    });

    this.dealText = this.add
      .text(75, 350, ["DEAL CARDS"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00FFFF")
      .setInteractive();

    this.dealText.on("pointerdown", () => {
      self.socket.emit("dealCards");
    });

    this.dealText.on("pointerover", () => {
      self.dealText.setColor("#FF69B4");
    });
    this.dealText.on("pointerout", () => {
      self.dealText.setColor("#00FFFF");
    });

    this.input.on("dragstart", (pointer, gameObject) => {
      gameObject.setTint(0x5c5c5c);
      self.children.bringToTop(gameObject);
    });

    let cardsInZone = [];
    this.input.on("dragend", (pointer, gameObject, dropped) => {
      gameObject.setTint();
      if (!dropped) {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }

      if (
        dropped &&
        cardsInZone.length <= 6 &&
        !cardsInZone.includes(gameObject)
      ) {
        gameObject.x = cardsInZone.length * 150 + 190;
        gameObject.y = 500;
        cardsInZone.push(gameObject);
      } else {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("drop", (pointer, gameObject, dropZone) => {
      dropZone.data.values.card++;
      // gameObject.disableInteractive();
    });
  }

  update() {}
}
