export default class CharacterCard {
  constructor(scene) {
    this.render = (x, y, sprite) => {
      let card = scene.add.image(x, y, sprite).setScale(0.35).setInteractive();
      scene.input.setDraggable(card);
      return card;
    };
  }
}
