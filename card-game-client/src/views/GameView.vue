<template>
  <div class="game-container">
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
    <h2 class="player-gold">Gold: {{ player.gold }}</h2>
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
      gatherResources: true,
      showCharacterCards: false,
      powerUsed: false,
    };
  },
  created() {
    this.socket.on("draftRound", (gameData) => {
      store.commit("updateGameData", gameData);
      this.draftRound();
    });

    this.socket.on("allPlayersDrafted", (gameData) => {
      store.commit("updateGameData", gameData);
      // sort game data in backend before passing back here.
      // So that a start characerRound function
      // can be called safely
      // we can also begin with the incoming playerturn name;
      this.startCharacterRound();
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
      store.commit("updateGameData", this.gameData);
      this.socket.emit("districtPlayed", this.gameData);
    },
    draftCharacter(character) {
      this.player.character = character;
      store.commit("updatePlayerToGameData", this.player);
      const index = this.gameData.charactersDeck.indexOf(character);
      this.gameData.charactersDeck[index].drafted = true;
      this.showCharacterCards = false;
      console.log("CHECKING IF GAMEDATA IS STILL BEING UPDATED", this.gameData);
      this.socket.emit("nextDraftRound", this.gameData);
    },
    startCharacterRound() {
      // if it's the players turn, display gather resource options
      // display character card start animation?
      // how to handle next turns?
    },
  },
};
</script>

<style scoped>
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

.current-turn {
  position: absolute;
  top: 0;
  left: 0;
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
</style>
