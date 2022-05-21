class Game {
  constructor(
    players = [],
    currentKing = null,
    currentPlayerTurn = null,
    nextPlayerTurn = null,
    turnNumber = 0
  ) {
    (this.players = players),
      (this.currentKing = currentKing),
      (this.currentPlayerTurn = currentPlayerTurn),
      (this.nextPlayerTurn = nextPlayerTurn);
  }
}
