export default class Player {
  drag = false;
  cardCanBePlayed = false;
  rememberCardCost = undefined;
  districtPlayed = false;
  gatherResources = false;
  showCharacterCards = false;
  powerUsed = false;
  showPowerScreen = false;
  isUsingPower = false;
  isTradingWithDeck = false;
  showFinalScores = false;
  isDestroying = false;
  gotPlusOneGold = false;
  showHauntedCityAbility = false;
  laboratoryAbilityUsed = false;
  showCommunityBuildingScreen = false;
  canCollectByType = true;
  canDestroy = true;
  communityBuildCompleted = false;
  architectBuildLimitCounter = 0;
  cardsToBeTradedWithDeck = [];
  resourceGatherCards = [];
  graveYardCard = null;
  showGraveYard = false;
  smithyAbilityUsed = false;
  schoolOfMagicAbilityUsed = false;
  finalScores = [];

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
    disconnected = false,
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

  resetLocalValues() {
    this.drag = false;
    this.cardCanBePlayed = false;
    this.rememberCardCost = undefined;
    this.districtPlayed = false;
    this.gatherResources = false;
    this.showCharacterCards = false;
    this.powerUsed = false;
    this.showPowerScreen = false;
    this.isUsingPower = false;
    this.isTradingWithDeck = false;
    this.showFinalScores = false;
    this.isDestroying = false;
    this.gotPlusOneGold = false;
    this.showHauntedCityAbility = false;
    this.laboratoryAbilityUsed = false;
    this.showCommunityBuildingScreen = false;
    this.canCollectByType = true;
    this.canDestroy = true;
    this.communityBuildCompleted = false;
    this.architectBuildLimitCounter = 0;
    this.cardsToBeTradedWithDeck = [];
    this.resourceGatherCards = [];
    this.graveYardCard = null;
    this.showGraveYard = false;
    this.smithyAbilityUsed = false;
    this.schoolOfMagicAbilityUsed = false;
    this.finalScores = [];
    this.charactersArray = [...DEFAULT_CHARACTERS_8];
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
