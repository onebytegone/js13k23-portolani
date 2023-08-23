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

      if (angleDifference(windAngle, movementAngle) === 0) { // Directly downwind
         stats.food -= 2;
      } else if (angleDifference(windAngle, movementAngle) === Math.PI / 4) { // 45deg downwind
         stats.food -= 1;
      } else if (angleDifference(windAngle, movementAngle) === Math.PI / 2) { // 90deg to wind
         stats.food -= 1;
      } else if (angleDifference(windAngle, movementAngle) === 3 * Math.PI / 4) { // 45deg upwind
         stats.food -= 2;
      } else { // Against wind
         movement.x = 0;
         movement.y = 0;
         stats.food -= 1;
      }
   }

}
