import { ComponentID } from '@/shared-types';
import { createCameraComponent } from '../components/create-camera-component';
import { createMovementComponent } from '../components/create-movement-component';
import { createPositionComponent } from '../components/create-position-component';
import { Sprite, createSpriteComponent } from '../components/create-sprite-component';
import { Terrain, createTerrainComponent } from '../components/create-terrain-component';
import { createTagComponent } from '@/components/create-tag-component';
import { FogLevel, createFogComponent } from '@/components/create-fog-component';
import Perlin from './Perlin';
import { WorldState } from './WorldState';
import { makePRNG } from './make-prng';
import { binaryThreshold } from './math';

const MAP_X = 150,
      MAP_Y = 100;

function createDebugCanvas(): (x: number, y: number, val: number) => void {
   const canvas = document.createElement('canvas') as HTMLCanvasElement,
         TILE_SIZE = 3;

   canvas.width = MAP_X * TILE_SIZE;
   canvas.height = MAP_Y * TILE_SIZE;
   canvas.style.width = '100%';
   canvas.style.imageRendering = 'pixelated';
   document.body.appendChild(canvas);

   const ctx = canvas.getContext('2d')!;

   return (x: number, y: number, val: number) => {
      ctx.fillStyle = hsl(val * 180, 0.8, 0.4);
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
   };
}

const landDebug = createDebugCanvas();

function hsl(h: number, s: number, l: number): string {
   return `hsl(${h},${(s*100).toPrecision(2)}%,${(l*100).toPrecision(2)}%)`;
}

function circleCutoff(x: number, y: number): number {
   return Math.max(
      Math.pow(Math.sin(Math.PI / 1.02 * (x / MAP_X + 0.01)), 0.4)
      * Math.pow(Math.sin(Math.PI / 1.02 * (y / MAP_Y + 0.01)), 0.4)
      - 0.2,
      0
   );
}

function sCurve(val: number): number {
   return 2 / (1 + Math.pow(Math.E, -5 * val)) - 1;
}

export function generateWorld(kernel: number): WorldState {
   const worldState = new WorldState(),
         prng = makePRNG(kernel),
         landGenerator = new Perlin(prng, 10),
         canalGenerator = new Perlin(prng, 20);

   worldState.createEntity({
      ...createPositionComponent(1, 1),
      ...createMovementComponent(),
      ...createSpriteComponent(Sprite.Player),
      ...createTagComponent(ComponentID.Input),
   });

   worldState.createEntity({
      ...createCameraComponent({ x: 0, y: 0, viewportWidth: 32, viewportHeight: 24 }),
   });

   for (let y = 0; y < MAP_Y; y++) {
      for (let x = 0; x < MAP_X; x++) {
         const landNoise = landGenerator.get(x, y) * circleCutoff(x, y),
               canalNoise = binaryThreshold(sCurve(Math.abs(canalGenerator.get(x, y))), 0.2),
               isLand = !!(binaryThreshold(landNoise, 0.04) * canalNoise),
               sprite = createSpriteComponent(isLand ? Sprite.Coast : Sprite.Air);

         if (!isLand) {
            sprite[ComponentID.Sprite].tint = hsl(214, 0.46, 0.70);
         }

         landDebug(x, y, isLand ? 1 : 0);

         worldState.createEntity({
            ...createPositionComponent(x, y),
            ...sprite,
            ...createTerrainComponent(isLand ? Terrain.Impassable : Terrain.Passable),
            ...createFogComponent(FogLevel.Full),
         });
      }
   }

   return worldState;
}
