<template>
  <div class="game-container">
    <CommunityBuild
      :opponents="opponents"
      :transaction-handler="communityBuildTransaction"
      :districtPlayed="districtPlayed"
      v-if="showCommunityBuildingScreen"
    />
    <div class="player-crown" v-if="player.isKing">
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

    <div class="gather-card-container" v-if="resourceGatherCards.length >= 2">
      <n-card
        :title="
          doesPlayerHaveLibrary ? 'Select 2 cards' : 'Double tap your choice'
        "
        class="gather-card"
      >
        <div style="display: flex; justify-content: space-around">
          <DistrictCard
            v-for="card in resourceGatherCards"
            :class="{
              'selected-to-gather': !!selectedResourceGatherCards.find(
                (s) => s.id === card.id
              ),
            }"
            :name="card.districtName"
            :type="card.type"
            :cost="card.cost"
            :key="card.id"
            :uniqueDescription="card.uniqueDescription"
            @click="selectCardToGather(card)"
            @dblclick="gatherCardSelected(card)"
          />
        </div>
        <n-button
          v-if="doesPlayerHaveLibrary"
          type="success"
          size="large"
          :disable="selectedResourceGatherCards.length < 2"
          @click="submitMultipleResourceGatherCards"
          >Submit choices</n-button
        >
      </n-card>
    </div>
    <div class="chats-container">
      <div class="chats" ref="messageContainer">
        <div class="chat-message"></div>
        <div
          v-for="chat of chats"
          :key="chat.timestamp"
          class="chat-message"
          :class="{ 'system-message': chat.userName === 'System' }"
        >
          <p>{{ chat.userName }}</p>
          <p>({{ new Date(chat.timestamp).toLocaleTimeString() }})</p>
          :
          <p>{{ chat.message }}</p>
        </div>
      </div>
      <div class="flex">
        <n-input
          style="text-align: left"
          @keyup.enter="sendChat()"
          v-model:value="chatMessage"
          placeholder="Message.."
        />
        <n-button color="purple" @click="sendChat()">Send</n-button>
      </div>
    </div>

    <div class="final-scores-container" v-if="showFinalScores">
      <div class="final-scores">
        <ul>
          <li class="final-score-row">
            <span style="font-size: 2rem">Place</span>
            <span style="font-size: 2rem">Player</span>
            <span style="font-size: 2rem">Score</span>
          </li>
          <li
            v-for="(score, index) of finalScores"
            :key="score.userName"
            class="final-score-row"
          >
            <span
              class="final-place"
              :class="{
                gold: index === 0,
                silver: index === 1,
                bronze: index === 2,
              }"
              >&nbsp;{{ index + 1 }}&nbsp;</span
            >
            <span class="final-username">{{ score.user }}</span>
            <span class="final-score">{{ score.score }}</span>
          </li>
        </ul>
      </div>
      <n-button size="large" type="info" class="back-to-lobby-button"
        >Back to Lobby</n-button
      >
    </div>

    <div class="unique-ability-container" v-if="isUsingSchoolOfMagicAbility">
      <h3>What type would you like to change School of Magic to?</h3>
      <div style="display: flex; flex-wrap: wrap">
        <n-button @click="setSchoolOfMagicColor('yellow')">Yellow</n-button>
        <n-button @click="setSchoolOfMagicColor('blue')">Blue</n-button>
        <n-button @click="setSchoolOfMagicColor('green')">Green</n-button>
        <n-button @click="setSchoolOfMagicColor('red')">Red</n-button>
        <n-button @click="setSchoolOfMagicColor('Purple')">Purple</n-button>
      </div>
      <n-button type="error" size="large" @click="setSchoolOfMagicColor(null)"
        >Cancel</n-button
      >
    </div>
    <div class="unique-ability-container" v-if="showHauntedCityAbility">
      <h3>
        What type would you like to change Haunted City to for the end of the
        game?
      </h3>
      <div style="display: flex; flex-wrap: wrap">
        <n-button @click="setHauntedCityColor('yellow')">Yellow</n-button>
        <n-button @click="setHauntedCityColor('blue')">Blue</n-button>
        <n-button @click="setHauntedCityColor('green')">Green</n-button>
        <n-button @click="setHauntedCityColor('red')">Red</n-button>
        <n-button @click="setHauntedCityColor('Purple')">Purple</n-button>
      </div>
      <n-button type="error" size="large" @click="setHauntedCityColor(null)"
        >Cancel</n-button
      >
    </div>
    <div class="unique-ability-container" v-if="isUsingLabratoryAbility">
      <h3>Which card would you like to discard for 1 gold?</h3>
      <div style="display: flex; flex-wrap: wrap">
        <n-button
          v-for="card in player.cards"
          :key="card.id"
          @click="setLabratoryAbilityChoice(card)"
          >{{ card.districtName }}</n-button
        >
      </div>
      <n-button
        type="error"
        size="large"
        @click="setLabratoryAbilityChoice(null)"
        >Cancel</n-button
      >
    </div>
    <div class="unique-ability-container" v-if="showGraveYard">
      <h3>Would you like to keep this card destroyed card for 1 gold?</h3>
      <DistrictCard
        :name="graveYardCard.districtName"
        :type="graveYardCard.type"
        :cost="graveYardCard.cost"
        :key="graveYardCard.id"
        :uniqueDescription="graveYardCard.uniqueDescription"
      />
      <div style="display: flex; gap: 1rem">
        <n-button
          :disabled="player.gold < 1"
          type="success"
          size="large"
          @click="useGraveYardAbility(true)"
          >Yes</n-button
        >
        <n-button type="error" size="large" @click="useGraveYardAbility(false)"
          >No</n-button
        >
      </div>
    </div>
    <div class="use-power-container" v-if="showPowerScreen && !powerUsed">
      <!-- power screen can be it's own component -->
      <!-- I can pass down the character name as a prop -->

      <!-- ASSASSIN -->
      <div class="target-choices" v-if="draftedCharacterName === 'Assassin'">
        <h3 class="target-choices-title">
          Which character do you wish to kill?
        </h3>
        <div class="flex flex-wrap justify-center">
          <div v-for="character in charactersArray" :key="character.name">
            <n-button
              strong
              round
              color="#452059"
              size="large"
              v-if="character.name !== 'Assassin'"
              @click="
                killPlayer(
                  gameData,
                  getPlayerByCharacterName(character.name),
                  character.name
                )
              "
              class="target-choices-button"
              :key="character.name"
            >
              {{ character.name }}
            </n-button>
          </div>
        </div>
      </div>

      <!-- THIEF -->
      <div class="target-choices" v-if="draftedCharacterName === 'Thief'">
        <h3 class="target-choices-title">
          Which character do you wish to steal from?
        </h3>
        <div class="flex flex-wrap justify-center">
          <div v-for="character in charactersArray" :key="character.name">
            <n-button
              strong
              round
              color="#452059"
              size="large"
              :disabled="character.name === gameData.deadCharacter"
              v-if="character.name !== 'Thief'"
              @click="
                markPlayerForTheft(
                  gameData,
                  getPlayerByCharacterName(character.name),
                  character.name
                )
              "
              class="target-choices-button"
            >
              {{ character.name }}
            </n-button>
          </div>
        </div>
      </div>
      <!-- MAGICIAN-->
      <div class="target-choices" v-if="draftedCharacterName === 'Magician'">
        <h3 class="target-choices-title">Who will you exchange cards with?</h3>
        <div class="flex flex-wrap justify-center">
          <div v-for="opponent in opponents" :key="opponent.userName">
            <n-button
              round
              strong
              size="large"
              color="#452059"
              @click="
                tradeCards(
                  gameData,
                  getPlayerByCharacterName(opponent.character.name)
                )
              "
              class="target-choices-button"
            >
              {{ opponent.userName }}
            </n-button>
          </div>
        </div>
        <n-button
          style="width: 50%; margin: 0 auto"
          round
          strong
          size="large"
          type="info"
          @click="tradeCards(gameData, 'Deck')"
          class="target-choices-button"
        >
          Trade With Deck
        </n-button>
      </div>

      <!-- KING -->
      <div class="target-choices" v-if="draftedCharacterName === 'King'">
        <div class="flex flex-wrap justify-center align-center">
          <n-button
            strong
            size="large"
            round
            color="#452059"
            v-if="canCollectByType"
            @click="collectGoldByType(draftedCharacterName)"
            class="target-choices-button"
          >
            +1 Gold for each yellow ward played
          </n-button>
        </div>
      </div>

      <!-- BISHOP -->
      <div class="target-choices" v-if="draftedCharacterName === 'Bishop'">
        <h3 class="target-choices-title">Which power would you like to use?</h3>
        <div class="flex flex-wrap justify-center align-center">
          <n-button
            strong
            round
            size="large"
            color="#452059"
            v-if="canCollectByType"
            @click="collectCardsByType(draftedCharacterName)"
            class="target-choices-button"
          >
            Collect Cards by Card Type
          </n-button>
          <div>
            <n-button
              color="#452059"
              strong
              round
              size="large"
              v-if="!communityBuildCompleted"
              class="target-choices-button"
              @click="showCommunityBuildScreenHandler"
            >
              Community Build
            </n-button>
          </div>
        </div>
      </div>
      <!-- MERCHANT -->
      <div class="target-choices" v-if="draftedCharacterName === 'Merchant'">
        <h3 class="target-choices-title">Which power would you like to use?</h3>
        <div class="flex flex-wrap justify-center align-center">
          <n-button
            strong
            round
            size="large"
            color="#452059"
            v-if="canCollectByType"
            @click="collectGoldByType(draftedCharacterName)"
            class="target-choices-button"
          >
            Collect Gold By Card Type
          </n-button>
          <n-button
            strong
            round
            size="large"
            color="#452059"
            v-if="!gotPlusOneGold"
            class="target-choices-button"
            @click="plusOneGold"
          >
            +1 Gold
          </n-button>
        </div>
      </div>

      <!-- ARCHITECT -->
      <div class="target-choices" v-if="draftedCharacterName === 'Architect'">
        <n-button
          strong
          round
          size="large"
          color="#452059"
          style="width: 50%; margin: 0 auto"
          @click="collectTwoCards"
          class="target-choices-button"
        >
          Get +2 Cards
        </n-button>
      </div>

      <!-- WARLORD -->
      <div class="target-choices" v-if="draftedCharacterName === 'Warlord'">
        <h3 class="target-choices-title">Which power would you like to use?</h3>

        <n-button
          strong
          round
          size="large"
          type="error"
          v-if="canDestroy"
          @click="selectCardToDestroy"
          class="target-choices-button"
        >
          Destroy a played Card
        </n-button>
        <div>
          <n-button
            strong
            round
            size="large"
            color="#452059"
            v-if="canCollectByType"
            @click="collectGoldByType(draftedCharacterName)"
          >
            Collect Gold by card type
          </n-button>
        </div>
      </div>

      <n-button
        class="close-power-screen"
        round
        type="error"
        @click="showPowerScreenHandler"
      >
        Cancel
      </n-button>
    </div>

    <div class="trade-with-deck-container" v-if="isTradingWithDeck">
      <h3 class="trade-with-deck-title">
        Drop the cards you would like to Trade
      </h3>

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
            class="card-in-hand"
          />
        </template>
      </draggable>
      <div class="flex space-between" style="width: 75%">
        <n-button
          round
          strong
          size="large"
          type="success"
          @click="initTradeWithDeck"
          :disabled="cardsToBeTradedWithDeck.length < 1"
          >Trade</n-button
        >
        <n-button
          round
          strong
          size="large"
          type="error"
          @click="cancelTradeWithDeck"
          >Cancel</n-button
        >
      </div>
    </div>

    <div class="end-turn-container">
      <n-button
        @click="endTurnHandler"
        type="error"
        :disabled="
          gatherResources ||
          gameData.currentTurn !== player.userName ||
          showCharacterCards
        "
        >End Turn</n-button
      >
    </div>
    <div class="use-power-button-container">
      <n-button
        class="use-power-button"
        color="#452059"
        @click="showPowerScreenHandler"
        :disabled="
          powerUsed ||
          gatherResources ||
          gameData.currentTurn !== player.userName ||
          showCharacterCards
        "
      >
        Use Power
      </n-button>
    </div>
    <n-button
      size="large"
      type="error"
      round
      strong
      v-if="isDestroying"
      class="cancel-destroying-button"
      @click="cancelDestroyingCard"
    >
      Cancel Destroying
    </n-button>
    <div
      class="gather-resources-container"
      v-if="gatherResources && gameData.currentTurn == player.userName"
    >
      <h2>Gather Resources</h2>
      <div class="button-container">
        <n-button
          class="resource-button"
          @click="gatherGoldHandler"
          type="primary"
        >
          +2 Gold
        </n-button>
        <n-button class="resource-button" @click="gatherCardHandler" type="info"
          >Card</n-button
        >
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
        :class="
          character.isFaceUp || character.burned || character.drafted
            ? 'hide-card'
            : null
        "
      />
    </div>

    <div class="player-gold">
      <div class="big-gold-coin"></div>
      <span class="ml-2">{{ player.gold }}</span>
    </div>
    <div class="game-table-container">
      <div class="game-table">
        <OpponentsContainer
          :opponents="opponents"
          :isDestroying="isDestroying"
          :destructionComplete="destructionComplete"
          :graveYardAbilityCheck="graveYardAbilityCheck"
        />
        <div class="districts-deck">
          <div style="display: flex; gap: 15px; margin-bottom: 1rem">
            <h1>Burned Cards</h1>
            <n-tag
              type="error"
              round
              v-for="character in burnedFaceUpCharacters"
              :key="character.name"
              >{{ character.name }}</n-tag
            >
          </div>
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
              :uniqueDescription="element.uniqueDescription"
              :useSmithyAbility="useSmithyAbility"
              :smithyAbilityUsed="smithyAbilityUsed"
              :useSchoolOfMagicAbility="useSchoolOfMagicAbility"
              :schoolOfMagicAbilityUsed="schoolOfMagicAbilityUsed"
              :useLaboratoryAbility="useLaboratoryAbility"
              :laboratoryAbilityUsed="laboratoryAbilityUsed"
            />
          </template>
        </draggable>
      </div>
    </div>
    <div class="bottom-screen">
      <div class="player-info-container">
        <h1 class="player-userName">{{ player.userName }}</h1>
        <div class="profile-picture-container">
          <img
            class="profile-picture"
            src="https://images.unsplash.com/photo-1621272036047-bb0f76bbc1ad?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1612&q=80"
          />
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
            @dblclick="doubleClickPlayCard($event, element)"
            :type="element.type"
            :uniqueDescription="element.uniqueDescription"
            ghost-class="ghost"
            :key="element.id"
            id="card"
            class="card-in-hand"
          />
        </template>
      </draggable>
      <div class="chosen-character" v-if="player.character.name">
        <n-tooltip
          trigger="click"
          style="width: 300px; z-index: 99999999 !important"
        >
          <template #trigger>
            <n-button class="info-button" type="info"> i </n-button>
          </template>
          {{ player.character.jobDescription }}
        </n-tooltip>
        {{ player.character.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { NButton, NTooltip, NCard, NInput, NTag } from "naive-ui";
import Chat from "../models/Chat";
</script>

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
      initDraft: false,
      drag: false,
      chatMessage: "",
      smithyAbilityUsed: false,
      schoolOfMagicAbilityUsed: false,
      isUsingSchoolOfMagicAbility: false,
      laboratoryAbilityUsed: false,
      isUsingLabratoryAbility: false,
      cardCanBePlayed: false,
      rememberCardCost: undefined,
      districtPlayed: false,
      gatherResources: false,
      graveYardCard: null,
      showHauntedCityAbility: false,
      showGraveYard: false,
      showFinalScores: false,
      showCharacterCards: false,
      powerUsed: false,
      showPowerScreen: false,
      isUsingPower: false,
      isTradingWithDeck: false,
      isDestroying: false,
      gotPlusOneGold: false,
      showCommunityBuildingScreen: false,
      showFinalScores: false,
      canCollectByType: true,
      canDestroy: true,
      communityBuildCompleted: false,
      architectBuildLimitCounter: 0,
      cardsToBeTradedWithDeck: [],
      resourceGatherCards: [],
      selectedResourceGatherCards: [],
      charactersArray: [],
      finalScores: [],
    };
  },
  created() {
    this.socket.on("draftRound", (gameData) => {
      store.commit("updateGameData", gameData);
      this.draftRound();
    });

    this.socket.on("disonnectedPlayerDuringGame", (gameData) => {
      store.commit("updateGameData", gameData);
    });

    this.socket.on("finalTurn", () => {
      //in here I would do the Haunted City thing;
      this.checkIfPlayerHasHauntedCity();
      this.newChat(
        "🚨FINAL TURN🚨 - Someone has completed their city.",
        "System"
      );
    });

    this.socket.on("updateChats", (newChat) => {
      store.commit("updateChat", newChat);
    });

    this.socket.on("finalScores", ({ gameData, scores }) => {
      this.displayFinalScores(scores);
    });

    this.socket.on("updateGameData", (gameData) => {
      if (
        gameData.lastCardDestroyed &&
        gameData.lastCardDestroyed.userName &&
        gameData.currentTurn !== this.player.userName
      ) {
        this.graveYardAbilityCheck(gameData.lastCardDestroyed);
      }
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

    setTimeout(() => {
      this.startGame();
    }, 10);
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
    NButton,
    NTooltip,
    NCard,
  },
  watch: {
    chats: function () {
      this.$nextTick(function () {
        let container = this.$refs.messageContainer;
        container.scrollTop = container.scrollHeight;
      });
    },
  },
  computed: {
    ...mapState(["socket", "player", "gameData", "init", "chats"]),
    ...mapMutations([
      "updateGameData",
      "createNewPlayer",
      "setSocket",
      "updatePlayers",
      "updatePlayerFromGameData",
      "updateInit",
      "updatePlayerToGameData",
      "updateDeadCharacter",
      "setFinalTurn",
      "updateChat",
    ]),
    ...mapGetters(["opponents"]),
    isCharacterDraftedOrBurned(character) {
      if (character.burned || character.drafted) {
        return true;
      }
      return false;
    },

    burnedFaceUpCharacters() {
      return this.gameData.charactersDeck.filter((c) => c.isFaceUp);
    },
    draftedCharacterName() {
      return this.player.character.name;
    },
    doesPlayerHaveLibrary() {
      let library = this.player.districts.find(
        (d) => d.districtName === "Library"
      );

      if (library) {
        return true;
      }

      return false;
    },
    doesPlayerHaveObservatory() {
      let observatory = this.player.districts.find(
        (d) => d.districtName === "Observatory"
      );

      if (observatory) {
        return true;
      }

      return false;
    },
    doesPlayerHaveGraveyard() {
      let graveYard = this.player.districts.find(
        (d) => d.districtName === "Graveyard"
      );

      if (graveYard) {
        return true;
      }

      return false;
    },

    doesPlayerHaveHauntedCity() {
      let hauntedCity = this.player.districts.find(
        (d) => d.districtName === "Haunted City"
      );

      return !!hauntedCity;
    },
  },
  methods: {
    startGame() {
      if (this.init === true) {
        this.charactersArray = [...DEFAULT_CHARACTERS_8];
        this.socket.emit("getDeckReady");

        this.socket.on("initPlayerDetails", (gameData) => {
          console.log("is it sending initPlayerDetails twice?");
          store.commit("updateGameData", gameData);
          store.commit("updatePlayers", gameData.players);
          store.commit("updatePlayerFromGameData", gameData.players);
          // console.log("gameData", gameData);
          if (
            gameData.initOrderOfPlayers[0].userName === this.player.userName &&
            !this.initDraft
          ) {
            this.initDraft = true;
            console.log("BEGIN DRAFT ONLY GETTING CALLED ONCE");
            this.socket.emit("beginDraft", gameData);
          }
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
    //TODO: MOVE ALL BURNING TO SERVER SIDE
    // THIS FUNCTION IS REPEATED ON BOTH CLIENT SIDE AND SERVER SIDE
    burnCharacterCards(charactersDeck, numberOfPlayers) {
      if (numberOfPlayers === 6) {
        let indexToBurn = Math.floor(Math.random() * charactersDeck.length);
        charactersDeck[indexToBurn].burned = true;
        console.log("HERE IS CHARACTERS DECK", charactersDeck);
      }

      if (numberOfPlayers === 5) {
        let indexToBurn = Math.floor(Math.random() * charactersDeck.length);
        charactersDeck[indexToBurn].burned = true;
        let indexToFlip = indexToBurn;
        while (indexToBurn === indexToFlip) {
          indexToFlip = Math.floor(Math.random() * charactersDeck.length);
          // we cant burn king face up, so we just set it equal to index to burn to loop again.
          if (charactersDeck[indexToFlip].name === "King") {
            console.log("tried to burn king face up, rerolling");
            indexToFlip = indexToBurn;
            continue;
          }
        }
        charactersDeck[indexToFlip].isFaceUp = true;
      }

      if (numberOfPlayers === 4) {
        let indexToBurn = Math.floor(Math.random() * charactersDeck.length);
        charactersDeck[indexToBurn].burned = true;
        let indexToFlip = indexToBurn;
        while (indexToBurn === indexToFlip) {
          indexToFlip = Math.floor(Math.random() * charactersDeck.length);
          // we cant burn king face up, so we just set it equal to index to burn to loop again.
          if (charactersDeck[indexToFlip].name === "King") {
            console.log("tried to burn king face up, rerolling");
            indexToFlip = indexToBurn;
            continue;
          }
        }
        charactersDeck[indexToFlip].isFaceUp = true;

        let indexToFlip2 = indexToBurn;
        while (indexToFlip2 === indexToBurn) {
          indexToFlip2 = Math.floor(Math.random() * charactersDeck.length);

          if (
            indexToFlip2 === indexToFlip ||
            charactersDeck[indexToFlip2].name === "King"
          ) {
            indexToFlip2 = indexToBurn;
            continue;
          }
        }
        charactersDeck[indexToFlip2].isFaceUp = true;
      }
      store.commit("updateGameData", this.gameData);
      this.socket.emit("updateGameData", this.gameData);
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
      this.showFinalScores = false;
      this.isDestroying = false;
      this.gotPlusOneGold = false;
      this.showHauntedCityAbility = false;
      this.laboratoryAbilityUsed = false;
      this.showCommunityBuildingScreen = false;
      this.canCollectByType = true;
      this.canDestroy = true;
      this.communityBuildCompleted = false;
      this.architectBuildLimitCounter = 0;
      this.cardsToBeTradedWithDeck = [];
      this.resourceGatherCards = [];
      this.graveYardCard = null;
      this.showGraveYard = false;
      this.smithyAbilityUsed = false;
      this.schoolOfMagicAbilityUsed = false;
      this.finalScores = [];
      this.charactersArray = [...DEFAULT_CHARACTERS_8];
    },
    showPowerScreenHandler() {
      this.showPowerScreen = !this.showPowerScreen;
    },
    onChatMessageType(e) {
      this.chatMessage = e;
    },
    displayFinalScores(scores) {
      this.finalScores = scores;
      this.showFinalScores = true;
    },
    checkIfPlayerHasHauntedCity() {
      if (!this.doesPlayerHaveHauntedCity) {
        console.log("PLAYER DOESNT HAVE HAUNTED CITY");
        return;
      }

      this.showHauntedCityAbility = true;
    },
    setHauntedCityColor(choice) {
      let hauntedCity = this.player.districts.find(
        (d) => d.districtName === "Haunted City"
      );
      if (!choice) {
        this.showHauntedCityAbility = false;
        return;
      }
      hauntedCity.type = choice;
      this.showHauntedCityAbility = false;
      store.commit("updatePlayerToGameData", this.player);
      this.socket.emit("updateGameData", this.gameData);
    },
    useSmithyAbility() {
      if (this.player.gold < 2) {
        console.log("NOT ENOUGH GOLD!");
        return;
      }

      if (this.smithyAbilityUsed) {
        console.log("POWER ALREADY USED!");
        return;
      }

      this.player.gold = this.player.gold - 2;
      let card1 = this.gameData.districtsDeck.pop();
      let card2 = this.gameData.districtsDeck.pop();
      let card3 = this.gameData.districtsDeck.pop();

      this.player.cards.push(card1, card2, card3);
      this.newChat(`${this.player.userName} used their Smithy!`, "System");
      store.commit("updatePlayerToGameData", this.player);
      this.socket.emit("updateGameData", this.gameData);
      this.smithyAbilityUsed = true;
    },
    graveYardAbilityCheck({ userName, cardData }) {
      if (this.player.userName !== userName) {
        console.log("NOT THIS PLAYER");
        return;
      }

      if (!this.doesPlayerHaveGraveyard) {
        console.log("PLAYER DOESN'T HAVE GRAVEYARD");

        return;
      }

      this.graveYardCard = cardData;
      this.showGraveYard = true;
      console.log("GRAVEYARD SHOW", this.showGraveYard);
      console.log("FOR THIS CARD", cardData);
    },
    useGraveYardAbility(choiceToKeep) {
      if (!choiceToKeep) {
        this.graveYardCard = null;
        this.showGraveYard = false;
        this.gameData.lastCardDestroyed = null;
        this.socket.emit("updateGameData", this.gameData);
        return;
      }

      this.player.cards.push({ ...this.graveYardCard });
      this.newChat(
        `${this.player.userName} used their Gravyard to get back ${this.graveYardCard.districtName}!`,
        "System"
      );
      this.player.gold--;
      this.graveYardCard = null;
      this.showGraveYard = false;
      this.gameData.lastCardDestroyed = null;
      store.commit("updatePlayerToGameData", this.player);
      this.socket.emit("updateGameData", this.gameData);
    },
    sendChat() {
      this.newChat(this.chatMessage, this.player.userName);
      this.chatMessage = "";
    },
    newChat(message, userName) {
      let newChat = new Chat(message, userName);
      this.socket.emit("newChat", newChat);
    },
    useLaboratoryAbility() {
      if (this.laboratoryAbilityUsed) {
        return;
      }

      this.isUsingLabratoryAbility = true;
    },

    setLabratoryAbilityChoice(card) {
      if (!card) {
        this.isUsingLabratoryAbility = false;
      }
      this.player.cards = this.player.cards.filter((c) => c.id !== card.id);
      this.player.gold++;
      this.laboratoryAbilityUsed = true;
      this.isUsingLabratoryAbility = false;
      this.gameData.districtsDeck.push(card);
      this.newChat(
        `${this.player.userName} used their Labratory to discard ${card.districtName} for 1 gold.`,
        "System"
      );
      store.commit("updatePlayerToGameData", this.player);
      this.socket.emit("updateGameData", this.gameData);
    },
    useSchoolOfMagicAbility() {
      if (this.schoolOfMagicAbilityUsed) {
        return;
      }
      this.isUsingSchoolOfMagicAbility = true;
      console.log("is using", this.isUsingSchoolOfMagicAbility);
    },
    setSchoolOfMagicColor(choice) {
      let schoolOfMagic = this.player.districts.find(
        (d) => d.districtName === "School of Magic"
      );

      if (choice === schoolOfMagic.type) {
        return;
      }

      if (!choice) {
        this.isUsingSchoolOfMagicAbility = false;
        return;
      }
      schoolOfMagic.type = choice;
      this.isUsingSchoolOfMagicAbility = false;
      this.schoolOfMagicAbilityUsed = true;
      this.newChat(
        `${this.player.userName} changed their School of Magic to ${choice}!`,
        "System"
      );

      store.commit("updatePlayerToGameData", this.player);
      this.socket.emit("updateGameData", this.gameData);
    },
    generateID() {
      return Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substr(0, 5);
    },
    draftRound() {
      if (this.gameData.currentTurn === this.player.userName) {
        if (this.player.disconnected) {
          let cardToDraft = this.gameData.charactersDeck.find(
            (card) => card.drafted === false && card.burned === false
          );

          this.draftCharacter(cardToDraft);
        }
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
    doubleClickPlayCard(cardElement, card) {
      this.canPlayDistrictHandler(cardElement, true, card);

      if (this.cardCanBePlayed) {
        this.player.cards = this.player.cards.filter((c) => c.id !== card.id);
        this.player.districts.push(card);
        this.districtCardHasBeenPlayed();
      } else {
        console.log("THIS CANNOT BE PLAYED");
      }
    },
    canPlayDistrictHandler(card, isDblClick, cardDataFromDoubleClick) {
      console.log(card);
      this.drag = true;
      this.cardCanBePlayed = false;
      const cardData = isDblClick
        ? [
            cardDataFromDoubleClick.cost,
            cardDataFromDoubleClick.districtName,
            cardDataFromDoubleClick.type,
          ]
        : card.item.innerText.split("\n");
      const cardCost = Number(cardData[0]);
      const cardName = cardData[1];
      const cardType = cardData[3];
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
      if (this.player.districts.length === 7) {
        this.districtPlayed = true;
        if (this.gameData.finishedFirst === "") {
          this.gameData.finishedFirst = this.player.userName;
        }
        if (!this.gameData.finalTurn) {
          this.socket.emit("finalTurn");
          store.commit("setFinalTurn");
        }
      }
      this.newChat(`${this.player.userName} played a district.`, "System");
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
      this.newChat(`${this.player.userName} has drafted a character`, "System");
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
      this.newChat(`${this.player.userName} chose to gather 2 gold.`, "System");
      store.commit("updatePlayerToGameData", this.player);
      this.socket.emit("updateGameData", this.gameData);
    },
    gatherCardHandler() {
      this.gatherResources = false;
      let card1 = this.gameData.districtsDeck.shift();
      let card2 = this.gameData.districtsDeck.shift();
      let card3;
      this.newChat(`${this.player.userName} chose to draw a card.`, "System");
      if (this.doesPlayerHaveObservatory) {
        console.log("PLAYER HAS OBSERVATORY");
        card3 = this.gameData.districtsDeck.shift();
        this.newChat(
          `${this.player.userName} has the observatory, and drew an extra card.`,
          "System"
        );
      }
      this.resourceGatherCards = card3 ? [card1, card2, card3] : [card1, card2];
      store.commit("updateGameData", this.gameData);
      this.socket.emit("updateGameData", this.gameData);
    },
    selectCardToGather(chosenCard) {
      if (!this.doesPlayerHaveLibrary) {
        return;
      }

      let cardAlreadyChosen = this.selectedResourceGatherCards.find(
        (s) => s.id === chosenCard.id
      );
      if (cardAlreadyChosen) {
        this.selectedResourceGatherCards =
          this.selectedResourceGatherCards.filter(
            (s) => s.id !== cardAlreadyChosen.id
          );
        return;
      }

      if (this.selectedResourceGatherCards.length >= 2) {
        return;
      }
      this.selectedResourceGatherCards.push(chosenCard);
    },

    submitMultipleResourceGatherCards() {
      if (this.selectedResourceGatherCards.length < 2) {
        return;
      }
      for (let card of this.selectedResourceGatherCards) {
        this.player.cards.push(card);
      }
      store.commit("updatePlayerToGameData", this.player);
      store.commit("updateGameData", this.gameData);
      this.socket.emit("updateGameData", this.gameData);
      this.resourceGatherCards = [];
      this.selectedResourceGatherCards = [];
    },
    gatherCardSelected(chosenCard) {
      if (this.doesPlayerHaveLibrary) {
        console.log("DOUBLE CLICK DISABLED FOR LIBRARY");
        return;
      }
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
    killPlayer(gameData, playerToKill, characterName) {
      store.commit("updateDeadCharacter", characterName);
      let foundPlayer = gameData.players.find(
        (player) => player === playerToKill
      );
      if (!foundPlayer) {
        this.powerUsed = true;
        this.showPowerScreen = false;
        return;
      }
      foundPlayer.isAlive = false;
      this.newChat(
        `${this.player.userName} as the Assassin has killed the ${characterName}!`,
        "System"
      );
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
    markPlayerForTheft(gameData, playerToStealFrom, characterName) {
      console.log(playerToStealFrom);
      this.newChat(
        `${this.player.userName} as the Thief will be stealing from the ${characterName}.`,
        "System"
      );
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
      this.newChat(
        `${this.player.userName} as the Magician traded cards with ${playerToTradeWith.userName}.`,
        "System"
      );
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
        this.newChat(
          `${this.player.userName} as the Magician traded cards with the deck.`,
          "System"
        );
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
        this.newChat(
          `${this.player.userName} used the Kings power to collect ${numberOfYellows} gold.`,
          "System"
        );

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
        this.newChat(
          `${this.player.userName} used the merchants power to collect ${numberOfGreens} gold.`,
          "System"
        );
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
        this.newChat(
          `${this.player.userName} used the Warlords power to collect ${numberOfReds} gold.`,
          "System"
        );
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
        this.newChat(
          `${this.player.userName} used the Bishops power to collect ${numberOfBlues} gold.`,
          "System"
        );
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
        this.newChat(
          `${this.player.userName} as the Bishop cancelled the community build.`,
          "System"
        );
        return;
      }

      targetPlayer.cards = [...targetPlayer.cards, ...toGive];
      targetPlayer.gold -= toGive.length;
      this.player.gold -= toBuild[0].cost - toGive.length; // player only pays difference;
      this.player.districts = [...this.player.districts, ...toBuild];
      this.cardCanBePlayed = false;
      this.districtPlayed = true;
      this.communityBuildCompleted = true;
      `${this.player.userName} the Bishop used the community build power to gold from ${targetPlayer.userName}.`,
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
      `${this.player.userName} as the Architect got two cards.`,
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
.flex {
  display: flex;
}

.space-between {
  justify-content: space-between;
}

.flex-wrap {
  flex-wrap: wrap;
}

.justify-center {
  justify-content: center;
}

.align-center {
  align-items: center;
}

.target-choices-title {
  font-size: 20px;
}

.final-scores-container {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: rgba(1, 1, 5, 0.836);
  backdrop-filter: blur(10px);
  z-index: 999999998;
}

.back-to-lobby-button {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}
.final-scores {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999999999;
  width: 50%;
  max-width: 30rem;
  height: 50%;
  max-height: 30rem;
  background-color: #380256;
  border: 2px solid #8143a3;
  box-shadow: inset 5px 10px 4px 5px rgba(0, 0, 0, 0.25);
  color: white;
  overflow-y: auto;
}

.chats-container {
  position: absolute;
  top: 0;
  right: 0;
}

.chats {
  width: 25rem;
  height: 5rem;
  background-color: #380256;
  border: 2px solid #8143a3;
  box-shadow: inset 5px 10px 4px 5px rgba(0, 0, 0, 0.25);

  overflow-y: auto;
  color: white;
}

.chat-message {
  font-size: 11px;
  display: flex;
  gap: 3px;
  padding-inline: 8px;
  max-width: 23rem;
}

.final-place {
  font-size: 1.5rem;
  font-weight: 600;
}
.final-score {
  font-size: 1.5rem;
}

.gold,
.bronze,
.silver {
  border-radius: 1000rem;
  width: 2.5rem;
  height: 2.5rem;
}

.gold {
  background-color: rgb(233, 199, 9);
}

.silver {
  background-color: silver;
}

.bronze {
  background-color: rgb(192, 130, 16);
}
.final-username {
  font-size: 1rem;
}

.gather-card {
  width: 50%;
  max-width: 50rem;
  background-color: #8143a3;
  border-color: #380256;
}
.selected-to-gather {
  border: 5px dashed #380256;
}
.absolute {
  position: absolute;
  top: -40%;
  left: -2%;
}
.ml-2 {
  margin-left: 10px;
}

.close-power-screen {
  z-index: 10000;
}
.use-power-container {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}

.trade-with-deck-title {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.system-message {
  color: yellow;
}

.trade-with-deck-container {
  width: 35%;
  height: 40%;
  background-color: #452059;
  border: 2px solid #380256;
  z-index: 10000;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  padding: 25px 40px;
}

.trade-with-deck-zone {
  background-color: #1e052c;
  box-shadow: inset 5px 10px 4px 5px rgba(0, 0, 0, 0.25);
  width: 100%;
  height: 60%;
  display: flex;
  align-items: center;
  overflow-x: auto;
  margin-bottom: 20px;
}
.target-choices {
  width: 60%;
  height: 30%;
  background-color: rgb(34, 34, 34);
  z-index: 10000;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: space-around;
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
  flex-direction: column;
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
  overflow: hidden;
}

.played-ghost {
  opacity: 0;
}
.districts-card-zone {
  margin-left: auto;
  width: 90%;
  display: flex;
  padding: 15px;
  z-index: 1000;
}

.player-gold {
  display: flex;
  align-items: center;
  position: absolute;
  right: 165px;
  bottom: 22px;
  font-size: 24px;
  z-index: 99999;
  font-weight: bold;
}

.game-table {
  width: 75%;
  height: 65%;
  position: relative;
  background-color: #2a2a42;
  border: 7px solid rgba(165, 165, 165, 0.19);
  box-shadow: 0px 13px 4px rgba(0, 0, 0, 0.25),
    inset 0px 21px 4px rgba(0, 0, 0, 0.25);
  border-radius: 25px;
  margin: 0 auto;
}

.game-table-container {
  width: 100%;
  height: 70%;
  padding-inline: 15px;
  position: absolute;
  bottom: 20px;
}
.final-score-row {
  display: flex;
  margin-bottom: 0.25rem;
  justify-content: space-around;
  align-items: center;
}
.resource-button {
  width: 40%;
  height: 60%;
  margin: 15px;
}

.player-crown {
  width: 50px;
  height: 50px;
  position: absolute;
  left: 35px;
  bottom: 190px;
  z-index: 99999999;
}

.unique-ability-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40%;
  max-width: 30rem;
  height: 40%;
  max-height: 40rem;
  gap: 1rem;
  color: white;
  background-color: #1e052c;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 999999;
}
.crown {
  width: 100%;
  height: 100%;
}
.end-turn-container {
  position: absolute;
  right: 25px;
  bottom: 25px;
  z-index: 9999;
}
.use-power-button-container {
  position: absolute;
  right: 25px;
  bottom: 70px;
  z-index: 100000;
  width: fit-content;
}
.use-power-button {
  width: 200px;
  height: 60px;
  border: 2px solid #380256;
  font-size: 28px;
}
.gather-resources-container {
  position: absolute;
  background-color: #452059;
  border: 2px solid #380256;
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
  width: 60%;
  height: 30%;
  max-height: 125px;
  background: rgba(241, 241, 241, 0.836);
  border: 5px solid #111420;
  box-shadow: 0px 4px 4px #000000;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translate(-50%, 0);
  display: flex;
  padding-inline: 10px;
  align-items: center;
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

.choose-title {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, 0);
  color: white;
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 0 10px black;
}
.characters-container {
  width: 100%;
  height: 50%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: -5%;
  z-index: 99999;
}
.hide-card {
  display: none;
}

.card {
  background-color: white;
}

.districts-deck {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.character-card:hover {
  cursor: pointer;
}

.character-card-burned-faceup {
  width: 3rem;
  height: 6rem;
}

.cancel-destroying-button {
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, 0);
  z-index: 1000000;
}

.player-info-container {
  width: 100px;
  height: 100px;
  background-color: rgb(4, 2, 15);
  border-radius: 100%;
  position: relative;
  margin-left: 10px;
  border: 5px solid #452059;
}
.player-userName {
  position: absolute;
  left: 50%;
  top: -25px;
  transform: translate(-50%, 0);
}
.profile-picture {
  width: 150px;
  height: auto;
}

.profile-picture-container {
  width: 100%;
  height: 100%;
  border-radius: 100%;
  overflow: hidden;
}
.bottom-screen {
  height: fit-content;
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
}

.big-gold-coin {
  width: 40px;
  height: 40px;
  border-radius: 100%;
  background-color: #f2ea29;
  border: 1px solid #ffc700;
}

.chosen-character {
  width: 200px;
  font-size: 24px;
  color: white;
  height: 50px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #45205973;
  margin-right: 6rem;
  position: absolute;
  right: -70px;
  bottom: 140px;
  border: 3px solid rgb(3, 1, 10);
  border-radius: 5px;
  padding: 5px;
  z-index: 100000;
}

.info-button {
  margin-right: 10px;
  border-radius: 100%;
  width: 30px;
  height: 30px;
}

.card-in-hand {
  margin-right: -1.5rem;
  transition: margin-right 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.card-in-hand:hover {
  margin-right: 5px;
  transition: margin-right 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>
