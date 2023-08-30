import { ComponentID, EntityID } from '@/shared-types';
import { createCameraComponent } from '../components/create-camera-component';
import { createMovementComponent } from '../components/create-movement-component';
import { createPositionComponent } from '../components/create-position-component';
import { Sprite, Color, createSpriteComponent, FISH_SVG_PATH, SpriteLayer } from '../components/create-sprite-component';
import { Terrain, createTerrainComponent } from '../components/create-terrain-component';
import { createTagComponent } from '@/components/create-tag-component';
import { FogLevel, createFogComponent } from '@/components/create-fog-component';
import Perlin from './Perlin';
import { WorldState } from './WorldState';
import { PRNG, makePRNG } from './make-prng';
import { HeadingEnum, Vec2D, adjustRange, binaryThreshold, wrap } from './math';
import { HEADING_SPRITES, createHeadingComponent } from '@/components/create-heading-component';
import { createEncounterComponent } from '@/components/create-encounter-component';
import { createStatsComponent } from '@/components/create-stats-component';

const MAP_X = 150,
      MAP_Y = 100,
      MIN_ENCOUNTER_DISTANCE = 6;

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
      encounterDebug = createDebugCanvas();

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

function createEncounters(prng: PRNG, numberOfEncounters: number, possibleLocations: Vec2D[], generateFn: (pos: Vec2D) => void): Vec2D[] {
   const encounters: Vec2D[] = [];

   while (encounters.length < numberOfEncounters) {
      const [ pos ] = possibleLocations.splice(prng.inRange(0, possibleLocations.length - 1), 1);

      const distToClosest = encounters.reduce((memo, encounter) => {
         const dist =  Math.sqrt(Math.pow(encounter.x - pos.x, 2) + Math.pow(encounter.y - pos.y, 2));

         return dist < memo ? dist : memo;
      }, 999);

      if (distToClosest <= MIN_ENCOUNTER_DISTANCE) {
         continue;
      }

      encounters.push(pos);

      generateFn(pos);
   }

   return encounters;
}

export interface WorldGenOptions {
   kernel: number;
   label?: string;
}

export function generateWorld(opts: WorldGenOptions): WorldState {
   const worldState = new WorldState(opts.label || `${opts.kernel}`),
         prng = makePRNG(opts.kernel),
         landGenerator = new Perlin(prng, 10),
         canalGenerator = new Perlin(prng, 20),
         windGenerator = new Perlin(prng, 20);

   worldState.createEntity({
      ...createCameraComponent({ x: 0, y: 0, viewportWidth: 15, viewportHeight: 10 }),
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
               ...createSpriteComponent(Sprite.Land, { layer: SpriteLayer.Land, bg: Color.LandBG, tint: Color.Land }),
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
                  layer: SpriteLayer.Wind,
                  bg: Color.OceanBG,
                  tint: Color.Wind,
               }),
               ...createTerrainComponent(Terrain.Passable),
               ...createFogComponent(FogLevel.Full),
            });
         }
      }
   }

   const possibleOceanEncounterLocations: Vec2D[] = [],
         possiblePortLocations: Vec2D[] = [];

   floodFill(entityMap, (entityID, pos, delta) => {
      const [ terrain, sprite ] = worldState.getComponents(entityID, [ ComponentID.Terrain, ComponentID.Sprite ] as const);

      if (terrain.terrain === Terrain.Passable) {
         possibleOceanEncounterLocations.push(pos);
         return true;
      }

      sprite.sprite = Sprite.Coast;
      sprite.bg = Color.CoastBG;
      sprite.tint = Color.Coast;

      encounterDebug(pos.x, pos.y, 0.2);

      if (delta.x === 0 || delta.y === 0) {
         possiblePortLocations.push(pos);
      }
      return false;
   });

   const ports: Vec2D[] = createEncounters(prng, prng.inRange(20, 40), possiblePortLocations, (pos) => {
      worldState.createEntity({
         ...createPositionComponent(pos.x, pos.y),
         ...createSpriteComponent(Sprite.Port, {
            layer: SpriteLayer.Port,
            bg: Color.PortBG,
            tint: Color.Port,
         }),
         ...createTerrainComponent(Terrain.Impassable),
         ...createFogComponent(FogLevel.Full),
         ...createEncounterComponent({
            food: { adjust: 10 },
            portsVisited: { push: { x: pos.x, y: pos.y } },
            event: { set: 'At Port' },
         }),
      });

      encounterDebug(pos.x, pos.y, 0.5);
   });

   createEncounters(prng, prng.inRange(20, 40), possibleOceanEncounterLocations, (pos) => {
      worldState.createEntity({
         ...createPositionComponent(pos.x, pos.y),
         ...createSpriteComponent(FISH_SVG_PATH, {
            layer: SpriteLayer.Encounter,
            bg: Color.OceanBG,
            tint: '#B1C7CB',
         }),
         ...createFogComponent(FogLevel.Full),
         ...createEncounterComponent({
            food: { adjust: 30 },
            event: { set: 'Fish!' },
         }),
      });

      encounterDebug(pos.x, pos.y, 0.25);
   });

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
      ...createSpriteComponent(Sprite.Player, { layer: SpriteLayer.Player, bg: Color.OceanBG }),
      ...createTagComponent(ComponentID.Input),
      ...createStatsComponent({
         day: 0,
         food: 20,
         portsVisited: [],
         totalPorts: ports.length,
         navLog: false,
         soundingLine: false,
         localCrew: false,
      }),
   });

   encounterDebug(startingPoint.x, startingPoint.y, 1);

   return worldState;
}
