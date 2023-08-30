import { ComponentID, ComponentRegistration } from '@/shared-types';

export interface IStatsComponent {
   food: number;
   portsVisited: number;
   totalPorts: number;
   navLog: boolean;
   soundingLine: boolean;
   localCrew: boolean;
}

export function createStatsComponent(stats: IStatsComponent): ComponentRegistration<typeof ComponentID.Stats> {
   return {
      [ComponentID.Stats]: { ...stats },
   };
}
