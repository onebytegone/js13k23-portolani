import { ComponentID, ComponentRegistration } from '@/shared-types';

export function createPositionComponent(x: number = 0, y: number = 0): ComponentRegistration<typeof ComponentID.Position> {
   return {
      [ComponentID.Position]: { x, y },
   };
}
