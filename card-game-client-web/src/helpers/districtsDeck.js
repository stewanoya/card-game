const districtDataRAW = `Quantity,Name,Value,Type
5,Tavern,1,green
4,Market,2,green
3,Trading Post,2,green
3,Docks,3,green
3,Harbor,4,green
2,Town Hall,5,green
3,Temple,1,blue
3,Church,2,blue
3,Monastery,3,blue
2,Cathedral,5,blue
3,Watchtower,1,red
3,Prison,2,red
3,Battlefield,3,red
2,Fortress,5,red
5,Manor,3,yellow
4,Castle,4,yellow
3,Palace,5,yellow
1,Haunted City,2,purple
2,Keep,3,purple
1,Laboratory,5,purple
1,Smithy,5,purple
1,Graveyard,5,purple
1,Observatory,5,purple
1,School of Magic,6,purple
1,Library,6,purple
1,Great Wall,6,purple
1,University,8,purple
1,Dragon Gate,8,purple`;
// const districtsDataPath = "./assets/DEFAULT_DISTRICTS.txt";

// import { readFileSync } from "fs";
import { getUniqueDescription, getUniqueAbility } from "./getUniqueValues.js";

const districtsDataPath = "../assets/DEFAULT_DISTRICTS.txt";
// const districtDataRAW = readFileSync(districtsDataPath, "utf-8");
const distractDataRows = districtDataRAW.split("\n");
const DISTRICT_DETAILS = [];
const DISTRICT_QUANTITIES = [];

distractDataRows.forEach((row, index) => {
  if (index !== 0) {
    let rowParsed = row.split(",");
    const Quantity = rowParsed[0];
    const Name = rowParsed[1];
    const Cost = rowParsed[2];
    const Type = rowParsed[3];

    DISTRICT_QUANTITIES.push(Quantity);
    DISTRICT_DETAILS.push({ Name, Cost, Type });
  }
});

export default class DistrictsDeck {
  constructor() {
    this.cards = this.createDeck(DISTRICT_DETAILS, DISTRICT_QUANTITIES);
  }

  createDeck(districtDetails, quantities) {
    let cards = [];
    for (let i = 0; i < districtDetails.length; i++) {
      let card = new DistrictsCard(
        districtDetails[i].Name,
        districtDetails[i].Cost,
        districtDetails[i].Type
      );

      if (quantities[i] > 1) {
        quantities[i]--;
        i--;
      }

      cards.push(card);
    }
    return cards;
  }

  shuffleDeck() {
    let currentIndex = this.cards.length,
      randomIndex;

    // while there are still elements to shuffle
    while (currentIndex != 0) {
      // picking remaining element
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // and swap it with the current element
      [this.cards[currentIndex], this.cards[randomIndex]] = [
        this.cards[randomIndex],
        this.cards[currentIndex],
      ];
    }

    return this.cards;
  }
}

class DistrictsCard {
  constructor(districtName, cost, type) {
    (this.districtName = districtName),
      (this.cost = cost),
      (this.value = cost),
      (this.type = type);
    if (type === "purple") {
      this.uniqueDescription = getUniqueDescription(districtName);
      this.abilityUsed = false;
      this.ability = getUniqueAbility(districtName);
    }
  }
}
