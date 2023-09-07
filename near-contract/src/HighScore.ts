export class HighScore {
   sender: string;
   date: string;
   ports: number;
   tiles: number;
   days: number;

   constructor({ sender, ports, tiles, days }: HighScore) {
      this.sender = sender;
      this.ports = ports;
      this.tiles = tiles;
      this.days = days;
   }
}
