import { WorldState } from './WorldState';
import { createInputComponent } from '../components/create-input-component';
import { createPositionComponent } from '../components/create-position-component';
import { Sprite, createSpriteComponent } from '../components/create-sprite-component';
import { createMovementComponent } from '../components/create-movement-component';
import { Terrain, createTerrainComponent } from '../components/create-terrain-component';
import { createCameraComponent } from '../components/create-camera-component';

export function generateWorld(_seed: number): WorldState {
   const worldState = new WorldState();

   worldState.createEntity({
      ...createPositionComponent(1, 1),
      ...createMovementComponent(),
      ...createSpriteComponent(Sprite.Player),
      ...createInputComponent(),
   });

   worldState.createEntity({
      ...createCameraComponent({ x: 0, y: 0, viewportWidth: 32, viewportHeight: 16 }),
   });

   for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 120; x++) {
         const isWall = Math.random() > 0.8;
         worldState.createEntity({
            ...createPositionComponent(x, y),
            ...createSpriteComponent(isWall ? Sprite.Wall : Sprite.Air),
            ...createTerrainComponent(isWall ? Terrain.Impassable : Terrain.Passable),
         });
      }
   }

   return worldState;
}
