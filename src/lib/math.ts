import { ValueOf } from "@/shared-types";

export interface Vec2D {
   x: number;
   y: number;
}

export const Heading = {
   N: 0,
   NE: 1,
   E: 2,
   SE: 3,
   S: 4,
   SW: 5,
   W: 6,
   NW: 7,
} as const;

export type HeadingEnum = ValueOf<typeof Heading>;

export function headingToVec2D(heading: HeadingEnum): Vec2D {
   const vec = { x: 0, y: 0 };

   if (heading === Heading.NW || heading === Heading.N || heading === Heading.NE) {
      vec.y = -1;
   } else if (heading === Heading.SW || heading === Heading.S || heading === Heading.SE) {
      vec.y = 1;
   }

   if (heading === Heading.NW || heading === Heading.W || heading === Heading.SW) {
      vec.x = -1;
   } else if (heading === Heading.NE || heading === Heading.E || heading === Heading.SE) {
      vec.x = 1;
   }

   return vec;
}

export function vec2DToAngle(vec: Vec2D): number {
   return Math.atan2(vec.y, vec.x);
}

export function angleDifference(a: number, b: number): number {
   const phi = Math.abs(b - a) % (2 * Math.PI);

   return Math.abs(phi > Math.PI ? 2 * Math.PI - phi : phi);
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

export function sCurve(val: number): number {
   return 2 / (1 + Math.pow(Math.E, -5 * val)) - 1;
}
