import { ComponentID, ComponentRegistration } from '@/shared-types';
import { IStatsComponent } from './create-stats-component';

type UnionKeys<T> = T extends unknown ? keyof T : never;
type InvalidKeys<K extends string | number | symbol> = { [P in K]? : never };
type StrictUnionHelper<T, TAll> = T extends unknown ? (T & InvalidKeys<Exclude<UnionKeys<TAll>, keyof T>>) : never;
export type StrictUnion<T> = StrictUnionHelper<T, T>;

type StatChanges<T extends IStatsComponent = IStatsComponent> = { [U in keyof T]?: (T[U] extends number ? { adjust: number } : never) | { set: T[U] } };

export interface IEncounterComponent {
   statChanges: StatChanges;
}

export function createEncounterComponent(statChanges: StatChanges): ComponentRegistration<typeof ComponentID.Encounter> {
   return {
      [ComponentID.Encounter]: { statChanges },
   };
}
