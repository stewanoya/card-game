export default class Chat {
  message;
  timestamp = Date.now();
  userName;

  constructor(message, userName) {
    this.message = message;
    this.userName = userName;
  }
}
