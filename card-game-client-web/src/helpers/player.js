export default class Player {
  constructor(
    userName,
    cards = [],
    gold = 0,
    character = {},
    districts = [],
    isAlive = true,
    isHost = false,
    isMarkedForTheft = false,
    originalIndex,
    isKing = false,
    disconnected = false
  ) {
    (this.userName = userName),
      (this.cards = cards),
      (this.character = character),
      (this.districts = districts),
      (this.gold = gold),
      (this.isAlive = isAlive),
      (this.isHost = isHost),
      (this.isMarkedForTheft = isMarkedForTheft),
      (this.originalIndex = originalIndex),
      (this.isKing = isKing),
      (this.disconnected = disconnected);
  }

  useCharacterPower() {
    switch (
      this.character.value
      //write switch statement to determine what it is.
    ) {
    }

    this.character.powerUsed = true;
  }

  gatherResources(choice) {
    switch (choice) {
      //write switch statement to take choice logic
      // either draw 2 cards and keep 1
      // or take 2 gold
      case "gold":
        this.gold += 2;
        break;
    }
  }

  buildDistrict(card) {
    this.gold -= card.cost;
    this.cards = this.cards.filter((cardHand) => cardHand.id != card.id);
    this.districs.push(card);
    return;
  }
}

// const stew = new Player("stew");
// console.log(stew);

// stew.cards = [
//   { cost: 2, id: 1 },
//   { cost: 3, id: 3 },
// ];
// console.log(stew);

// stew.gatherResources("gold");
// console.log(stew);

// stew.buildDistrict(stew.cards[0]);
// console.log(stew);
