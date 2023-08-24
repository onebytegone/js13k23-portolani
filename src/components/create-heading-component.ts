import { Heading, HeadingEnum } from '@/lib/math';
import { ComponentID, ComponentRegistration } from '@/shared-types';
import { Sprite } from './create-sprite-component';

export interface IHeadingComponent {
   heading: HeadingEnum;
}

export const HEADING_SPRITES = {
   [Heading.N]: Sprite.N,
   [Heading.NE]: Sprite.NE,
   [Heading.E]: Sprite.E,
   [Heading.SE]: Sprite.SE,
   [Heading.S]: Sprite.S,
   [Heading.SW]: Sprite.SW,
   [Heading.W]: Sprite.W,
   [Heading.NW]: Sprite.NW,
} as const;


export function createHeadingComponent(heading: HeadingEnum): ComponentRegistration<typeof ComponentID.Heading> {
   return {
      [ComponentID.Heading]: { heading },
   };
}
