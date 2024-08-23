export default class GameData {
  chats = [];
  players = [];
  host = "";
  currentTurn = undefined;
  districtsDeck = [];
  initOrderOfPlayers = [];
  charactersDeck = [];
  deadCharacter = null;
  lastCardDestroyed = { userName: null, cardData: null };
  gameStarted = false;
  finalTurn = false;
  finishedFirst = "";

  reset () {
      this.chats = [];
      this.players = [];
      this.host = "";
      this.currentTurn = undefined;
      this.districtsDeck = [];
      this.initOrderOfPlayers = [];
      this.charactersDeck = [];
      this.deadCharacter = null;
      this.lastCardDestroyed = { userName: null, cardData: null },
      this.gameStarted = false;
      this.finalTurn = false;
      this.finishedFirst = "";
  }

  removeKingStatusFromPrevKing () {
    let prevKing = this.players.filter(i => i.userName !== this.currentTurn).find(i => i.isKing)

    if (prevKing) {
      prevKing.isKing = false;
    }
  }
  
  getPlayerByCharacterName (characterName) {
    return this.players.find(
      (player) => player.character.name == characterName
    );
  }
  
  getPlayerByUserName (userName) {
    return this.players.find(i => i.userName === userName);
  }

  getCurrentPlayer() {
    return this.players.find(i => i.userName === this.player.currentTurn)
  }
  
  doesPlayerHaveGraveyard (player) {
    const graveYard = player.districts.find(
      (d) => d.districtName === "Graveyard"
    );
  
    if (graveYard) {
      return true;
    }
  
    return false;
  }
  
  graveYardAbilityCheck () {
    for (let player of this.players.filter(i => i.userName !== this.currentTurn)) {
      if (doesPlayerHaveGraveyard(player)) {
        player.graveYardCard = cardData;
        player.showGraveYard = true;
        return;
      }
    }
  }
  
  doesPlayerHaveGreatWall (userName) {
    let player = this.players.find((p) => p.userName === userName);
  
    let greatWall = player.districts.find(
      (d) => d.districtName === "Great Wall"
    );
  
    return greatWall ? true : false;
  }

  destroyPlayedCard(payload) {
    let currentPlayer = this.getCurrentPlayer();
    let costSubtraction =
      payload.greatWall && payload.cardToDestroy.districtName !== "Great Wall"
        ? 0
        : 1;
    let foundPlayer = this.getPlayerByUserName(payload.targetUserName)
    foundPlayer.districts = foundPlayer.districts.filter(
      (card) => card.id !== payload.cardToDestroy.id
    );

    // state.gameData.players[getPlayerIndex(state, foundPlayer.userName)] = {
    //   ...foundPlayer,
    // };
    console.log("gold before", currentPlayer.gold);
    const difference = currentPlayer.gold - (Number(payload.cardToDestroy.cost) - costSubtraction);
    currentPlayer.gold = difference;
    console.log("gold after", currentPlayer.gold);
  }
}