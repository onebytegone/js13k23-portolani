import { ComponentID, ComponentIDEnum, ComponentMap, ComponentRegistration } from '@/shared-types';

type UnionKeys<T> = T extends unknown ? keyof T : never;
type InvalidKeys<K extends string | number | symbol> = { [P in K]? : never };
type StrictUnionHelper<T, TAll> = T extends unknown ? (T & InvalidKeys<Exclude<UnionKeys<TAll>, keyof T>>) : never;
export type StrictUnion<T> = StrictUnionHelper<T, T>;

export type Changes<T> = {
   [U in keyof T]?: (T[U] extends number ? { adjust: number } : never)
      | (T[U] extends any[] ? { push: T[U][number] } : never)
      | { set: T[U] }
};

export type EntityChanges = { [P in ComponentIDEnum]? : Changes<ComponentMap[P]> };

export interface IEncounterComponent {
   destroyEntity?: boolean;
   playerChanges?: EntityChanges;
   entityChanges?: EntityChanges;
}

export function createEncounterComponent(component: IEncounterComponent): ComponentRegistration<typeof ComponentID.Encounter> {
   return {
      [ComponentID.Encounter]: { ...component },
   };
}
