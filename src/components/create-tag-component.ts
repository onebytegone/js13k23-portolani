import { ComponentID, ComponentRegistration, ValueOf } from '@/shared-types';

export interface ITagComponent {}

// TODO: Types, only allow tag components to be created
export function createTagComponent<T extends ValueOf<typeof ComponentID>>(componentID: T): ComponentRegistration<T> {
   return {
      [componentID]: {},
   } as ComponentRegistration<T>;
}
