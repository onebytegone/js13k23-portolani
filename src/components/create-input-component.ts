import { ComponentID, ComponentRegistration } from '@/shared-types';

export function createInputComponent(): ComponentRegistration<typeof ComponentID.Input> {
   return {
      [ComponentID.Input]: {},
   };
}
