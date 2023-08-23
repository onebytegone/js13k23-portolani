import { Heading, HeadingEnum } from '@/lib/math';
import { ComponentID, ComponentRegistration } from '@/shared-types';

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
