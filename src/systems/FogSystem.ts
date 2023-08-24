import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';
import { FogLevel } from '@/components/create-fog-component';

export class FogSystem extends System {

   static components = [ ComponentID.Position, ComponentID.Fog ] as const;

   // eslint-disable-next-line class-methods-use-this
   public update(_delta: number, worldState: WorldState): void {
      const [ player ] = worldState.getComponents(worldState.getEntities([ ComponentID.Input, ComponentID.Position ])[0], [ ComponentID.Position ]);

      worldState.getEntities(FogSystem.components).forEach((entityID) => {
         const [ { x, y }, fog ] = worldState.getComponents(entityID, FogSystem.components);

         if (Math.sqrt(Math.pow(player.x - x, 2) + Math.pow(player.y - y, 2)) < 2.5) {
            fog.level = FogLevel.None;
         }
      });
   }

}
