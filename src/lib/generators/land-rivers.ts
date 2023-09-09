import Perlin from '../Perlin';
import { PRNG } from '../make-prng';
import { Vec2D, binaryThreshold, sCurve } from '../math';

export function makeRiverGenerator(prng: PRNG): (pos: Vec2D) => boolean {
   const streamGenerator = new Perlin(prng, 20),
         riverGenerator = new Perlin(prng, 30);

   return ({ x, y }: Vec2D) => {
      const streamNoise = binaryThreshold(sCurve(Math.abs(streamGenerator.get(x, y))), 0.15),
            riverNoise = binaryThreshold(sCurve(Math.abs(riverGenerator.get(x, y))), 0.21);

      return !!streamNoise && !!riverNoise;
   };
}
