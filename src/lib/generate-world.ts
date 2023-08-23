import { ComponentID, EntityID } from '@/shared-types';
import { createCameraComponent } from '../components/create-camera-component';
import { createMovementComponent } from '../components/create-movement-component';
import { createPositionComponent } from '../components/create-position-component';
import { Sprite, Color, createSpriteComponent } from '../components/create-sprite-component';
import { Terrain, createTerrainComponent } from '../components/create-terrain-component';
import { createTagComponent } from '@/components/create-tag-component';
import { FogLevel, createFogComponent } from '@/components/create-fog-component';
import Perlin from './Perlin';
import { WorldState } from './WorldState';
import { makePRNG } from './make-prng';
import { HeadingEnum, Vec2D, adjustRange, binaryThreshold, wrap } from './math';
import { HEADING_SPRITES, createHeadingComponent } from '@/components/create-heading-component';
import { createEncounterComponent } from '@/components/create-encounter-component';
import { createStatsComponent } from '@/components/create-stats-component';

const MAP_X = 150,
      MAP_Y = 100,
      MIN_PORT_DISTANCE = 6;

function createDebugCanvas(): (x: number, y: number, val: number) => void {
   if (!window.DEBUG) {
      return () => {};
   }

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

function renderHistogram(values: number[]): void {
   if (!window.DEBUG) {
      return;
   }

   const canvas = document.createElement('canvas') as HTMLCanvasElement,
         COLUMN_SIZE = 0.2,
         COLUMN_WIDTH = 3;

   canvas.width = values.length * COLUMN_WIDTH;
   canvas.height = values.reduce((m, v) => { return v > m ? v : m;}, 0) * COLUMN_SIZE;
   canvas.style.width = '100%';
   canvas.style.imageRendering = 'pixelated';
   document.body.appendChild(canvas);

   const ctx = canvas.getContext('2d')!;

   ctx.fillStyle = hsl(0, 0, 1);
   ctx.fillRect(0, 0, canvas.width, canvas.height);


   ctx.fillStyle = hsl(0.2, 0.8, 0.4);
   console.log(values);
   values.forEach((v, x) => {
      ctx.fillRect(x * COLUMN_WIDTH, canvas.height - v * COLUMN_SIZE, COLUMN_WIDTH, v * COLUMN_SIZE);
   });
}

const windDebug = createDebugCanvas(),
      portDebug = createDebugCanvas();

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

function floodFill<T>(map: T[][], iteratee: (v: T, pos: Vec2D, delta: Vec2D) => boolean): void {
   const queue = [ { x: 0, y: 0 } ],
         visited: boolean[][] = [];

   while (queue.length) {
      const { x, y } = queue.pop()!;

      for (let dy = -1; dy <= 1; dy++) {
         for (let dx = -1; dx <= 1; dx++) {
            const pos = { x: x + dx, y: y + dy };

            if ((dx === 0 && dy === 0) || (pos.x < 0 || pos.y < 0 || pos.y >= map.length || pos.x >= map[pos.y].length )) {
               continue;
            }

            if (!visited[pos.y]) {
               visited[pos.y] = [];
            }

            if (!visited[pos.y][pos.x] && iteratee(map[pos.y][pos.x], pos, { x: dx, y: dy })) {
               queue.push(pos);
            }

            visited[pos.y][pos.x] = true;
         }
      }
   }
}

const LAYER = {
   Default: 0,
   Wind: 1,
   Land: 2,
   Port: 3,
   Player: 4,
};

export function generateWorld(kernel: number): WorldState {
   const worldState = new WorldState(),
         prng = makePRNG(kernel),
         landGenerator = new Perlin(prng, 10),
         canalGenerator = new Perlin(prng, 20),
         windGenerator = new Perlin(prng, 20);

   worldState.createEntity({
      ...createCameraComponent({ x: 0, y: 0, viewportWidth: 32, viewportHeight: 24 }),
   });

   const entityMap: EntityID[][] = [];

   for (let y = 0; y < MAP_Y; y++) {
      entityMap[y] = [];

      for (let x = 0; x < MAP_X; x++) {
         const landNoise = landGenerator.get(x, y) * circleCutoff(x, y),
               canalNoise = binaryThreshold(sCurve(Math.abs(canalGenerator.get(x, y))), 0.2),
               isLand = !!(binaryThreshold(landNoise, 0.04) * canalNoise);

         if (isLand) {
            entityMap[y][x] = worldState.createEntity({
               ...createPositionComponent(x, y),
               ...createSpriteComponent(Sprite.Land, { layer: LAYER.Land, bg: Color.LandBG, tint: Color.Land }),
               ...createTerrainComponent(Terrain.Impassable),
               ...createFogComponent(FogLevel.Full),
            });
         } else {
            const windHeading = Math.floor(wrap(adjustRange(windGenerator.get(x, y), {
               fromMin: -1, fromMax: 1, toMin: 0, toMax: 1440,
            }), 360) / 45) as HeadingEnum;

            windDebug(x, y, windHeading / 8);

            entityMap[y][x] = worldState.createEntity({
               ...createPositionComponent(x, y),
               ...createHeadingComponent(windHeading),
               ...createSpriteComponent(HEADING_SPRITES[windHeading], {
                  layer: LAYER.Wind,
                  bg: Color.OceanBG,
                  tint: Color.Wind,
               }),
               ...createTerrainComponent(Terrain.Passable),
               ...createFogComponent(FogLevel.Full),
            });
         }
      }
   }

   const oceanTiles: Vec2D[] = [],
         possiblePortLocations: Vec2D[] = [];

   floodFill(entityMap, (entityID, pos, delta) => {
      const [ terrain, sprite ] = worldState.getComponents(entityID, [ ComponentID.Terrain, ComponentID.Sprite ] as const);

      if (terrain.terrain === Terrain.Passable) {
         oceanTiles.push(pos);
         return true;
      }

      sprite.sprite = Sprite.Coast;
      sprite.bg = Color.CoastBG;
      sprite.tint = Color.Coast;

      portDebug(pos.x, pos.y, 0.2);

      if (delta.x === 0 || delta.y === 0) {
         possiblePortLocations.push(pos);
      }
      return false;
   });

   const numberOfPorts = prng.inRange(10, 20),
         ports: Vec2D[] = [];

   while (ports.length < numberOfPorts) {
      const [ pos ] = possiblePortLocations.splice(prng.inRange(0, possiblePortLocations.length - 1), 1);

      const distToClosestPort = ports.reduce((memo, port) => {
         const dist =  Math.sqrt(Math.pow(port.x - pos.x, 2) + Math.pow(port.y - pos.y, 2));

         return dist < memo ? dist : memo;
      }, 999);

      if (distToClosestPort <= MIN_PORT_DISTANCE) {
         continue;
      }

      ports.push(pos);

      worldState.createEntity({
         ...createPositionComponent(pos.x, pos.y),
         ...createSpriteComponent(Sprite.Port, {
            layer: LAYER.Port,
            bg: Color.PortBG,
            tint: Color.Port,
         }),
         ...createTerrainComponent(Terrain.Impassable),
         ...createFogComponent(FogLevel.Full),
         ...createEncounterComponent([
            { stat: 'food', adjustment: 10 },
         ]),
      });

      portDebug(pos.x, pos.y, 0.5);
   }

   const startingPort = prng.randomElement(ports),
         tilesAdjacentToStartingPort = worldState.getEntitiesAdjacentToLocation(startingPort, [ ComponentID.Terrain, ComponentID.Position ] as const);

   const [ , startingPoint ] = prng.randomElement(Object.values(tilesAdjacentToStartingPort).flatMap((row) => {
      return Object.values(row).flatMap((entities) => {
         return entities
            .map((entityID) => {
               return worldState.getComponents(entityID, [ ComponentID.Terrain, ComponentID.Position ] as const);
            })
            .filter(([ terrain ]) => {
               return terrain.terrain === Terrain.Passable;
            });
      });
   }));

   worldState.createEntity({
      ...createPositionComponent(startingPoint.x, startingPoint.y),
      ...createMovementComponent(),
      ...createSpriteComponent(Sprite.Player, { layer: LAYER.Player, bg: Color.OceanBG, filter: 'brightness(0%) invert(88%)' }),
      ...createTagComponent(ComponentID.Input),
      ...createStatsComponent({
         food: 20,
      }),
   });

   portDebug(startingPoint.x, startingPoint.y, 1);

   return worldState;
}
