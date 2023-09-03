import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState, anyEntity } from '@/lib/WorldState';
import { angleDifference, headingToVec2D, vec2DToAngle } from '@/lib/math';

export class WindSystem extends System {

   // eslint-disable-next-line class-methods-use-this
   public update(_delta: number, worldState: WorldState): void {
      const [ stats, player, movement ] = anyEntity(worldState.getEntities([ ComponentID.Stats, ComponentID.Position, ComponentID.Movement ] as const)),
            [ , heading ] = anyEntity(worldState.getEntitiesAtLocation(player, [ ComponentID.Terrain, ComponentID.Heading ] as const)),
            windAngle = vec2DToAngle(headingToVec2D(heading.heading)),
            movementAngle = vec2DToAngle(movement);

      let days = 2, // Upwind
          dir = 'into the wind';

      if (angleDifference(windAngle, movementAngle) === 0) { // Directly downwind
         days = 0.5;
         dir = 'downwind';
      } else if (angleDifference(windAngle, movementAngle) === Math.PI / 4) { // 45deg downwind
         days = 0.2;
         dir = 'broad reach';
      } else if (angleDifference(windAngle, movementAngle) === Math.PI / 2) { // 90deg to wind
         days = 0.2;
         dir = 'beam reach';
      } else if (angleDifference(windAngle, movementAngle) === 3 * Math.PI / 4) { // 45deg upwind
         days = 0.3;
         dir = 'close hauled';
      }

      stats.food -= days;
      stats.day += days;

      stats.event = `Sailed ${dir}, took ${days > 1 ? `${days} days` : (Math.round(days * 24) + ' hours')}`;
   }

}
