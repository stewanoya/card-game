export class Message {
  constructor(userName, text, time = Date.now()) {
    (this.userName = userName), (this.text = text), (this.time = time);
  }
}
