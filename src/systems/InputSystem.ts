import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';
import { HeadingEnum, headingToVec2D } from '@/lib/math';

export class InputSystem extends System {

   static components = [ ComponentID.Movement, ComponentID.Input ] as const;

   public constructor(private _worldState: WorldState) {
      super();
   }

   public processHeadingInput(heading: HeadingEnum): void {
      this._worldState.getEntities(InputSystem.components).forEach((entityID) => {
         const [ movement ] = this._worldState.getComponents(entityID, InputSystem.components),
               vec = headingToVec2D(heading);

         movement.x = vec.x;
         movement.y = vec.y;
      });
   }

   // eslint-disable-next-line class-methods-use-this
   public update(_delta: number, worldState: WorldState): void {
      worldState.getEntities(InputSystem.components).forEach((entityID) => {
         const [ movement ] = worldState.getComponents(entityID, InputSystem.components);

         // Stop all movement in prep for the next input
         movement.x = 0;
         movement.y = 0;
      });
   }

}
