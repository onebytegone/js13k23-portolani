import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';

export class InputSystem extends System {

   static components = [ ComponentID.Movement, ComponentID.Input ] as const;

   private _state: Record<string, boolean> = {};

   public constructor() {
      super();

      document.addEventListener('keydown', (event) => {
         this._state[event.code] = true;
      });

      document.addEventListener('keyup', (event) => {
         this._state[event.code] = false;
      });
   }

   public update(_delta: number, worldState: WorldState): void {
      worldState.getEntities(InputSystem.components).forEach((entityID) => {
         const [ movement ] = worldState.getComponents(entityID, InputSystem.components);

         if (this._isUpPressed()) {
            movement.x = 0;
            movement.y = -1;
         } else if (this._isDownPressed()) {
            movement.x = 0;
            movement.y = 1;
         } else if (this._isRightPressed()) {
            movement.x = 1;
            movement.y = 0;
         } else if (this._isLeftPressed()) {
            movement.x = -1;
            movement.y = 0;
         } else {
            movement.x = 0;
            movement.y = 0;
         }
      });
   }

   private _isUpPressed(): boolean {
      return this._state['KeyW'] || this._state['KeyZ'] || this._state['ArrowUp'];
   }

   private _isDownPressed(): boolean {
      return this._state['KeyS'] || this._state['ArrowDown'];
   }

   private _isLeftPressed(): boolean {
      return this._state['KeyA'] || this._state['KeyQ'] || this._state['ArrowLeft'];
   }

   private _isRightPressed(): boolean {
      return this._state['KeyD'] || this._state['ArrowRight'];
   }

}
