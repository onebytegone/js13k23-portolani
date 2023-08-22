import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';

export class EncounterSystem extends System {

   public update(delta: number, worldState: WorldState): void { // eslint-disable-line class-methods-use-this
      const playerEntityID = worldState.getEntities([ ComponentID.Position, ComponentID.Stats ])[0],
            [ player, stats ] = worldState.getComponents(playerEntityID, [ ComponentID.Position, ComponentID.Stats ] as const),
            encounteredEntities = worldState.getEntitiesAdjacentToLocation(player, [ ComponentID.Encounter ]);

      Object.values(encounteredEntities).map(Object.values).flat(2).forEach((entityID) => {
         const [ encounter ] = worldState.getComponents(entityID, [ ComponentID.Encounter ]);

         encounter.statChanges.forEach((change) => {
            if (change.adjustment) {
               stats[change.stat] += change.adjustment;
            } else if (change.value !== undefined) {
               stats[change.stat] = change.value;
            }
         });

         worldState.removeComponentFromEntity(entityID, ComponentID.Encounter);
      });
   }

}
