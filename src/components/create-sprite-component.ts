import { ComponentID, ComponentRegistration, ValueOf } from '@/shared-types';

export const Sprite = {
   Air: '.',
   Coast: '#',
   Player: '@',
} as const;

export type SpriteEnum = ValueOf<typeof Sprite>;

export interface ISpriteComponent {
   sprite: SpriteEnum;
   layer: number;
   tint?: string;
}

export function createSpriteComponent(sprite: SpriteEnum, layer: number = 0): ComponentRegistration<typeof ComponentID.Sprite> {
   return {
      [ComponentID.Sprite]: { sprite, layer },
   };
}
