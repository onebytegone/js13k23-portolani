import { ComponentID, ComponentRegistration, ValueOf } from '@/shared-types';

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

export interface IHeadingComponent {
   heading: HeadingEnum;
}

export const HEADING_SPRITES = {
   [Heading.N]: '↑',
   [Heading.NE]: '↗',
   [Heading.E]: '→',
   [Heading.SE]: '↘',
   [Heading.S]: '↓',
   [Heading.SW]: '↙',
   [Heading.W]: '←',
   [Heading.NW]: '↖',
} as const;


export function createHeadingComponent(heading: HeadingEnum): ComponentRegistration<typeof ComponentID.Heading> {
   return {
      [ComponentID.Heading]: { heading },
   };
}
