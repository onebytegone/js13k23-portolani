export interface Vec2D {
   x: number;
   y: number;
}
export function bucket(input: number, buckets: number = 2): number {
   return Math.floor(input * buckets) / buckets;
}

export function binaryThreshold(input: number, cutoff: number): number {
   return input < cutoff ? 0 : 1;
}

export function adjustRange(input: number, opts: { fromMin?: number; fromMax?: number; toMin?: number; toMax: number }): number {
   const { fromMin, fromMax, toMin, toMax } = {
      fromMin: 0,
      fromMax: 1,
      toMin: 0,
      ...opts,
   };

   return (input - fromMin) * (toMax - toMin) / (fromMax - fromMin) + toMin;
}

export function wrap(v: number, m: number): number {
   return v >= 0 ? v % m : (v % m + m) % m;
}

function smootherstep(x: number): number {
   return (6 * Math.pow(x, 5)) - (15 * Math.pow(x, 4)) + (10 * Math.pow(x, 3));
}

export function interp(x: number, a: number, b: number): number {
   return a + smootherstep(x) * (b - a);
}
