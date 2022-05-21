import Card from "./Card";

export default class Dealer {
  constructor(scene) {
    let characterImages = [
      "assassinCard",
      "thiefCard",
      "magicianCard",
      "kingCard",
      "bishopCard",
      "merchantCard",
      "architectCard",
      "warlordCard",
    ];
    this.dealCards = () => {
      for (let i = 0; i < characterImages.length; i++) {
        let characterCard = new Card(scene);
        characterCard.render(
          225 + i * 100,
          700,
          scene.isPlayerA ? characterImages[i] : "characterCardBack"
        );
      }
    };
  }
}
