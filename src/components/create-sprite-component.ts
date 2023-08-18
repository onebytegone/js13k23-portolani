import { ComponentID, ComponentRegistration, ValueOf } from '@/shared-types';

export const Tint = {
   Ocean: 'blue',
   Coast: 'tan',
   Port: 'brown',
   Land: 'green',
} as const;

export const Sprite = {
   Air: '.',
   Coast: '#',
   Land: '^',
   Player: '@',
   Port: '$',
} as const;

export type SpriteEnum = ValueOf<typeof Sprite>;

export interface ISpriteComponent {
   sprite: SpriteEnum;
   layer: number;
   tint?: string;
}

export function createSpriteComponent(sprite: SpriteEnum, tint?: string, layer: number = 0): ComponentRegistration<typeof ComponentID.Sprite> {
   return {
      [ComponentID.Sprite]: { sprite, tint, layer },
   };
}
