import { ComponentID, ComponentIDEnum, EntityID } from '@/shared-types';
import { System } from './System';
import { WorldState, makeEntityID } from '@/lib/WorldState';
import { EntityChanges } from '@/components/create-encounter-component';

function performChanges(worldState: WorldState, entityID: EntityID, entityChanges: EntityChanges): void {
   // TODO: The types here are terrible
   Object.entries(entityChanges).forEach(([ componentID, componentChanges ]) => {
      const [ component ] = worldState.getComponents(entityID, [ Number(componentID) as ComponentIDEnum ]);

      Object.entries(componentChanges).forEach(([ prop, change ]: any) => {
         if (!change) {
            return;
         }

         if (change.adjust) {
            (component as any)[prop] += change.adjust;
         } else if (change.set) {
            (component as any)[prop] = change.set;
         } else if (change.push) {
            (component as any)[prop].push(change.push);
         }
      });
   });

}

export class EncounterSystem extends System {

   public update(delta: number, worldState: WorldState): void { // eslint-disable-line class-methods-use-this
      const [ playerEntityID, [ player ] ] = Object.entries(worldState.getEntities([ ComponentID.Position, ComponentID.Stats ] as const))[0],
            encounteredEntities = worldState.getEntitiesAdjacentToLocation(player, [ ComponentID.Encounter ]);

      Object.values(encounteredEntities).map(Object.values).flat(2).forEach((entityID) => {
         const [ encounter ] = worldState.getComponents(entityID, [ ComponentID.Encounter ]);

         if (!encounter) {
            return;
         }

         if (encounter.playerChanges) {
            performChanges(worldState, makeEntityID(playerEntityID), encounter.playerChanges);
         }

         if (encounter.entityChanges) {
            performChanges(worldState, entityID, encounter.entityChanges);
         }

         if (encounter.destroyEntity) {
            worldState.destroyEntity(entityID);
         } else {
            worldState.removeComponentFromEntity(entityID, ComponentID.Encounter);
         }
      });
   }

}
