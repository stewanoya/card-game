<template>
  <div class="game-container">
    <CommunityBuild
      :opponents="opponents"
      :transaction-handler="communityBuildTransaction"
      :districtPlayed="districtPlayed"
      v-if="showCommunityBuildingScreen"
    />
    <div class="player-crown-container" v-if="player.isKing">
      <div class="player-crown">
        <svg
          class="crown"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          version="1.1"
          id="Capa_1"
          x="0px"
          y="0px"
          viewBox="0 0 220 220"
          style="enable-background: new 0 0 220 220"
          xml:space="preserve"
        >
          <path
            d="M220,98.865c0-12.728-10.355-23.083-23.083-23.083s-23.083,10.355-23.083,23.083c0,5.79,2.148,11.084,5.681,15.14  l-23.862,21.89L125.22,73.002l17.787-20.892l-32.882-38.623L77.244,52.111l16.995,19.962l-30.216,63.464l-23.527-21.544  c3.528-4.055,5.671-9.344,5.671-15.128c0-12.728-10.355-23.083-23.083-23.083C10.355,75.782,0,86.137,0,98.865  c0,11.794,8.895,21.545,20.328,22.913l7.073,84.735H192.6l7.073-84.735C211.105,120.41,220,110.659,220,98.865z"
          />
          <g></g>
          <g></g>
          <g></g>
          <g></g>
          <g></g>
          <g></g>
          <g></g>
          <g></g>
          <g></g>
          <g></g>
          <g></g>
          <g></g>
          <g></g>
          <g></g>
          <g></g>
        </svg>
      </div>
    </div>
    <OpponentsContainer
      :opponents="opponents"
      :isDestroying="isDestroying"
      :destructionComplete="destructionComplete"
      :currentTurn="gameData.currentTurn"
    />
    <div class="gather-card-container" v-if="resourceGatherCards.length == 2">
      <DistrictCard
        v-for="card in resourceGatherCards"
        :name="card.districtName"
        :type="card.type"
        :cost="card.cost"
        :key="card.id"
        :uniqueDescription="card.uniqueDescription"
        @click="gatherCardSelected(card)"
      />
    </div>
    <div class="use-power-container" v-if="showPowerScreen && !powerUsed">
      <!-- power screen can be it's own component -->
      <!-- I can pass down the character name as a prop -->

      <!-- ASSASSIN -->
      <div class="target-choices" v-if="draftedCharacterName === 'Assassin'">
        Which character do you wish to kill?
        <div v-for="character in charactersArray" :key="character.name">
          <button
            v-if="character.name !== 'Assassin'"
            @click="
              killPlayer(gameData, getPlayerByCharacterName(character.name))
            "
            class="target-choices-button"
            :key="character.name"
          >
            {{ character.name }}
          </button>
        </div>
      </div>

      <!-- THIEF -->
      <div class="target-choices" v-if="draftedCharacterName === 'Thief'">
        Which character do you wish to steal from?
        <div v-for="character in charactersArray" :key="character.name">
          <button
            v-if="character.name !== 'Thief'"
            @click="
              markPlayerForTheft(
                gameData,
                getPlayerByCharacterName(character.name)
              )
            "
            class="target-choices-button"
          >
            {{ character.name }}
          </button>
        </div>
      </div>
      <!-- MAGICIAN-->
      <div class="target-choices" v-if="draftedCharacterName === 'Magician'">
        Who will you exchange cards with?
        <div v-for="opponent in opponents" :key="opponent.userName">
          <button
            @click="
              tradeCards(
                gameData,
                getPlayerByCharacterName(opponent.character.name)
              )
            "
            class="target-choices-button"
          >
            {{ opponent.userName }}
          </button>
        </div>
        <h1>--OR--</h1>
        <button
          @click="tradeCards(gameData, 'Deck')"
          class="target-choices-button"
        >
          Trade With Deck
        </button>
      </div>

      <!-- KING -->
      <div class="target-choices" v-if="draftedCharacterName === 'King'">
        <button
          v-if="canCollectByType"
          @click="collectGoldByType(draftedCharacterName)"
          class="target-choices-button"
        >
          Collect Gold By Card Type
        </button>
      </div>

      <!-- BISHOP -->
      <div class="target-choices" v-if="draftedCharacterName === 'Bishop'">
        <button
          v-if="canCollectByType"
          @click="collectCardsByType(draftedCharacterName)"
          class="target-choices-button"
        >
          Collect Cards by Card Type
        </button>
        <div>
          <button
            v-if="!communityBuildCompleted"
            class="target-choices-button"
            @click="showCommunityBuildScreenHandler"
          >
            Community Build
          </button>
        </div>
      </div>

      <!-- MERCHANT -->
      <div class="target-choices" v-if="draftedCharacterName === 'Merchant'">
        <button
          v-if="canCollectByType"
          @click="collectGoldByType(draftedCharacterName)"
          class="target-choices-button"
        >
          Collect Gold By Card Type
        </button>
        <div>
          <button
            v-if="!gotPlusOneGold"
            class="target-choices-button"
            @click="plusOneGold"
          >
            +1 Gold
          </button>
        </div>
      </div>

      <!-- ARCHITECT -->
      <div class="target-choices" v-if="draftedCharacterName === 'Architect'">
        <button @click="collectTwoCards" class="target-choices-button">
          Get +2 Cards
        </button>
      </div>

      <!-- WARLORD -->
      <div class="target-choices" v-if="draftedCharacterName === 'Warlord'">
        <button
          v-if="canDestroy"
          @click="selectCardToDestroy"
          class="target-choices-button"
        >
          Destroy a played Card
        </button>
        <div>
          <button
            v-if="canCollectByType"
            @click="collectGoldByType(draftedCharacterName)"
          >
            Collect Gold by card type
          </button>
        </div>
      </div>

      <button class="close-power-screen" @click="showPowerScreenHandler">
        Close
      </button>
    </div>

    <div class="trade-with-deck-container" v-if="isTradingWithDeck">
      <h1>Drop the cards you would like to Trade</h1>

      <draggable
        :list="cardsToBeTradedWithDeck"
        @end="drag = false"
        class="trade-with-deck-zone"
        item-key="id"
        ghost-class="ghost"
        drag-class="card"
        group="cards"
      >
        <template #item="{ element }">
          <DistrictCard
            :name="element.districtName"
            :cost="element.cost"
            :type="element.type"
            :uniqueDescription="element.uniqueDescription"
            ghost-class="ghost"
            :key="element.id"
            id="card"
          />
        </template>
      </draggable>
      <div class="flex">
        <button @click="cancelTradeWithDeck">Cancel</button>
        <button @click="initTradeWithDeck">Trade</button>
      </div>
    </div>

    <div
      class="end-turn-container"
      v-if="
        !gatherResources &&
        gameData.currentTurn == player.userName &&
        !showCharacterCards
      "
    >
      <button @click="endTurnHandler">End Turn</button>
    </div>
    <div
      class="use-power-button-container"
      v-if="gameData.currentTurn == player.userName && !showCharacterCards"
    >
      <button
        v-if="!gatherResources"
        @click="showPowerScreenHandler"
        :disabled="powerUsed"
      >
        Use Power
      </button>
    </div>
    <button
      v-if="isDestroying"
      class="cancel-destroying-button"
      @click="cancelDestroyingCard"
    >
      Cancel Destroying
    </button>
    <div
      class="gather-resources-container"
      v-if="gatherResources && gameData.currentTurn == player.userName"
    >
      <h2>Gather Resources</h2>
      <div class="button-container">
        <button class="resource-button" @click="gatherGoldHandler">
          +2 Gold
        </button>
        <button class="resource-button" @click="gatherCardHandler">Card</button>
      </div>
    </div>
    <div class="characters-container" v-if="showCharacterCards">
      <h1 class="choose-title">Choose a character!</h1>
      <CharacterCard
        v-for="character in gameData.charactersDeck"
        :key="character.name"
        :name="character.name"
        :value="character.value"
        :jobDescription="character.jobDescription"
        @click="draftCharacter(character)"
        class="character-card"
        :class="character.burned || character.drafted ? 'hide-card' : null"
      />
    </div>

    <h3 class="player-gold">Gold: {{ player.gold }}</h3>
    <h5 class="current-turn">
      Current Turn:
      {{
        gameData.currentTurn == player.userName ? "You" : gameData.currentTurn
      }}
    </h5>
    <div class="game-table-container">
      <div class="game-table">
        <div class="districts-deck">
          Deck: <strong>{{ gameData.districtsDeck.length }}</strong>
        </div>
        <draggable
          item-key="id"
          class="player-played-zone"
          :group="{
            name: 'cards',
            pull: false,
            put: cardCanBePlayed,
          }"
          @change="districtCardHasBeenPlayed"
          :list="player.districts"
          ghost-class="played-ghost"
        >
          <!--           :class="drag ? 'bring-to-top' : ''"
 -->
          <template #item="{ element }">
            <PlayedDistrict
              :name="element.districtName"
              :type="element.type"
              :cost="element.cost"
              :key="element.id"
            />
          </template>
        </draggable>
      </div>
    </div>
    <draggable
      :list="player.cards"
      @start="canPlayDistrictHandler"
      @end="drag = false"
      class="districts-card-zone"
      item-key="id"
      ghost-class="ghost"
      drag-class="card"
      group="cards"
    >
      <template #item="{ element }">
        <DistrictCard
          :name="element.districtName"
          :cost="element.cost"
          :type="element.type"
          :uniqueDescription="element.uniqueDescription"
          ghost-class="ghost"
          :key="element.id"
          id="card"
        />
      </template>
    </draggable>
  </div>
</template>

<script>
import store from "@/store";
import DistrictsDeck from "@/helpers/districtsDeck.js";
import DistrictCard from "@/components/DistrictCard.vue";
import PlayedDistrict from "@/components/PlayedDistrict.vue";
import CharacterCard from "@/components/CharacterCard.vue";
import CommunityBuild from "@/components/CommunityBuild.vue";

import { mapGetters, mapState, mapMutations } from "vuex";
import draggable from "vuedraggable";
import {
  CharacterDeck,
  DEFAULT_CHARACTERS_8,
  CHARACTER_VALUES_8,
} from "@/helpers/characterDeck";
import OpponentsContainer from "@/components/OpponentsContainer.vue";

export default {
  data() {
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
      isDestroying: false,
      gotPlusOneGold: false,
      showCommunityBuildingScreen: false,
      canCollectByType: true,
      canDestroy: true,
      communityBuildCompleted: false,
      architectBuildLimitCounter: 0,
      cardsToBeTradedWithDeck: [],
      resourceGatherCards: [],
      charactersArray: [],
    };
  },
  created() {
    this.socket.on("draftRound", (gameData) => {
      store.commit("updateGameData", gameData);
      this.draftRound();
    });

    this.socket.on("updateGameData", (gameData) => {
      store.commit("updateGameData", gameData);
      store.commit("updatePlayerFromGameData", gameData.players);
      console.log("gamedata was updated!", this.gameData);
    });

    this.socket.on("allPlayersDrafted", (gameData) => {
      store.commit("updateGameData", gameData);
      // sort game data in backend before passing back here.
      // So that a start characerRound function
      // can be called safely
      // we can also begin with the incoming playerturn name;
      this.startPlayerRound();
    });

    this.socket.on("allPlayerTurnsCompleted", (newGameData) => {
      store.commit("updateGameData", newGameData);
      this.nextGameRound();
    });
    this.socket.on("nextPlayerTurn", (gameData) => {
      store.commit("updateGameData", gameData);
      store.commit("updatePlayerFromGameData", gameData.players);
      if (
        this.gameData.currentTurn == this.player.userName &&
        this.player.isMarkedForTheft
      ) {
        this.giveAllGold();
      }

      this.nextPlayerRound();
    });
    this.startGame();
    store.commit("updateInit", true);
  },
  name: "GameView",
  components: {
    draggable,
    DistrictCard,
    PlayedDistrict,
    CharacterCard,
    OpponentsContainer,
    CommunityBuild,
  },
  computed: {
    ...mapState(["socket", "player", "gameData", "init"]),
    ...mapMutations([
      "updateGameData",
      "createNewPlayer",
      "setSocket",
      "updatePlayers",
      "updatePlayerFromGameData",
      "updateInit",
      "updatePlayerToGameData",
    ]),
    ...mapGetters(["opponents"]),
    isCharacterDraftedOrBurned(character) {
      if (character.burned || character.drafted) {
        return true;
      }
      return false;
    },

    draftedCharacterName() {
      return this.player.character.name;
    },
  },
  methods: {
    startGame() {
      if (this.init === false) {
        this.charactersArray = [...DEFAULT_CHARACTERS_8];
        let districtsDeck = new DistrictsDeck().shuffleDeck();
        let charactersDeck = new CharacterDeck().newDeck(
          DEFAULT_CHARACTERS_8,
          CHARACTER_VALUES_8
        );

        this.burnCharacterCards(charactersDeck, this.gameData.players.length);

        const decks = { districtsDeck, charactersDeck };
        this.socket.emit("getDeckReady", decks);

        this.socket.on("initPlayerDetails", (gameData) => {
          store.commit("updateGameData", gameData);
          store.commit("updatePlayers", gameData.players);
          store.commit("updatePlayerFromGameData", gameData.players);
          this.socket.emit("beginDraft", gameData);
        });
      }
    },
    nextGameRound() {
      let charactersDeck = new CharacterDeck().newDeck(
        DEFAULT_CHARACTERS_8,
        CHARACTER_VALUES_8
      );
      this.burnCharacterCards(charactersDeck, this.gameData.players.length);
      this.gameData.charactersDeck = [...charactersDeck];

      store.commit("updateGameData", this.gameData);
      this.resetLocalValues();

      this.socket.emit("beginDraft", this.gameData);
    },
    burnCharacterCards(charactersDeck, numberOfPlayers) {
      switch (numberOfPlayers) {
        case 2:
          return charactersDeck.splice(
            Math.floor(Math.random() * charactersDeck.length),
            1
          );
      }
    },
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
      this.isDestroying = false;
      this.gotPlusOneGold = false;
      this.showCommunityBuildingScreen = false;
      this.canCollectByType = true;
      this.canDestroy = true;
      this.communityBuildCompleted = false;
      this.architectBuildLimitCounter = 0;
      this.cardsToBeTradedWithDeck = [];
      this.resourceGatherCards = [];
      this.charactersArray = [...DEFAULT_CHARACTERS_8];
    },
    showPowerScreenHandler() {
      this.showPowerScreen = !this.showPowerScreen;
    },
    generateID() {
      return Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substr(0, 5);
    },
    draftRound() {
      if (this.gameData.currentTurn === this.player.userName) {
        this.showCharacterCards = true;
      }
    },
    plusOneGold() {
      this.player.gold += 1;
      this.gotPlusOneGold = true;
      store.commit("updatePlayerToGameData", this.player);
      this.socket.emit("updateGameData", this.gameData);
    },
    // checks for duplicate in played zone
    hasCardAlreadyBeenPlayed(cardName, player) {
      for (let card of player.districts) {
        if (card.districtName === cardName) {
          return true;
        }
      }

      return false;
    },
    canPlayDistrictHandler(card) {
      this.drag = true;
      this.cardCanBePlayed = false;
      console.log("HERE IS USINGPOWER", this.isUsingPower);
      const cardData = card.item.innerText.split("\n\n");
      const cardCost = Number(cardData[0]);
      const cardName = cardData[1];
      const cardType = cardData[2];
      let hasCardAlreadyBeenPlayed = this.hasCardAlreadyBeenPlayed(
        cardName,
        this.player
      );
      this.rememberCardCost = cardCost;
      // TODO: replace this crazy if statement with something more readable/maintainable
      if (
        this.player.gold >= cardCost &&
        this.gameData.currentTurn === this.player.userName &&
        !this.districtPlayed &&
        !hasCardAlreadyBeenPlayed &&
        !this.showPowerScreen
      ) {
        this.cardCanBePlayed = true;
      }
    },
    districtCardHasBeenPlayed() {
      this.cardCanBePlayed = false;
      this.districtPlayed = true;
      this.player.gold -= this.rememberCardCost;
      this.isPlayerArchitect();
      store.commit("updatePlayerToGameData", this.player);
      store.commit("updateGameData", this.gameData);
      this.socket.emit("districtPlayed", this.gameData);
    },
    isPlayerArchitect() {
      if (
        this.player.character.name === "Architect" &&
        this.architectBuildLimitCounter < 3
      ) {
        this.architectBuildLimitCounter++;
        this.districtPlayed = false;
      }
    },
    draftCharacter(character) {
      this.player.character = character;
      store.commit("updatePlayerToGameData", this.player);
      const index = this.gameData.charactersDeck.indexOf(character);
      this.gameData.charactersDeck[index].drafted = true;
      this.showCharacterCards = false;
      this.socket.emit("nextDraftRound", this.gameData);
    },
    removeKingStatus() {
      for (let player of this.gameData.players) {
        player.isKing = false;
      }
    },
    checkIfPlayerIsKing() {
      if (this.player.character.name === "King") {
        this.removeKingStatus();
        store.commit("updateGameData", this.gameData);
        this.player.isKing = true;
        store.commit("updatePlayerToGameData", this.player);
        this.socket.emit("updateGameData", this.gameData);
      }
      // player will get updated in store when they collect resources or use power
    },
    startPlayerRound() {
      if (this.gameData.currentTurn === this.player.userName) {
        this.gatherResources = true;
        this.checkIfPlayerIsKing();
      }

      // do a check to see if player is a character that requires taking immediate action before
      // gathering resources.
      // it looks like character powers can be used at anytime...

      // if it's the players turn, display gather resource options
      // display character card start animation?
      // how to handle next turns?
    },
    nextPlayerRound() {
      // TODO: Add logic to reveal character name when it's their turn && they're not dead
      if (this.gameData.currentTurn === this.player.userName) {
        this.gatherResources = true;
        this.checkIfPlayerIsKing();
        if (this.player.isAlive === false) {
          this.player.isAlive = true;
          store.commit("updatePlayerToGameData", this.player);
          this.socket.emit("updateGameData", this.gameData);
          this.socket.emit("turnEnded", this.gameData);
        }
      }
      //TODO: Add logic to check if player is king on start of round;
      // checks if player is current turn and reveals that they are the king.
      // TODO: add logic to not lose kingstatus until someone else reveals
    },
    endTurnHandler() {
      store.commit("updateGameData", this.gameData);
      this.socket.emit("updateGameData", this.gameData);
      this.socket.emit("turnEnded", this.gameData);
      // emit endTurn
      // go to next player
      // set
    },

    gatherGoldHandler() {
      this.gatherResources = false;
      this.player.gold += 2;
      store.commit("updatePlayerToGameData", this.player);
      this.socket.emit("updateGameData", this.gameData);
    },
    gatherCardHandler() {
      this.gatherResources = false;
      let card1 = this.gameData.districtsDeck.shift();
      let card2 = this.gameData.districtsDeck.shift();

      this.resourceGatherCards = [card1, card2];
      store.commit("updateGameData", this.gameData);
      this.socket.emit("updateGameData", this.gameData);
    },
    gatherCardSelected(chosenCard) {
      let notChosenCard = this.resourceGatherCards.filter(
        (card) => card !== chosenCard
      )[0];
      this.player.cards.push(chosenCard);
      store.commit("updatePlayerToGameData", this.player);
      this.gameData.districtsDeck.push(notChosenCard);
      store.commit("updateGameData", this.gameData);
      this.resourceGatherCards = [];
      this.socket.emit("updateGameData", this.gameData);
    },
    getPlayerByCharacterName(characterName) {
      return this.gameData.players.find(
        (player) => player.character.name == characterName
      );
    },
    killPlayer(gameData, playerToKill) {
      let foundPlayer = gameData.players.find(
        (player) => player === playerToKill
      );
      if (!foundPlayer) {
        this.powerUsed = true;
        this.showPowerScreen = false;
        return;
      }
      foundPlayer.isAlive = false;
      store.commit("updatePlayerToGameData", foundPlayer);
      this.socket.emit("updateGameData", this.gameData);
      this.powerUsed = true;
      this.showPowerScreen = false;
    },
    giveAllGold() {
      let playerTaking = this.getPlayerByCharacterName("Thief");
      playerTaking.gold += this.player.gold;
      store.commit("updatePlayerToGameData", playerTaking);
      this.player.gold = 0;
      this.player.isMarkedForTheft = false;
      store.commit("updatePlayerToGameData", this.player);
      this.socket.emit("updateGameData", this.gameData);
    },
    markPlayerForTheft(gameData, playerToStealFrom) {
      let foundPlayer = gameData.players.find(
        (player) => player === playerToStealFrom
      );
      if (!foundPlayer) {
        this.powerUsed = true;
        this.showPowerScreen = false;
        return;
      }
      foundPlayer.isMarkedForTheft = true;
      store.commit("updatePlayerToGameData", foundPlayer);
      this.socket.emit("updateGameData", this.gameData);
      this.powerUsed = true;
      this.showPowerScreen = false;
    },

    tradeCards(gameData, playerToTradeWith) {
      if (playerToTradeWith === "Deck") {
        this.openTradeWithDeckScreen();
        return;
      }

      let foundPlayer = gameData.players.find(
        (player) => player === playerToTradeWith
      );
      const copyPlayer1Cards = [...this.player.cards];

      this.player.cards = [...foundPlayer.cards];
      foundPlayer.cards = [...copyPlayer1Cards];
      store.commit("updatePlayerToGameData", foundPlayer);
      store.commit("updatePlayerToGameData", this.player);
      this.socket.emit("updateGameData", this.gameData);
      this.powerUsed = true;
      this.showPowerScreen = false;
    },
    openTradeWithDeckScreen() {
      this.showPowerScreen = false;
      this.isTradingWithDeck = true;
    },
    cancelTradeWithDeck() {
      this.player.cards = [
        ...this.player.cards,
        ...this.cardsToBeTradedWithDeck,
      ];
      this.cardsToBeTradedWithDeck = [];
      store.commit("updatePlayerToGameData", this.player);
      this.socket.emit("updateGameData", this.gameData);
      this.isTradingWithDeck = false;
    },
    initTradeWithDeck() {
      for (const cardFromPlayer of this.cardsToBeTradedWithDeck) {
        let cardFromDeck = this.gameData.districtsDeck.shift();
        if (cardFromDeck === undefined) {
          // TODO: Implement reshuffle deck.
          console.log("YOU HAVEN'T IMPLEMENTED THIS YET STUPID");
        }

        this.player.cards.push(cardFromDeck);
        this.gameData.districtsDeck.push(cardFromPlayer);
        this.cardsToBeTradedWithDeck = [];
        this.isTradingWithDeck = false;
        this.powerUsed = true;
        store.commit("updatePlayerToGameData", this.player);
        this.socket.emit("updateGameData", this.gameData);
      }
    },
    collectGoldByType(characterName) {
      if (characterName === "King") {
        let numberOfYellows = 0;
        this.player.districts.forEach((card) => {
          if (card.type === "yellow") {
            numberOfYellows += 1;
          }
        });
        this.player.gold += numberOfYellows;

        this.isUsingPower = false;
        this.canCollectByType = false;

        store.commit("updatePlayerToGameData", this.player);
        this.socket.emit("updateGameData", this.gameData);
        return;
      }

      if (characterName === "Merchant") {
        let numberOfGreens = 0;
        this.player.districts.forEach((card) => {
          if (card.type === "green") {
            numberOfGreens += 1;
          }
        });
        this.player.gold += numberOfGreens;

        this.isUsingPower = false;
        this.canCollectByType = false;

        store.commit("updatePlayerToGameData", this.player);
        this.socket.emit("updateGameData", this.gameData);
        return;
      }

      if (characterName === "Warlord") {
        let numberOfReds = 0;
        this.player.districts.forEach((card) => {
          if (card.type === "red") {
            numberOfReds += 1;
          }
        });
        this.player.gold += numberOfReds;

        this.isUsingPower = false;
        this.canCollectByType = false;

        store.commit("updatePlayerToGameData", this.player);
        this.socket.emit("updateGameData", this.gameData);
        return;
      }
    },
    collectCardsByType(characterName) {
      if (characterName === "Bishop") {
        let numberOfBlues = 0;
        this.player.districts.forEach((card) => {
          if (card.type === "blue") {
            numberOfBlues += 1;
          }
        });
        let i = 0;
        while (i < numberOfBlues) {
          this.player.cards.push(this.gameData.districtsDeck.shift());
          i += 1;
        }

        this.isUsingPower = false;
        this.canCollectByType = false;
        store.commit("updatePlayerToGameData", this.player);
        this.socket.emit("updateGameData", this.gameData);
      }
    },
    showCommunityBuildScreenHandler() {
      this.showCommunityBuildingScreen = true;
    },
    cancelCommunityBuildHandler() {
      this.showCommunityBuildingScreen = false;
    },
    communityBuildTransaction(
      toBuild,
      toGive,
      targetPlayer,
      typeOfTransAction
    ) {
      if (typeOfTransAction === "cancel") {
        this.player.cards = [...this.player.cards, ...toBuild, ...toGive];
        store.commit("updatePlayerToGameData", this.player);
        this.socket.emit("updateGameData", this.gameData);
        this.showCommunityBuildingScreen = false;
        return;
      }

      targetPlayer.cards = [...targetPlayer.cards, ...toGive];
      targetPlayer.gold -= toGive.length;
      this.player.gold -= toBuild[0].cost - toGive.length; // player only pays difference;
      this.player.districts = [...this.player.districts, ...toBuild];
      this.cardCanBePlayed = false;
      this.districtPlayed = true;
      this.communityBuildCompleted = true;
      store.commit("updatePlayerToGameData", targetPlayer);
      store.commit("updatePlayerToGameData", this.player);
      this.socket.emit("updateGameData", this.gameData);
      this.showCommunityBuildingScreen = false;
      // TODO: implement a way to disable communitybuildscreen button;
      this.showPowerScreen = false;
      return;
    },
    collectTwoCards() {
      let card1 = this.gameData.districtsDeck.shift();
      let card2 = this.gameData.districtsDeck.shift();

      this.player.cards.push(card1);
      this.player.cards.push(card2);

      store.commit("updatePlayerToGameData", this.player);
      this.socket.emit("updateGameData", this.gameData);

      this.powerUsed = true;
      this.showPowerScreen = false;
    },
    selectCardToDestroy() {
      this.isDestroying = true;
      this.showPowerScreen = false;
    },
    cancelDestroyingCard() {
      this.isDestroying = false;
    },
    destructionComplete() {
      this.isDestroying = false;
      this.canDestroy = false;
    },
  },
};
</script>

<style scoped>
.close-power-screen {
  z-index: 10000;
  background-color: red;
}
.use-power-container {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}

.trade-with-deck-container {
  width: 30%;
  height: 50%;
  background-color: rgb(34, 34, 34);
  z-index: 10000;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 25px 40px;
}

.trade-with-deck-zone {
  background-color: white;
  width: 100%;
  height: 60%;
  display: flex;
  align-items: center;
  overflow-x: scroll;
  margin-bottom: 20px;
}
.target-choices {
  width: 30%;
  height: 40%;
  background-color: rgb(34, 34, 34);
  z-index: 10000;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: space-between;
  margin: 15px;
}

.target-choices-button {
  margin: 10px;
}

h2 {
  color: white;
}
.button-container {
  width: 100%;
  height: 75%;
}

.gather-card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 100;
}

.game-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.played-ghost {
  opacity: 0;
}
.districts-card-zone {
  width: 100%;
  display: flex;
  padding: 15px;
  z-index: 1000;
}

.player-gold {
  position: absolute;
  right: 25px;
  bottom: 175px;
}

.game-table {
  width: 100%;
  height: 75%;
  background-color: gray;
  border-radius: 100%;
}

.game-table-container {
  width: 100%;
  height: 50%;
  padding-inline: 15px;
  position: absolute;
  bottom: 125px;
}

.resource-button {
  width: 40%;
  height: 60%;
  margin: 15px;
}
.player-crown-container {
  width: 100%;
  height: 100%;
}

.player-crown {
  width: 10%;
  height: 10%;
  position: absolute;
  right: 0;
  bottom: 8%;
}
.crown {
  width: 75%;
  height: 75%;
}
.end-turn-container {
  position: absolute;
  right: 25px;
  bottom: 140px;
  z-index: 100000;
}
.use-power-button-container {
  position: absolute;
  right: 25px;
  bottom: 50px;
  z-index: 100000;
}

.gather-resources-container {
  position: absolute;
  background-color: rgba(48, 48, 48, 0.534);
  border: 2px solid black;
  width: 50%;
  height: 15%;
  z-index: 1000000000;
  left: 25%;
  bottom: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.player-played-zone {
  width: 35%;
  height: 15%;
  background-color: rgb(223, 223, 223);
  position: absolute;
  bottom: 40%;
  left: 30%;
  transform: perspective(5px) rotateX(1deg);
  display: flex;
}

.ghost {
  opacity: 0;
}
.test {
  font-size: 36;
}
.bring-to-top {
  z-index: 10000;
}
.current-turn {
  position: absolute;
  top: 0;
  left: 0;
}
.grabbing * {
  cursor: grabbing !important;
}
.choose-title {
  position: absolute;
  top: 2%;
  left: 50%;
  transform: translate(-50%, 0);
  color: white;
  text-shadow: 0 0 10px black;
}
.characters-container {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  z-index: 10;
  z-index: 99999;
}
.hide-card {
  display: none;
}

.card {
  background-color: white;
}

.districts-deck {
  padding-top: 90px;
}

.character-card:hover {
  cursor: pointer;
}

.cancel-destroying-button {
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, 0);
  z-index: 1000000;
}
</style>
