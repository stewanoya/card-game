<template>
  <div class="community-build-container">
    <div class="community-build">
      <div class="target-player-container">
        <span class="currently-targeting-text">Currently targeting: </span>
        <select v-model="targetPlayer">
          <option selected disabled hidden>Please Choose a Player</option>
          <option
            class="option"
            v-for="opponent in opponents"
            :key="opponent.userName"
            :value="opponent"
          >
            {{ opponent.userName }}
          </option>
        </select>
        <n-tooltip
          class="unique-description"
          trigger="click"
          style="width: 300px"
        >
          <template #trigger>
            <n-button style="margin-left: 10px" type="info" circle size="small">
              ?
            </n-button>
          </template>
          <h1>Conditions for Community Build:</h1>
          <p>- You cannot afford the card with the gold you have.</p>
          <p>- You have selected a player to donate cards to</p>
          <p>- You are not donating more cards than the player has gold</p>
          <p>
            - You are donating the right number of cards to make up for the gold
            you lack
          </p>
          <p>-------------</p>
          <p>would be cool to have checkmarks or X's here</p>
        </n-tooltip>
        <p v-if="targetPlayer" class="target-player-text">
          Targeted Player Gold:
          <span class="gold-amount">{{ targetPlayer.gold }}</span>
        </p>
      </div>

      <div class="draggables-container">
        <div class="to-be-built">
          <h3 style="position: fixed">Place one card you want to build here</h3>
          <draggable
            class="drop-zone building-drop-zone"
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
                ghost-class="card"
                id="card"
              /> </template
          ></draggable>
        </div>

        <div class="to-be-given">
          <h3 style="position: fixed">Place the cards you are donating here</h3>
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
                ghost-class="card"
                item-key="id"
                id="card"
              /> </template
          ></draggable>
        </div>
      </div>
      <div class="button-container">
        <n-space justify="center" style="margin: 20px 0">
          <n-button
            strong
            size="large"
            round
            primary
            type="success"
            @click="submitCommunityBuild"
            :disabled="!checkConditions"
          >
            Submit
          </n-button>
          <n-button
            strong
            size="large"
            round
            primary
            type="error"
            @click="cancelCommunityBuild"
            >Cancel</n-button
          >
        </n-space>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NButton, NSpace, NTooltip } from "naive-ui";
</script>

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
    NButton,
    NSpace,
    NTooltip,
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
      if (this.player.gold >= Number(this.cardToBeBuilt[0].cost)) {
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
#card {
  min-width: 125px;
}

.card {
  min-width: 125px !important;
  opacity: 0.5;
}
.building-drop-zone {
  justify-content: center !important;
}
h3 {
  color: white;
}
.currently-targeting-text,
.target-player-text {
  font-size: 18px;
  color: white;
  font-weight: 600;
}

.target-player-text {
  margin-top: 10px;
}

.gold-amount {
  background-color: gold;
  padding: 5px;
  padding-inline: 10px;
  border-radius: 100%;
  border: 2px solid rgb(148, 126, 2);
}
.community-build-container {
  width: 100%;
  height: 100%;
  position: absolute;
}

select {
  height: 2rem;
  margin-top: 10px;
}

.option {
  font-size: 20px;
  text-align: center;
  font-weight: 500;
}

.community-build {
  position: absolute;
  background-color: #452059;
  border: 2px solid #380256;
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
  background-color: #240536;
  display: flex;
  align-items: center;
  justify-content: center;
}
.to-be-given {
  width: 50%;
  height: 100%;
  margin: 10px;
  background-color: #240536;
  display: flex;
  align-items: center;
  overflow-x: auto;
  justify-content: center;
}

.drop-zone {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: start;
  z-index: 1000000000;
  box-shadow: inset 10px 15px 8px 5px rgba(0, 0, 0, 0.25);
}
</style>
