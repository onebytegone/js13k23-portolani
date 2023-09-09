import Perlin from '../Perlin';
import { PRNG } from '../make-prng';
import { Vec2D, binaryThreshold, sCurve } from '../math';

function circleCutoff(mapSize: Vec2D, x: number, y: number): number {
   return Math.max(
      Math.pow(Math.sin(Math.PI / 1.02 * (x / mapSize.x + 0.01)), 0.4)
      * Math.pow(Math.sin(Math.PI / 1.02 * (y / mapSize.y + 0.01)), 0.4)
      - 0.2,
      0
   );
}

export function makeIslandGenerator(prng: PRNG, mapSize: Vec2D): (pos: Vec2D) => boolean {
   const landGenerator = new Perlin(prng, 10),
         canalGenerator = new Perlin(prng, 20);

   return ({ x, y }: Vec2D) => {
      const landNoise = landGenerator.get(x, y) * circleCutoff(mapSize, x, y),
            canalNoise = binaryThreshold(sCurve(Math.abs(canalGenerator.get(x, y))), 0.2);

      return !!(binaryThreshold(landNoise, 0.04) * canalNoise);

   };
}
