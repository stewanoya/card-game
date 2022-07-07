const DEFAULT_CHARACTERS_8 = [
  { name: "Assassin", description: "Kill 1" },
  { name: "Thief", description: "Steal From 1" },
  { name: "Magician", description: "Trade Cards" },
  { name: "King", description: "Get Crown" },
  { name: "Bishop", description: "Get Money from RD" },
  { name: "Merchant", description: "Get Money from TD" },
  { name: "Architect", description: "Extra cards and builds" },
  { name: "Warlord", description: "Destroy 1" },
];

const CHARACTER_VALUES_8 = [1, 2, 3, 4, 5, 6, 7, 8];

class CharacterDeck {
  constructor(cards) {
    this.cards = cards;
  }

  toggleDraftCard = (index) => {
    return (this.cards[index].drafted = !this.cards[index].drafted);
  };

  burnCard = (cards) => {
    return (cards = cards.splice(Math.floor(Math.random() * cards.length), 1));
  };

  newDeck = (characters, values) => {
    return characters.flatMap((character, index) => {
      return new CharacterCard(
        character.name,
        values[index],
        character.description
      );
    });
  };
}

class CharacterCard {
  constructor(
    cardName,
    value,
    jobDescription,
    drafted = false,
    burned = false,
    isFaceUp = false
  ) {
    (this.name = cardName),
      (this.value = value),
      (this.jobDescription = jobDescription),
      (this.drafted = drafted),
      (this.burned = burned),
      (this.isFaceUp = isFaceUp);
  }
}

export {
  CharacterDeck,
  CharacterCard,
  DEFAULT_CHARACTERS_8,
  CHARACTER_VALUES_8,
};
