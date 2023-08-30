import { Vec2D } from '@/lib/math';
import { ComponentID, ComponentRegistration, ValueOf } from '@/shared-types';

export const Color = {
   OceanBG: '#3B727C',
   Wind: '#295057',
   CoastBG: '#C7B598',
   Coast: '#A79371',
   CoastMap: '#938576',
   PortBG: '#9E565C',
   Port: '#351D1F',
   PortLineMap: '#B05F66',
   LandBG: '#68865E',
   Land: '#41543B',
   Default: '#DFD2BA',
   DefaultBG: '#E3D8C4',
} as const;

export const Sprite = {
   Air: '.',
   Coast: '•',
   Land: '↟',
   Player: '@',
   Port: '★',
   N: '↑',
   NE: '↗',
   E: '→',
   SE: '↘',
   S: '↓',
   SW: '↙',
   W: '←',
   NW: '↖',
} as const;

export const FISH_SVG_PATH = 'M95 50a40 40 0 0 1-70 6l-20 15l5-21l-5-21l20 15a40 40 0 0 1 70 6zM80 50a6 6 0 1 0-12 0a6 6 0 1 0 12 0z';

export type SpriteEnum = ValueOf<typeof Sprite>;

export const SpriteLayer = {
   Default: 0,
   Wind: 1,
   Land: 2,
   Port: 3,
   Encounter: 4,
   Player: 5,
} as const;

export type SpriteLayerEnum = ValueOf<typeof SpriteLayer>;

export interface ISpriteComponent {
   sprite: SpriteEnum | string;
   layer: SpriteLayerEnum;
   skew: number;
   size: Vec2D;
   tint?: string;
   bg?: string;
}

type SpriteOptions = Partial<Pick<ISpriteComponent, 'layer' | 'tint' |'bg'>>;

export function createSpriteComponent(sprite: SpriteEnum | string, opts: SpriteOptions = {}): ComponentRegistration<typeof ComponentID.Sprite> {
   return {
      [ComponentID.Sprite]: { sprite, ...Object.assign({
         layer: 0,
         skew: 0,
         size: { x: 1, y: 1 },
      }, opts) },
   };
}
