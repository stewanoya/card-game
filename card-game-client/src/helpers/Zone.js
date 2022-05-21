export default class Zone {
  constructor(scene) {
    this.renderZone = () => {
      let dropZone = scene.add
        .zone(640, 500, 1000, 200) // x, y origin, x width, y height
        .setRectangleDropZone(1000, 200);
      dropZone.setData({ cards: 0 });
      return dropZone;
    };
    this.renderOutline = (dropZone) => {
      let dropZoneOutline = scene.add.graphics();
      dropZoneOutline.lineStyle(4, 0xff69b4);
      dropZoneOutline.strokeRect(
        dropZone.x - dropZone.input.hitArea.width / 2,
        dropZone.y - dropZone.input.hitArea.height / 2,
        dropZone.input.hitArea.width,
        dropZone.input.hitArea.height
      );
    };
  }
}
