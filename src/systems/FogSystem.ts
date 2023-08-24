import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';
import { FogLevel } from '@/components/create-fog-component';
import { Terrain } from '@/components/create-terrain-component';

export class FogSystem extends System {

   static components = [ ComponentID.Position, ComponentID.Fog, ComponentID.Sprite ] as const;

   // eslint-disable-next-line class-methods-use-this
   public update(_delta: number, worldState: WorldState): void {
      const playerEntityID = worldState.getEntities([ ComponentID.Input, ComponentID.Position ])[0],
            [ player, stats ] = worldState.getComponents(playerEntityID, [ ComponentID.Position, ComponentID.Stats ] as const);

      worldState.getEntities(FogSystem.components).forEach((entityID) => {
         const [ { x, y }, fog ] = worldState.getComponents(entityID, FogSystem.components),
               [ terrain ] = worldState.getComponents(entityID, [ ComponentID.Terrain ]),
               hasEncounterComponent = worldState.doesEntityHaveComponent(entityID, ComponentID.Encounter);

         let viewDistance = 2.5;

         if (stats.navLog && worldState.doesEntityHaveComponent(entityID, ComponentID.Heading)) {
            viewDistance = 6;
         }

         // TODO: types terrain should be optional
         if (stats.soundingLine && terrain && terrain.terrain === Terrain.Impassable && !hasEncounterComponent) {
            viewDistance = 6;
         }

         if (stats.localCrew && hasEncounterComponent) {
            viewDistance = 6;
         }

         if (Math.sqrt(Math.pow(player.x - x, 2) + Math.pow(player.y - y, 2)) < viewDistance) {
            fog.level = FogLevel.None;
         }
      });
   }

}
