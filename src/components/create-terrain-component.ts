import { ComponentID, ComponentRegistration, ValueOf } from '@/shared-types';

export const Terrain = {
   Passable: 0,
   Impassable: 1,
} as const;

export type TerrainEnum = ValueOf<typeof Terrain>;

export interface ITerrainComponent {
   terrain: TerrainEnum;
}

export function createTerrainComponent(terrain: TerrainEnum): ComponentRegistration<typeof ComponentID.Terrain> {
   return {
      [ComponentID.Terrain]: { terrain },
   };
}
