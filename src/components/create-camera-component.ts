import { ComponentID, ComponentRegistration } from '@/shared-types';

export interface ICameraComponent {
   x: number;
   y: number;
   viewportWidth: number;
   viewportHeight: number;
}

export function createCameraComponent(component: ICameraComponent): ComponentRegistration<typeof ComponentID.Camera> {
   return {
      [ComponentID.Camera]: { ...component },
   };
}
