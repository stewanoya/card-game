<template>
  <div class="game-container">
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
      <CharacterCard
        v-for="character in gameData.charactersDeck"
        :key="character.name"
        :name="character.name"
        :value="character.value"
        :jobDescription="character.jobDescription"
        @click="draftCharacter(character)"
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
          :class="drag ? 'bring-to-top' : ''"
        >
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
import { mapGetters, mapState, mapMutations } from "vuex";
import draggable from "vuedraggable";
import {
  CharacterDeck,
  DEFAULT_CHARACTERS_8,
  CHARACTER_VALUES_8,
} from "@/helpers/characterDeck";

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
      resourceGatherCards: [],
    };
  },
  created() {
    this.socket.on("draftRound", (gameData) => {
      store.commit("updateGameData", gameData);
      this.draftRound();
    });

    this.socket.on("updateGameData", (gameData) => {
      store.commit("updateGameData", gameData);
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
    this.socket.on("nextPlayerTurn", (gameData) => {
      store.commit("updateGameData", gameData);
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
  },
  methods: {
    startGame() {
      if (this.init === false) {
        let districtsDeck = new DistrictsDeck().shuffleDeck();
        let charactersDeck = new CharacterDeck().newDeck(
          DEFAULT_CHARACTERS_8,
          CHARACTER_VALUES_8
        );

        const decks = { districtsDeck, charactersDeck };
        this.socket.emit("getDeckReady", decks);

        this.socket.on("initPlayerDetails", (gameData) => {
          store.commit("updateGameData", gameData);
          store.commit("updatePlayers", gameData.players);
          store.commit("updatePlayerFromGameData", gameData.players);
          this.socket.emit("beginDraft");
        });
      }
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
    canPlayDistrictHandler(card) {
      this.drag = true;
      const cardData = card.item.innerText.split("\n\n");
      const cardCost = Number(cardData[0]);
      const cardName = cardData[1];
      const cardType = cardData[2];
      this.rememberCardCost = cardCost;
      if (
        this.player.gold >= cardCost &&
        this.gameData.currentTurn === this.player.userName &&
        !this.districtPlayed
      ) {
        this.cardCanBePlayed = true;
      }
    },
    districtCardHasBeenPlayed() {
      this.cardCanBePlayed = false;
      this.districtPlayed = true;

      this.player.gold -= this.rememberCardCost;
      store.commit("updatePlayerToGameData", this.player);
      store.commit("updateGameData", this.gameData);
      this.socket.emit("districtPlayed", this.gameData);
    },
    draftCharacter(character) {
      this.player.character = character;
      store.commit("updatePlayerToGameData", this.player);
      const index = this.gameData.charactersDeck.indexOf(character);
      this.gameData.charactersDeck[index].drafted = true;
      this.showCharacterCards = false;
      this.socket.emit("nextDraftRound", this.gameData);
    },
    startPlayerRound() {
      this.gatherResources = true;
      // if it's the players turn, display gather resource options
      // display character card start animation?
      // how to handle next turns?
    },
    endTurnHandler() {
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
  },
};
</script>

<style scoped>
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

.end-turn-container {
  position: absolute;
  right: 25px;
  bottom: 140px;
  z-index: 100;
}
.gather-resources-container {
  position: absolute;
  background-color: rgba(48, 48, 48, 0.534);
  border: 2px solid black;
  width: 50%;
  height: 15%;
  z-index: 100;
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
.characters-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  z-index: 10;
  padding-top: 10%;
}
.hide-card {
  display: none;
}

.card {
  background-color: white;
}
</style>
