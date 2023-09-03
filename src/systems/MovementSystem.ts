import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState, anyEntity } from '@/lib/WorldState';
import { Terrain } from '@/components/create-terrain-component';

export class MovementSystem extends System {

   static components = [ ComponentID.Position, ComponentID.Movement, ComponentID.Stats ] as const;

   public update(delta: number, worldState: WorldState): void { // eslint-disable-line class-methods-use-this
      Object.values(worldState.getEntities(MovementSystem.components)).forEach(([ pos, movement, stats ]) => {
         if ((movement.x || movement.y) && movement.nextMovePossible <= Date.now()) {
            const newLoc = { x: pos.x + movement.x, y: pos.y + movement.y },
                  terrainEntities = anyEntity(worldState.getEntitiesAtLocation(newLoc, [ ComponentID.Terrain ]));

            if (!terrainEntities || !terrainEntities.length) {
               stats.event = 'Edge of map';
               return; // Don't move, new location is off map
            }

            if (terrainEntities[0].terrain === Terrain.Impassable) {
               stats.event = 'Ran aground';
               return; // Don't move, new location is not passable
            }

            pos.x = newLoc.x;
            pos.y = newLoc.y;
            movement.nextMovePossible = Date.now() + 100; // TODO: Speed?
         }
      });
   }

}
