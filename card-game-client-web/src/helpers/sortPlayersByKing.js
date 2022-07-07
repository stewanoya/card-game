const sortPlayersByKing = (players) => {
  console.log("here is players at the start", players);
  let foundKing = players.find((player) => player.isKing === true);
  let sortedPlayers = [
    ...players.sort((a, b) => a.originalIndex - b.originalIndex),
  ];
  let fromKingToEnd = [
    ...sortedPlayers.splice(foundKing.originalIndex, sortedPlayers.length - 1),
  ];
  let fromStartToKing = [...sortedPlayers];

  console.log("here is what it becomes", [fromKingToEnd, fromStartToKing]);
};

export { sortPlayersByKing };
// not sure if king will be included twice here?
