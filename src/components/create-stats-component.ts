import { Vec2D } from '@/lib/math';
import { ComponentID, ComponentRegistration } from '@/shared-types';

export interface IStatsComponent {
   day: number;
   food: number;
   lastReportedFood?: number;
   portsVisited: Vec2D[];
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
