import { PRNG } from './make-prng';
import { interp } from './math';

interface Vec2D {
   x: number;
   y: number;
}

export default class Perlin {

   private _vectors: Record<string, Vec2D> = {};

   public constructor(private _prng: PRNG, private _scale: number = 1) {}

   public get(x: number, y: number): number {
      x = x / this._scale;
      y = y / this._scale;

      const xf = Math.floor(x),
            yf = Math.floor(y),
            tl = this._dotProductGrid(x, y, xf, yf),
            tr = this._dotProductGrid(x, y, xf + 1, yf),
            bl = this._dotProductGrid(x, y, xf, yf + 1),
            br = this._dotProductGrid(x, y, xf + 1, yf + 1),
            xt = interp(x - xf, tl, tr),
            xb = interp(x - xf, bl, br),
            v = interp(y - yf, xt, xb);

      return v;
   }

   private _dotProductGrid(x: number, y: number, vx: number, vy: number): number {
      const gradientVector = this._getGradientVector(vx, vy);

      return (x - vx) * gradientVector.x + (y - vy) * gradientVector.y;
   }

   private _getGradientVector(x: number, y: number): Vec2D {
      const key = `${x},${y}`;

      if (!this._vectors[key]) {
         const theta = this._prng() * 2 * Math.PI;

         this._vectors[key] = { x: Math.cos(theta), y: Math.sin(theta) };
      }

      return this._vectors[key];
   }

}
