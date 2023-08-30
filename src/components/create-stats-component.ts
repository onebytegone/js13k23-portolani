import { ComponentID, ComponentRegistration } from '@/shared-types';

export interface IStatsComponent {
   food: number;
   lastReportedFood?: number;
   portsVisited: number;
   totalPorts: number;
   navLog: boolean;
   soundingLine: boolean;
   localCrew: boolean;
   event?: string,
}

export function createStatsComponent(stats: IStatsComponent): ComponentRegistration<typeof ComponentID.Stats> {
   return {
      [ComponentID.Stats]: { ...stats },
   };
}
