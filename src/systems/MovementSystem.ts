import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';
import { Terrain } from '@/components/create-terrain-component';

export class MovementSystem extends System {

   static components = [ ComponentID.Position, ComponentID.Movement ] as const;

   public update(delta: number, worldState: WorldState): void { // eslint-disable-line class-methods-use-this
      worldState.getEntities(MovementSystem.components).forEach((entityID) => {
         const [ pos, movement ] = worldState.getComponents(entityID, MovementSystem.components);

         if ((movement.x || movement.y) && movement.nextMovePossible <= Date.now()) {
            console.log(pos, movement);

            const newLoc = { x: pos.x + movement.x, y: pos.y + movement.y },
                  terrainEntities = worldState.getEntitiesAtLocation(newLoc, [ ComponentID.Terrain ]);

            if (!terrainEntities || !terrainEntities.length) {
               return; // Don't move, new location is off map
            }

            const [ newTerrain ] = worldState.getComponents(terrainEntities[0], [ ComponentID.Terrain ]);

            if (newTerrain.terrain === Terrain.Impassable) {
               return; // Don't move, new location is not passable
            }

            pos.x = newLoc.x;
            pos.y = newLoc.y;
            movement.nextMovePossible = Date.now() + 100; // TODO: Speed?
         }
      });
   }

}
