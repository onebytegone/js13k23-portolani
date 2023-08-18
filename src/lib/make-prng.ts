export type PRNG = () => number;

export function makePRNG(kernel: number): PRNG {
   return (): number => {
      // mulberry32
      kernel |= 0;
      kernel = kernel + 0x6D2B79F5 | 0;

      let t = Math.imul(kernel ^ kernel >>> 15, 1 | kernel);

      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;

      return ((t ^ t >>> 14) >>> 0) / 4294967296;
   };
}
