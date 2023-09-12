import { Vec2D } from '@/lib/math';
import { ComponentID, ComponentRegistration, ValueOf } from '@/shared-types';

export const Color = {
   OceanBG: '#3B727C',
   Wind: '#295057',
   Fish: '#B1C7CB',
   CoastBG: '#C7B598',
   Coast: '#A79371',
   CoastMap: '#938576',
   PortBG: '#9E565C',
   Port: '#351D1F',
   PortVisitedBG: '#4E6446',
   PortVisited: '#273223',
   PortVisitedCheck: '#9AB192',
   PortLineMap: '#813b41',
   LandBG: '#68865E',
   Land: '#41543B',
   Fog: '#DFD2BA',
   FogMap: '#CFC4AF',
   Default: '#2A261F',
   DefaultBG: '#E3D8C4',
   PlayerSail: '#E0DCD8',
   PlayerHull: '#C1B9B1',
} as const;

export const Sprite = {
   Air: '.',
   Coast: '•',
   Land: '↟',
   Player: '@',
   Port: '⚓︎',
   Pirate: '⚔',
   N: '↑',
   NE: '↗',
   E: '→',
   SE: '↘',
   S: '↓',
   SW: '↙',
   W: '←',
   NW: '↖',
   LocalCrew: '⊛',
   NavLog: '⇶',
   SoundingLine: '≊',
   Check: '✔︎',
} as const;

export const TARGET_SIZE = {
   Port: 0.6,
   Land: 0.55,
   Heading: 0.55,
   HeadingAngled: 0.43,
   Pirate: 0.55,
};

export const CHARACTER_FONT_STACK = 'Menlo,Segoe UI Symbol,Noto Emoji,monospace';

export const FISH_SVG_PATH = 'M95 50a40 40 0 0 1-70 6l-20 15l5-21l-5-21l20 15a40 40 0 0 1 70 6zM80 50a6 6 0 1 0-12 0a6 6 0 1 0 12 0z';
export const FISH_SVG_HTML =`<svg height="1em" viewBox="0 -20 100 100"><path d="${FISH_SVG_PATH}"/></svg>`;

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
   secondarySprite?: SpriteEnum | string;
   layer: SpriteLayerEnum;
   skew: number;
   size: Vec2D;
   tint?: string;
   secondaryTint?: string;
   font?: string;
   bg?: string;
   targetSize?: number;
}

type SpriteOptions = Partial<Pick<ISpriteComponent, 'layer' | 'tint' | 'font' | 'bg' | 'targetSize'>>;

export function createSpriteComponent(sprite: SpriteEnum | string, opts: SpriteOptions = {}): ComponentRegistration<typeof ComponentID.Sprite> {
   return {
      [ComponentID.Sprite]: { sprite, ...Object.assign({
         layer: 0,
         skew: 0,
         size: { x: 1, y: 1 },
      }, opts) },
   };
}
