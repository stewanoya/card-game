<template>
  <div class="opponents-container" :class="numberOfPlayersClass">
    <Opponent
      v-for="opponent in opponents"
      :key="opponent.userName"
      :cards="opponent.cards"
      :playedCards="opponent.districts"
      :gold="opponent.gold"
      :userName="opponent.userName"
      :character="opponent.character ? opponent.character.name : null"
      class="size"
      :isKing="opponent.isKing"
      :class="numberOfPlayersClassItem"
      :isDestroying="isDestroying"
      :destructionComplete="destructionComplete"
      :currentTurn="currentTurn"
    />
  </div>
</template>

<script>
import Opponent from "./Opponent.vue";
export default {
  props: {
    opponents: { type: Array, required: true },
    isDestroying: { type: Boolean, required: true },
    destructionComplete: { type: Function, required: true },
    currentTurn: { type: String, required: true },
  },
  name: "OpponentsContainer",
  components: {
    Opponent,
  },
  data() {
    return {};
  },
  computed: {
    numberOfPlayersClass() {
      let numberOfPlayers = this.opponents.length;

      if (!numberOfPlayers) {
        return;
      }

      switch (numberOfPlayers) {
        case 1:
          return "two-player-positioning";
        case 2:
          return "three-player-positioning";
        case 3:
          return "four-player-positioning";
        case 4:
          return "five-player-positioning";
        case 5:
          return "six-player-positioning";
        case 6:
          return "seven-player-positioning";
      }
    },
    numberOfPlayersClassItem() {
      let numberOfPlayers = this.opponents.length;
      if (!numberOfPlayers) {
        return;
      }
      switch (numberOfPlayers) {
        case 1:
          return "two-player-positioning--item";
        case 2:
          return "three-player-positioning--item";
        case 3:
          return "four-player-positioning--item";
        case 4:
          return "five-player-positioning--item";
        case 5:
          return "six-player-positioning--item";
        case 6:
          return "seven-player-positioning--item";
      }
    },
  },
};
</script>

<style scoped>
.opponents-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.size {
  width: 25%;
  height: 25%;
  /* TODO: Set max-width and min-width */
}
.two-player-positioning {
  display: flex;
  justify-content: center;
}

.six-player-positioning {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  width: 100%;
  height: 100%;
}

.six-player-positioning--item:first-child {
  margin-top: 65px;
}

.six-player-positioning--item:last-child {
  margin-top: 65px;
}
.two-player-positioning--item {
  margin-top: 50px;
}

.six-player-positioning--item {
  width: 60%;
  height: 60%;
}
</style>
