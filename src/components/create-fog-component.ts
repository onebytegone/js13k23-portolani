import { ComponentID, ComponentRegistration, ValueOf } from '@/shared-types';

export const FogLevel = {
   None: 0,
   Full: 1,
} as const;

export type FogLevelEnum = ValueOf<typeof FogLevel>;

export interface IFogComponent {
   level: FogLevelEnum;
}

export function createFogComponent(level: FogLevelEnum): ComponentRegistration<typeof ComponentID.Fog> {
   return {
      [ComponentID.Fog]: { level },
   };
}
