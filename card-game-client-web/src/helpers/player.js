
export default class Player {
  id = '' // socket id
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
