<template>
  <div class="opponent-container--item">
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
    <div class="avatar">
      <h5>{{ character ?? "No choice" }}</h5>
      <p>{{ userName }}</p>
    </div>
    <div class="details-container">
      <p>Cards: {{ cards.length }}</p>
      <p>Gold: {{ gold }}</p>
    </div>
    <div class="opponent-played-zone">
      <OpponentPlayedDistrict
        v-for="element in playedCards"
        :name="element.districtName"
        :type="element.type"
        :cost="element.cost"
        :key="element.id"
        class="flip-over"
        :class="{ 'red-glow': isDestroying }"
        @click="destroyCardHandler(element, userName)"
      />
    </div>
  </div>
</template>

<script>
import OpponentPlayedDistrict from "./OpponentPlayedDistrict.vue";
import store from "@/store";
import { mapMutations, mapState } from "vuex";

export default {
  props: {
    cards: { type: Array, required: true },
    playedCards: { type: Array, required: true },
    gold: { type: Number, required: true },
    userName: { type: String, required: true },
    character: { type: String, required: false },
    isKing: { type: Boolean, required: true },
    isDestroying: { type: Boolean, required: true },
    destructionComplete: { type: Function, required: true },
    currentTurn: { type: String, required: true },
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
  },
  methods: {
    destroyCardHandler(cardToDestroy, userName) {
      if (!this.isDestroying || this.player.gold < cardToDestroy.cost - 1) {
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
.opponent-container--item {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
}

.avatar {
  width: 50%;
  height: 100%;
  border-radius: 100%;
  background-color: rgb(224, 227, 255);
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
  width: 100%;
  height: 20%;
  background-color: rgb(223, 223, 223);
  position: absolute;
  top: 160%;
  left: 0;
  transform: perspective(1px) rotateX(0.75deg);
  display: flex;
  z-index: 1000;
}

.flip-over {
  transform: rotate(180deg);
}

.red-glow {
  background-color: rgba(252, 0, 0, 0.411);
}

.red-glow:hover {
  cursor: pointer;
}
</style>
