import { ComponentID, ComponentRegistration } from '@/shared-types';

export interface IStatsComponent {
   food: number;
   portsVisited: number;
   navLog: number;
   soundingLine: number;
   localCrew: number;
}

export function createStatsComponent(stats: IStatsComponent): ComponentRegistration<typeof ComponentID.Stats> {
   return {
      [ComponentID.Stats]: { ...stats },
   };
}
