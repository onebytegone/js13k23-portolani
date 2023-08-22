import { ComponentID, ComponentRegistration } from '@/shared-types';

export interface IStatsComponent {
   food: number;
}

export function createStatsComponent(stats: IStatsComponent): ComponentRegistration<typeof ComponentID.Stats> {
   return {
      [ComponentID.Stats]: { ...stats },
   };
}
