const getUniqueDescription = (districtName) => {
  switch (districtName) {
    //write switch statement for all the unique descriptions
    case "University": //easy
      return `The cost for this district is 6, but is worth 8 Victory Points at the end of the game. The cost of the Warlord's Diplomat's ability targeting this district is based off the final cost of this district.`;
    case "Great Wall": //medium -> DONE!
      return `The cost for the Warlord's /Diplomat's ability when targeting your districts (excluding the Great Wall) is increased by 1 gold.`;
    case "Library": //medium -> DONE!
      return `If you choose to draw cards when you take an action, you must keep an extra card you have drawn.`;
    case "School of Magic": //medium -> DONE!
      return `For purposes of Income (not Victory Points), the School of Magic is considered to be a color of your choice every turn.`;
    case "Observatory": //hard -> DONE!
      return `If you choose to draw cards when you take an action, you must draw an extra card and put an extra card on the bottom of the District Deck face-down in any order.`;
    case "Graveyard": // hard -> DONE!
      return `When the Warlord destroys a district (excluding the Graveyard) with his ability, you may pay 1 gold to put the destroyed district into your hand (unless you are the Warlord).Note: If the Diplomat is used, remove this card from the game and randomly replace it with another card.`;
    case "Smithy": // medium -> DONE!
      return `Once during your turn, you may pay 2 gold to draw 3 district cards.`;
    case "Laboratory": // medium -> DONE!
      return `Once during your turn, you may put a district card from your hand to the bottom of the District Deck face-down and receive 1 gold from the bank.`;
    case "Keep": // easy -> DONE!
      return `The Keep cannot be targeted by the Warlord's / Diplomat's ability.`;
    case "Haunted City": // hard
      return `For purposes of Victory Points (not Income), the Haunted City is considered to be of any 1 color of your choice at the end of the game (unless you built it during the last round of the game).`;
    case "Dragon's Gate": // easy
      return `This district is worth 2 additional points at the end of the game`;
  }
};

const someFunc = () => {
  console.log("hello");
};

const getUniqueAbility = (districtName) => {
  return someFunc;
};

export { getUniqueDescription, getUniqueAbility };
