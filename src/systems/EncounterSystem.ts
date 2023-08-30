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

         // TODO: The types here are terrible
         Object.entries(encounter.statChanges).forEach(([ prop, change ]: any) => {
            if (change.adjust) {
               (stats as any)[prop] += change.adjust;
            } else if (change.set) {
               (stats as any)[prop] = change.set;
            }
         });

         worldState.removeComponentFromEntity(entityID, ComponentID.Encounter);
      });
   }

}
