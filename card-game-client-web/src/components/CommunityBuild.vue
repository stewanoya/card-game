<template>
  <div class="community-build-container">
    <div class="community-build">
      <div class="target-player-container">
        <span class="currently-targeting-text">Currently targeting: </span>
        <select v-model="targetPlayer">
          <option selected disabled hidden>Please Choose a Player</option>
          <option
            v-for="opponent in opponents"
            :key="opponent.userName"
            :value="opponent"
          >
            {{ opponent.userName }}
          </option>
        </select>
        <p v-if="targetPlayer">Targeted Player Gold: {{ targetPlayer.gold }}</p>
      </div>

      <div class="draggables-container">
        <div class="to-be-built">
          <h3 style="position: fixed">Card to be built (1)</h3>
          <draggable
            class="drop-zone"
            item-key="id"
            :list="cardToBeBuilt"
            @start="drag = true"
            @end="drag = false"
            group="cards"
          >
            <template #item="{ element }">
              <DistrictCard
                :name="element.districtName"
                :cost="element.cost"
                :type="element.type"
                :uniqueDescription="element.uniqueDescription"
                ghost-class="ghost"
                id="card"
              /> </template
          ></draggable>
        </div>

        <div class="to-be-given">
          <h3 style="position: fixed">Cards to be given away</h3>
          <draggable
            class="drop-zone"
            :list="cardsToGiveUp"
            @start="drag = true"
            @end="drag = false"
            group="cards"
          >
            <template #item="{ element }">
              <DistrictCard
                :name="element.districtName"
                :cost="element.cost"
                :type="element.type"
                :uniqueDescription="element.uniqueDescription"
                ghost-class="ghost"
                item-key="id"
                id="card"
              /> </template
          ></draggable>
        </div>
      </div>
      <button @click="submitCommunityBuild" :disabled="!checkConditions">
        Submit
      </button>
      <button @click="cancelCommunityBuild">Cancel</button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import draggable from "vuedraggable";
import DistrictCard from "./DistrictCard.vue";

export default {
  data() {
    return {
      drag: false,
      targetPlayer: undefined,
      cardToBeBuilt: [],
      cardsToGiveUp: [],
    };
  },
  name: "CommunityBuild",
  components: {
    draggable,
    DistrictCard,
  },
  props: {
    opponents: { type: Array, required: true },
    transactionHandler: { type: Function, required: true },
    districtPlayed: { type: Boolean, required: true },
  },
  computed: {
    ...mapState(["player"]),
    checkConditions() {
      // COST IS A STRING!!!!!!

      // NO PLAYER CHECK
      if (this.targetPlayer === undefined) {
        return false;
      }

      // NO CARDS CHECK
      if (this.cardToBeBuilt.length === 0 || this.cardsToGiveUp.length === 0) {
        return false;
      }

      // PLAYER CAN AFFORD CARD ON THEIR OWN
      if (this.player.gold >= this.cardToBeBuilt[0].cost) {
        return false;
      }

      // TOO MANY CARDS
      if (
        this.cardToBeBuilt.length > 1 ||
        this.cardsToGiveUp > this.targetPlayer.gold
      ) {
        return false;
      }

      // ALREADY BUILT
      if (this.districtPlayed === true) {
        return false;
      }

      // check that the player has enough gold with the cards being given away
      if (
        this.player.gold +
          this.cardsToGiveUp.length -
          Number(this.cardToBeBuilt[0].cost) <
        0
      ) {
        return false;
      }

      // PASS ALL CHECKS
      return true;
    },
  },
  methods: {
    targetPlayerHanlder(event) {
      console.log(event);
    },
    submitCommunityBuild() {
      this.transactionHandler(
        this.cardToBeBuilt,
        this.cardsToGiveUp,
        this.targetPlayer,
        "submit"
      );
      this.cardsToGiveUp = [];
      this.cardToBeBuilt = [];
      this.targetPlayer = {};
    },
    cancelCommunityBuild() {
      this.transactionHandler(
        this.cardToBeBuilt,
        this.cardsToGiveUp,
        null,
        "cancel"
      );
      this.cardsToGiveUp = [];
      this.cardToBeBuilt = [];
      this.targetPlayer = {};
    },
  },
};
</script>

<style scoped>
.community-build-container {
  width: 100%;
  height: 100%;
  position: absolute;
}

.community-build {
  position: absolute;
  background-color: rgb(2, 1, 7);
  width: 60%;
  height: 40%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-content: space-between;
  z-index: 1000000;
}

.draggables-container {
  width: 100%;
  height: 100%;
  display: flex;
}

.to-be-built {
  width: 50%;
  height: 100%;
  margin: 10px;
  background-color: lightblue;
  display: flex;
  align-items: center;
  justify-content: center;
}
.to-be-given {
  width: 50%;
  height: 100%;
  margin: 10px;
  background-color: lightblue;
  display: flex;
  align-items: center;
  overflow-x: scroll;
  justify-content: center;
}

.drop-zone {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: start;
  z-index: 1000000000;
}
</style>
