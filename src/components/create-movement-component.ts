import { ComponentID, ComponentRegistration } from '@/shared-types';

export interface IMovementComponent {
   x: number;
   y: number;
   nextMovePossible: number;
}

export function createMovementComponent(x: number = 0, y: number = 0): ComponentRegistration<typeof ComponentID.Movement> {
   return {
      [ComponentID.Movement]: { x, y, nextMovePossible: 0 },
   };
}
