<template>
  <div
    class="opponent-container--item"
    :class="{ 'reverse-container': index === opponentsLength - 1 }"
  >
    <div class="crown-container" v-if="isKing">
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
    <div
      class="avatar"
      :class="{
        'turn-indicator': gameData.currentTurn === userName,
      }"
    >
      <p v-if="disconnected">DISCONNECTED!</p>
      <h5 v-if="gameData.currentTurn === userName">{{ character }}</h5>

      <p>{{ userName }}</p>
      <h3 v-if="gameData.currentTurn === userName && !character">Drafting..</h3>
      <div
        class="details-container"
        :class="{ 'reverse-details-container': index === opponentsLength - 1 }"
      >
        <p>Cards: {{ cards.length }}</p>
        <p>Gold: {{ gold }}</p>
      </div>
      <div class="opponent-played-zone" :class="doesDropZoneNeedRotation">
        <OpponentPlayedDistrict
          v-for="element in playedCards"
          :name="element.districtName"
          :type="element.type"
          :cost="element.cost"
          :uniqueDescription="element.uniqueDescription"
          :key="element.id"
          class="flip-over opponent-played-card"
          :class="{
            // cannot destroy completed city
            'red-glow': isDestroying && playedCards.length !== 7,
          }"
          @click="destroyCardHandler(element, userName)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import OpponentPlayedDistrict from "./OpponentPlayedDistrict.vue";
import store from "@/store";
import { mapMutations, mapState } from "vuex";

export default {
  props: {
    disconnected: { type: Boolean, required: true },
    cards: { type: Array, required: true },
    playedCards: { type: Array, required: true },
    gold: { type: Number, required: true },
    userName: { type: String, required: true },
    character: { type: String, required: false },
    isKing: { type: Boolean, required: true },
    isDestroying: { type: Boolean, required: true },
    destructionComplete: { type: Function, required: true },
    index: { type: Number, required: true },
    opponentsLength: { type: Number, required: true },
  },
  name: "Opponent",
  components: {
    OpponentPlayedDistrict,
  },
  data() {
    return {};
  },
  computed: {
    ...mapState(["socket", "gameData", "player"]),
    ...mapMutations(["destroyPlayedCard"]),
    doesDropZoneNeedRotation() {
      // only need to rotate the first and last dropzones if there are 2 or more opponents
      if (this.opponentsLength > 2) {
        if (this.index === 0) {
          return "first-child-rotation";
        }

        if (this.index === this.opponentsLength - 1) {
          return "last-child-rotation";
        }
      }
    },
  },
  methods: {
    destroyCardHandler(cardToDestroy, userName) {
      if (!this.isDestroying || this.player.gold < cardToDestroy.cost - 1) {
        return;
      }

      if (this.playedCards.length === 7) {
        //do nothing if completed city
        return;
      }
      const data = { cardToDestroy, userName };
      store.commit("destroyPlayedCard", data);
      this.socket.emit("updateGameData", this.gameData);
      this.destructionComplete();
    },
  },
};
</script>

<style scoped>
h3 {
  font-size: 14px;
  font-weight: bold;
}
.opponent-container--item {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  z-index: 10;
}

.reverse-container {
}

.avatar {
  position: relative;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
  max-height: 125px;
  max-width: 125px;
  aspect-ratio: 1;
  border-radius: 100%;
  background-color: rgb(224, 227, 255);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.crown-container {
  width: 100%;
  height: 100%;
  position: absolute;
}
.crown {
  position: absolute;
  width: 25%;
  height: 25%;
  bottom: 0;
}
.opponent-played-zone {
  width: 300%;
  max-width: 300px;
  min-height: 90px;
  background: rgba(217, 217, 217, 0.35);
  border: 5px solid #111420;
  box-shadow: 0px 4px 4px #000000;
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translate(-50%, 200%);
  display: flex;
  align-items: center;
  z-index: 10;
}

.flip-over {
  transform: rotate(180deg);
}

.red-glow {
  background-color: rgba(156, 4, 4, 0.644);
  box-shadow: 0 0 0 0 rgb(143, 0, 0, 1);
  transform: scale(1) rotate(180deg);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95) rotate(180deg);
    box-shadow: 0 0 0 0 rgba(143, 0, 0, 0.7);
  }

  70% {
    transform: scale(1) rotate(180deg);
    box-shadow: 0 0 0 10px rgba(143, 0, 0, 0);
  }

  100% {
    transform: scale(0.95) rotate(180deg);
    box-shadow: 0 0 0 0 rgba(143, 0, 0, 0);
  }
}

.red-glow:hover {
  cursor: pointer;
}

.turn-indicator {
  animation: glowingTurnIndicator 2.5s ease-in-out infinite;
}

@keyframes glowingTurnIndicator {
  0% {
    box-shadow: 0px 0px 1px 1px green;
  }
  50% {
    box-shadow: 0px 0px 10px 5px green;
  }
  100% {
    box-shadow: 0px 0px 1px 1px green;
  }
}

.first-child-rotation {
  transform: rotate(-90deg);
  left: 100%;
  top: 0;
}

.last-child-rotation {
  transform: rotate(90deg);
  left: -210%;
  top: 0;
}

.details-container {
  position: absolute;
  right: -55px;
  top: 0;
  z-index: 100;
  color: white;
}

.opponent-played-card {
}
</style>
