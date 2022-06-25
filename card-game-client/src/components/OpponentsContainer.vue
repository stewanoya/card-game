<template>
  <div class="opponents-container" :class="numberOfPlayersClass"></div>
</template>

<script>
import Opponent from "./Opponent.vue";
export default {
  props: {
    opponents: { type: Array, required: true },
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
        console.log("NO PLAYERS");
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
  },
};
</script>

<style scoped>
.opponents-container {
  width: 100%;
  height: 100%;
  background-color: rgba(192, 58, 58, 0.418);
}
</style>
