import { ComponentID, ComponentRegistration, PropsWithType } from '@/shared-types';
import { IStatsComponent } from './create-stats-component';

type UnionKeys<T> = T extends unknown ? keyof T : never;
type InvalidKeys<K extends string | number | symbol> = { [P in K]? : never };
type StrictUnionHelper<T, TAll> = T extends unknown ? (T & InvalidKeys<Exclude<UnionKeys<TAll>, keyof T>>) : never;
export type StrictUnion<T> = StrictUnionHelper<T, T>;

type StatChange <T extends keyof IStatsComponent = keyof IStatsComponent> = StrictUnion<{ stat: PropsWithType<IStatsComponent, number>, adjustment: number } | { stat: T, value: IStatsComponent[T] }>;

export interface IEncounterComponent {
   statChanges: StatChange[];
}

export function createEncounterComponent(statChanges: StatChange[]): ComponentRegistration<typeof ComponentID.Encounter> {
   return {
      [ComponentID.Encounter]: { statChanges },
   };
}