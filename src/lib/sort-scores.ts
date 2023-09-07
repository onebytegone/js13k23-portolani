export default function sortScores<T extends { ports: number; tiles: number; days: number }>(scores: T[]): void {
   scores.sort((a, b) => {
      const p = b.ports - a.ports,
            t = b.tiles - a.tiles,
            d = a.days - b.days;

      return p || t || d;
   });
}
