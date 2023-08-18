import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';

function getHeadingFromKeyEvent(event: KeyboardEvent): { x: number; y: number } | undefined {
   let x = 0, y = 0;

   if (event.code === 'KeyA' || event.code === 'KeyQ' || event.code === 'KeyZ') {
      x = -1;
   }

   if (event.code === 'KeyE' || event.code === 'KeyD' || event.code === 'KeyC') {
      x = 1;
   }

   if (event.code === 'KeyQ' || event.code === 'KeyW' || event.code === 'KeyE') {
      y = -1;
   }

   if (event.code === 'KeyZ' || event.code === 'KeyX' || event.code === 'KeyC') {
      y = 1;
   }

   if (x || y) {
      return { x, y };
   }
}

export class InputSystem extends System {

   static components = [ ComponentID.Movement, ComponentID.Input ] as const;

   public constructor(worldState: WorldState, onInput: () => void) {
      super();

      document.addEventListener('keydown', (event) => {
         const heading = getHeadingFromKeyEvent(event);

         if (heading) {
            worldState.getEntities(InputSystem.components).forEach((entityID) => {
               const [ movement ] = worldState.getComponents(entityID, InputSystem.components);

               movement.x = heading.x;
               movement.y = heading.y;
            });

            onInput();
         }
      });
   }

   // eslint-disable-next-line class-methods-use-this
   public update(_delta: number, worldState: WorldState): void {
      worldState.getEntities(InputSystem.components).forEach((entityID) => {
         const [ movement ] = worldState.getComponents(entityID, InputSystem.components);

         // Stop all movement in prep for the next key up
         movement.x = 0;
         movement.y = 0;
      });
   }

}
