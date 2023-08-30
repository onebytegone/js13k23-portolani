import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';
import { angleDifference, headingToVec2D, vec2DToAngle } from '@/lib/math';

export class WindSystem extends System {

   // eslint-disable-next-line class-methods-use-this
   public update(_delta: number, worldState: WorldState): void {
      const playerEntityID = worldState.getEntities([ ComponentID.Stats, ComponentID.Position ])[0],
            [ stats, player, movement ] = worldState.getComponents(playerEntityID, [ ComponentID.Stats, ComponentID.Position, ComponentID.Movement ] as const),
            windEntityID = worldState.getEntitiesAtLocation(player, [ ComponentID.Terrain, ComponentID.Heading ])[0],
            [ heading ] = worldState.getComponents(windEntityID, [ ComponentID.Heading ]),
            windAngle = vec2DToAngle(headingToVec2D(heading.heading)),
            movementAngle = vec2DToAngle(movement);

      let days = 2; // Against wind

      if (angleDifference(windAngle, movementAngle) === 0) { // Directly downwind
         days = 0.5;
      } else if (angleDifference(windAngle, movementAngle) === Math.PI / 4) { // 45deg downwind
         days = 0.2;
      } else if (angleDifference(windAngle, movementAngle) === Math.PI / 2) { // 90deg to wind
         days = 0.2;
      } else if (angleDifference(windAngle, movementAngle) === 3 * Math.PI / 4) { // 45deg upwind
         days = 0.3;
      }

      stats.food -= days;
      stats.day += days;
   }

}
