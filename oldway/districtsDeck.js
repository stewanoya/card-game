import * as fs from "fs";
import Card from "./card.js";
import {
  getUniqueDescription,
  getUniqueAbility,
} from "./Helpers/getUniqueValues.js";
const districtsDataPath = "./assets/DEFAULT_DISTRICTS.txt";
const districtDataRAW = fs.readFileSync(districtsDataPath, "utf-8");
const distractDataRows = districtDataRAW.split("\n").slice(0, -1);

const DISTRICT_DETAILS = [];
const DISTRICT_QUANTITIES = [];

distractDataRows.forEach((row, index) => {
  if (index !== 0) {
    let rowParsed = row.split("\r").slice(0, -1);
    let rowData = rowParsed[0].split(",");
    const Quantity = rowData[0];
    const Name = rowData[1];
    const Cost = rowData[2];
    const Type = rowData[3];

    DISTRICT_QUANTITIES.push(Quantity);
    DISTRICT_DETAILS.push({ Name, Cost, Type });
  }
});

class DistrictsDeck {
  constructor() {
    this.cards = this.newDeck(DISTRICT_DETAILS, DISTRICT_QUANTITIES);
  }

  newDeck = (districtDetails, quantities) => {
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
  };
}

class DistrictsCard extends Card {
  constructor(districtName, cost, type) {
    super();
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
