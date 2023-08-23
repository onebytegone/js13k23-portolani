import { Vec2D } from '@/lib/math';
import { ComponentID, ComponentRegistration, ValueOf } from '@/shared-types';

export const Color = {
   OceanBG: '#3B727C',
   Wind: '#295057',
   CoastBG: '#C7B598',
   Coast: '#A79371',
   PortBG: '#9E565C',
   Port: '#351D1F',
   LandBG: '#68865E',
   Land: '#41543B',
   Default: '#DFD2BA',
   DefaultBG: '#E3D8C4',
} as const;

export const Sprite = {
   Air: '.',
   Coast: '•',
   Land: '↟',
   Player: '⛵️',
   Port: '★',
} as const;

export type SpriteEnum = ValueOf<typeof Sprite>;

export interface ISpriteComponent {
   sprite: SpriteEnum | string;
   layer: number;
   skew: number;
   size: Vec2D;
   tint?: string;
   bg?: string;
   filter?: string;
}

type SpriteOptions = Partial<Pick<ISpriteComponent, 'layer' | 'tint' |'bg' | 'filter'>>;

export function createSpriteComponent(sprite: SpriteEnum | string, opts: SpriteOptions = {}): ComponentRegistration<typeof ComponentID.Sprite> {
   return {
      [ComponentID.Sprite]: { sprite, ...Object.assign({
         layer: 0,
         skew: 0,
         size: { x: 1, y: 1 },
      }, opts) },
   };
}
