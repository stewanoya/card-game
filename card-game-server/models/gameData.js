import DistrictsDeck from "./districtsDeck.js";
import {
  CharacterDeck,
  DEFAULT_CHARACTERS_8,
  CHARACTER_VALUES_8,
} from "./characterDeck.js";

import Player from "./player.js";

import { v4 } from "uuid";
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

  createNewPlayer(name, id) {
    let player = new Player();
    player.userName = name;
    player.id = id;

    return player;
  }
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

  updateHost(playerId) {
    let matchingPlayer = this.players.find(i => i.id === playerId);
    let oldHost = this.players.find(i => i.isHost);
    oldHost.isHost = false;
    matchingPlayer.isHost = true;
  }

  getReadyForFirstRound() {
    // this.districtsDeck = decks.districtsDeck;
    // this.charactersDeck = decks.charactersDeck;
    this.initOrderOfPlayers = [...this.players];
    this.players.forEach((player) => {
      let card1 = this.districtsDeck.shift();
      let card2 = this.districtsDeck.shift();
      let card3 = this.districtsDeck.shift();
      let card4 = this.districtsDeck.shift();
      player.cards = [card1, card2, card3, card4];
      player.gold = 2;
    });
    let firstPlayerTurn = this.players[0];
    if (firstPlayerTurn.disconnected) {

    }
    firstPlayerTurn.showCharacterCards = true;
    this.gameStarted = true;
    this.currentTurn = firstPlayerTurn.userName;
  }

  buildDistrictsDeck() {
    this.districtsDeck = new DistrictsDeck().shuffleDeck();
    this.districtsDeck.forEach((card) => {
      card.id = v4();
    });
  }

  prepareCharacterCards() {
    const charactersDeck = new CharacterDeck().newDeck(
      DEFAULT_CHARACTERS_8,
      CHARACTER_VALUES_8
    );

    this.charactersDeck = [...charactersDeck];
  }
  burnCharacterCards() {
    const numberOfPlayers = this.players.length;
    const charactersDeck = this.charactersDeck;
    if (numberOfPlayers === 6) {
      let indexToBurn = Math.floor(Math.random() * charactersDeck.length);
      charactersDeck[indexToBurn].burned = true;
    }

    if (numberOfPlayers === 5) {
      let indexToBurn = Math.floor(Math.random() * charactersDeck.length);
      charactersDeck[indexToBurn].burned = true;
      let indexToFlip = indexToBurn;
      while (indexToBurn === indexToFlip) {
        indexToFlip = Math.floor(Math.random() * charactersDeck.length);
        // we cant burn king face up, so we just set it equal to index to burn to loop again.
        if (charactersDeck[indexToFlip].name === "King") {
          console.log("tried to burn king face up, rerolling");
          indexToFlip = indexToBurn;
          continue;
        }
      }
      charactersDeck[indexToFlip].isFaceUp = true;
    }

    if (numberOfPlayers === 4) {
      let indexToBurn = Math.floor(Math.random() * charactersDeck.length);
      charactersDeck[indexToBurn].burned = true;
      let indexToFlip = indexToBurn;
      while (indexToBurn === indexToFlip) {
        indexToFlip = Math.floor(Math.random() * charactersDeck.length);
        // we cant burn king face up, so we just set it equal to index to burn to loop again.
        if (charactersDeck[indexToFlip].name === "King") {
          console.log("tried to burn king face up, rerolling");
          indexToFlip = indexToBurn;
          continue;
        }
      }
      charactersDeck[indexToFlip].isFaceUp = true;

      let indexToFlip2 = indexToBurn;
      while (indexToFlip2 === indexToBurn) {
        indexToFlip2 = Math.floor(Math.random() * charactersDeck.length);

        if (
          indexToFlip2 === indexToFlip ||
          charactersDeck[indexToFlip2].name === "King"
        ) {
          indexToFlip2 = indexToBurn;
          continue;
        }
      }
      charactersDeck[indexToFlip2].isFaceUp = true;
    }
  }
  
  getPlayerByCharacterName (characterName) {
    return this.players.find(
      (player) => player.character.name == characterName
    );
  }

  setCharacterToDrafted(character) {
    let matchingCharacter = this.charactersDeck.find(i => i.characterName === character.characterName);
    matchingCharacter.drafted = true;
  }
  
  getPlayerByUserName (userName) {
    return this.players.find(i => i.userName === userName);
  }

  getCurrentPlayer () {
    console.log("PLAYERS", this.players)
    console.log("CURRENT TURN", this.currentTurn);
    return this.players.find(i => i.userName === this.currentTurn)
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

  nextDraftTurn() {
    const nextPlayerTurn =
      this.players[
        this.getIndexOfPlayerByName(this.players, this.currentTurn) + 1
      ];

    if (nextPlayerTurn === undefined) {
      this.players.sort(
        (player1, player2) => player1.character.value - player2.character.value
      );
      let firstPlayerTurn = this.players[0];
      firstPlayerTurn.gatherResources = true;
      const isKing = this.isCurrentPlayerKing();
      if (isKing) {
        // remove king status on previous king
        this.removeKingStatusFromPrevKing();
      }
      this.currentTurn = firstPlayerTurn.userName;
    } else { 
      this.currentTurn = nextPlayerTurn.userName;
    }
  }

  hasCardAlreadyBeenPlayed(cardName) {
    const player = this.getCurrentPlayer();
    for (let card of player.districts) {
      if (card.districtName === cardName) {
        return true;
      }
    }

    return false;
  }

  getIndexOfPlayerByName() {
    let foundIndex;
    this.players.forEach((player, index) => {
      if (player.userName == this.currentTurn) {
        foundIndex = index;
        return foundIndex;
      }
    });
  
    return foundIndex;
  };

  resetPlayerLocalValues() {
    this.players = this.players.map(i => { return {...i, ...this.resetLocalValues()}});
  }

  resetLocalValues() {
    return {
      drag: false,
      cardCanBePlayed: false,
      rememberCardCost: undefined,
      districtPlayed: false,
      gatherResources: false,
      showCharacterCards: false,
      powerUsed: false,
      showPowerScreen: false,
      isUsingPower: false,
      isTradingWithDeck: false,
      showFinalScores: false,
      isDestroying: false,
      gotPlusOneGold: false,
      showHauntedCityAbility: false,
      laboratoryAbilityUsed: false,
      showCommunityBuildingScreen: false,
      canCollectByType: true,
      canDestroy: true,
      communityBuildCompleted: false,
      architectBuildLimitCounter: 0,
      cardsToBeTradedWithDeck: [],
      resourceGatherCards: [],
      graveYardCard: null,
      showGraveYard: false,
      smithyAbilityUsed: false,
      schoolOfMagicAbilityUsed: false,
      finalScores: [],
    }
  }

  isCurrentPlayerKing = () => {
    let currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.character.name === "King") {
      currentPlayer.isKing = true;
      return true;
    }
  
    return false;
  }

  isCurrentPlayerArchitect() {
    let currentPlayer = this.getCurrentPlayer();
    if (
      currentPlayer.character.name === "Architect" &&
      currentPlayer.architectBuildLimitCounter < 3
    ) {
      currentPlayer.architectBuildLimitCounter++;
      currentPlayer.districtPlayed = false;
    }
  }

  giveAllGoldToTheif = () => {
    let currentPlayer = this.getCurrentPlayer();
    let playerTaking = this.getPlayerByCharacterName("Thief");
    if (playerTaking) {
      playerTaking.gold += currentPlayer.gold;
      currentPlayer.gold = 0;
      currentPlayer.isMarkedForTheft = false;
    } else {
      console.log("NO THEIF FOUND, HOW WERE THEY MARKED FOR THEFT??")
    }
  }

  // useCharacterPower() {
  //   switch (
  //     this.character.value
  //     //write switch statement to determine what it is.
  //   ) {
  //   }

  //   this.character.powerUsed = true;
  // }

  // gatherResources(choice) {
  //   switch (choice) {
  //     //write switch statement to take choice logic
  //     // either draw 2 cards and keep 1
  //     // or take 2 gold
  //     case "gold":
  //       this.gold += 2;
  //       break;
  //   }
  // }

  // buildDistrict(card) {
  //   this.gold -= card.cost;
  //   this.cards = this.cards.filter((cardHand) => cardHand.id != card.id);
  //   this.districs.push(card);
  //   return;
  // }
}