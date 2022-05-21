import {
  CharacterCard,
  newDeck,
  DEFAULT_CHARACTERS_8,
  CHARACTER_VALUES_8,
  CharacterDeck,
} from "../../characterDeck.js";

var config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
    },
  },
  scene: {
    preload: preload,
    create: create,
  },
};

var game = new Phaser.Game(config);

function preload() {
  const IMAGES = [
    "assassin",
    "thief",
    "magician",
    "king",
    "bishop",
    "merchant",
    "architect",
    "warlord",
  ];

  for (let image of IMAGES) {
    this.load.image(image, `../assets/characters/${image}.jpg`);
  }

  this.load.image("cardback", "../assets/characters/cardback.jpg");
}

function create() {
  let assassinCard = this.add
    .image(100, 300, "assassin")
    .setInteractive()
    .setScale(0.25);
  let thiefCard = this.add
    .image(200, 300, "thief")
    .setInteractive()
    .setScale(0.25);
  let magicianCard = this.add
    .image(300, 300, "magician")
    .setInteractive()
    .setScale(0.25);
  let kingCard = this.add
    .image(400, 300, "king")
    .setInteractive()
    .setScale(0.25);
  let bishopCard = this.add
    .image(500, 300, "bishop")
    .setInteractive()
    .setScale(0.25);
  let merchantCard = this.add
    .image(600, 300, "merchant")
    .setInteractive()
    .setScale(0.25);
  let architectCard = this.add
    .image(700, 300, "architect")
    .setInteractive()
    .setScale(0.25);
  let warlordCard = this.add
    .image(800, 300, "warlord")
    .setInteractive()
    .setScale(0.25);

  const CARD_IMAGES = [
    assassinCard,
    thiefCard,
    magicianCard,
    kingCard,
    bishopCard,
    merchantCard,
    architectCard,
    warlordCard,
  ];

  let maxDepth = 8;

  let newGame = new CharacterDeck(
    newDeck(DEFAULT_CHARACTERS_8, CHARACTER_VALUES_8)
  );

  console.log(newGame);
  const addEvents = (arrayOfCards) => {
    for (let i = 0; i < arrayOfCards.length; i++) {
      //add drag
      this.input.setDraggable(arrayOfCards[i]);

      arrayOfCards[i].setDataEnabled();
      //map deck data to deck images
      arrayOfCards[i].data.set(newGame.cards[i]);

      //add depth changer
      arrayOfCards[i].on("pointerdown", (pointer) => {
        arrayOfCards[i].setDepth(maxDepth++);
      });
    }
  };
  this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  addEvents(CARD_IMAGES);
}
