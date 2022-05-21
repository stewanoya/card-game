export default class Card {
  constructor(isFaceUp = false, heldBy = null) {
    this.isFaceUp = isFaceUp;
    this.heldBy = heldBy;
  }
}
