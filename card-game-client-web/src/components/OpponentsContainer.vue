<template>
  <div class="opponents-container" :class="numberOfPlayersClass">
    <Opponent
      v-for="(opponent, index) in opponents"
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
      :index="index"
      :disconnected="opponent.disconnected"
      :opponentsLength="opponents.length"
      :graveYardAbilityCheck="graveYardAbilityCheck"
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
    graveYardAbilityCheck: { type: Function, required: true },
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
}

.three-player-positioning {
  display: flex;
  justify-content: space-around;
}

.three-player-positioning--item {
  margin-top: -130px;
}

.six-player-positioning {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  position: relative;
}

.six-player-positioning--item:first-child {
  grid-row-start: 3;
  top: -90px;
  left: -70%;
}

.six-player-positioning--item:last-child {
  grid-row-start: 3;
  grid-column-start: 3;
  top: -90px;

  right: -65%;
}
.two-player-positioning--item {
  position: absolute;
  left: 50%;
  top: -130px;
  transform: translate(-50%, 0);
}

.six-player-positioning--item {
  top: -130px;
  width: 100%;
}
</style>
