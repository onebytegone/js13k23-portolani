import { ComponentID, EntityID } from '@/shared-types';
import { createCameraComponent } from '../components/create-camera-component';
import { createMovementComponent } from '../components/create-movement-component';
import { createPositionComponent } from '../components/create-position-component';
import { Sprite, Color, createSpriteComponent, FISH_SVG_PATH, SpriteLayer, CHARACTER_FONT_STACK, FISH_SVG_HTML } from '../components/create-sprite-component';
import { Terrain, createTerrainComponent } from '../components/create-terrain-component';
import { createTagComponent } from '@/components/create-tag-component';
import { FogLevel, createFogComponent } from '@/components/create-fog-component';
import Perlin from './Perlin';
import { WorldState } from './WorldState';
import { PRNG, makePRNG } from './make-prng';
import { HeadingEnum, Vec2D, adjustRange, binaryThreshold, wrap } from './math';
import { HEADING_SPRITES, createHeadingComponent } from '@/components/create-heading-component';
import { Changes, createEncounterComponent } from '@/components/create-encounter-component';
import { IStatsComponent, createStatsComponent } from '@/components/create-stats-component';

const MIN_ENCOUNTER_DISTANCE = 6,
      PIRATE_LOSS_CHANCE = 0.95;

function createDebugCanvas(mapSize: Vec2D): (x: number, y: number, val: number) => void {
   if (!window.DEBUG) {
      return () => {};
   }

   const canvas = document.createElement('canvas') as HTMLCanvasElement,
         TILE_SIZE = 3;

   canvas.width = mapSize.x * TILE_SIZE; // eslint-disable-line id-denylist
   canvas.height = mapSize.y * TILE_SIZE; // eslint-disable-line id-denylist
   canvas.style.width = '100%'; // eslint-disable-line id-denylist
   canvas.style.imageRendering = 'pixelated';
   document.body.appendChild(canvas);

   const ctx = canvas.getContext('2d')!;

   return (x: number, y: number, val: number) => {
      ctx.fillStyle = hsl(val * 180, 0.8, 0.4);
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
   };
}

// eslint-disable-next-line unused-imports/no-unused-vars
function renderHistogram(values: number[]): void {
   if (!window.DEBUG) {
      return;
   }

   const canvas = document.createElement('canvas') as HTMLCanvasElement,
         COLUMN_SIZE = 0.2,
         COLUMN_WIDTH = 3;

   canvas.width = values.length * COLUMN_WIDTH; // eslint-disable-line id-denylist
   canvas.height = values.reduce((m, v) => { return v > m ? v : m;}, 0) * COLUMN_SIZE; // eslint-disable-line id-denylist
   canvas.style.width = '100%'; // eslint-disable-line id-denylist
   canvas.style.imageRendering = 'pixelated';
   document.body.appendChild(canvas);

   const ctx = canvas.getContext('2d')!;

   ctx.fillStyle = hsl(0, 0, 1);
   ctx.fillRect(0, 0, canvas.width, canvas.height);


   ctx.fillStyle = hsl(0.2, 0.8, 0.4);
   values.forEach((v, x) => {
      ctx.fillRect(x * COLUMN_WIDTH, canvas.height - v * COLUMN_SIZE, COLUMN_WIDTH, v * COLUMN_SIZE);
   });
}

function hsl(h: number, s: number, l: number): string {
   return `hsl(${h},${(s*100).toPrecision(2)}%,${(l*100).toPrecision(2)}%)`;
}

function seq(count: number): number[] {
   return new Array(count)
      .fill(1)
      .map((_, i) => {
         return i;
      });
}

function circleCutoff(mapSize: Vec2D, x: number, y: number): number {
   return Math.max(
      Math.pow(Math.sin(Math.PI / 1.02 * (x / mapSize.x + 0.01)), 0.4)
      * Math.pow(Math.sin(Math.PI / 1.02 * (y / mapSize.y + 0.01)), 0.4)
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

function createEncounters(prng: PRNG, numberOfEncounters: number, possibleLocations: Vec2D[], generateFn: (pos: Vec2D, index: number) => void): Vec2D[] {
   const encounters: Vec2D[] = [];

   while (encounters.length < numberOfEncounters && possibleLocations.length >= 1) {
      const [ pos ] = possibleLocations.splice(prng.inRange(0, possibleLocations.length - 1), 1);

      const distToClosest = encounters.reduce((memo, encounter) => {
         const dist =  Math.sqrt(Math.pow(encounter.x - pos.x, 2) + Math.pow(encounter.y - pos.y, 2));

         return dist < memo ? dist : memo;
      }, 999);

      if (distToClosest <= MIN_ENCOUNTER_DISTANCE) {
         continue;
      }

      generateFn(pos, encounters.push(pos) - 1);
   }

   return encounters;
}

function makePortBonuses(prng: PRNG, portCount: number, bonusCount: number): Record<number, Changes<IStatsComponent>> {
   return prng.randomElements(seq(portCount), bonusCount * 3).reduce((memo, portIndex, i) => {
      switch (Math.floor(i / bonusCount)) {
         case 0:
            memo[portIndex] = {
               navLog: { set: true },
            };
            return memo;
         case 1:
            memo[portIndex] = {
               soundingLine: { set: true },
            };
            return memo;
         default:
            memo[portIndex] = {
               localCrew: { set: true },
            };
            return memo;
      }
   }, {} as Record<number, Changes<IStatsComponent>>);
}

interface Range {
   min: number;
   max: number
}

export interface WorldGenOptions {
   kernel: number;
   label?: string;
   date?: string;
   mapSize: Vec2D;
   startingFood: Range;
   portCount: Range;
   fishCount: Range;
   pirateCount: Range;
   copiesOfBonuses: number;
}

export function generateWorld(opts: WorldGenOptions): WorldState {
   const worldState = new WorldState(opts.label || `${opts.kernel}`, opts.date),
         prng = makePRNG(opts.kernel),
         landGenerator = new Perlin(prng, 10),
         canalGenerator = new Perlin(prng, 20),
         windGenerator = new Perlin(prng, 20);

   const windDebug = createDebugCanvas(opts.mapSize),
         encounterDebug = createDebugCanvas(opts.mapSize);

   worldState.createEntity({
      ...createCameraComponent({ x: 0, y: 0, viewportWidth: 15, viewportHeight: 10 }),
   });

   const entityMap: EntityID[][] = [];

   for (let y = 0; y < opts.mapSize.y; y++) {
      entityMap[y] = [];

      for (let x = 0; x < opts.mapSize.x; x++) {
         const landNoise = landGenerator.get(x, y) * circleCutoff(opts.mapSize, x, y),
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
         possiblePortLocations: Vec2D[] = [],
         portCount = prng.inRange(opts.portCount.min, opts.portCount.max),
         pirateCount = prng.inRange(opts.pirateCount.min, opts.pirateCount.max),
         portBonuses = makePortBonuses(prng, portCount, opts.copiesOfBonuses);

   floodFill(entityMap, (entityID, pos, delta) => {
      const [ terrain, sprite ] = worldState.getComponents(entityID, [ ComponentID.Terrain, ComponentID.Sprite ] as const);

      if (terrain && terrain.terrain === Terrain.Passable) {
         possibleOceanEncounterLocations.push(pos);
         return true;
      }

      if (sprite) {
         sprite.sprite = Sprite.Coast;
         sprite.bg = Color.CoastBG;
         sprite.tint = Color.Coast;
      }

      encounterDebug(pos.x, pos.y, 0.2);

      if (delta.x === 0 || delta.y === 0) {
         possiblePortLocations.push(pos);
      }
      return false;
   });

   const ports: Vec2D[] = createEncounters(prng, portCount, possiblePortLocations, (pos, i) => {
      const bonusesForPort = portBonuses[i] || {};

      const bonusMessages = [
         bonusesForPort.localCrew?.set ? Sprite.LocalCrew : undefined,
         bonusesForPort.navLog?.set ? Sprite.NavLog : undefined,
         bonusesForPort.soundingLine?.set ? Sprite.SoundingLine : undefined,
         `${FISH_SVG_HTML}10`,
      ];

      worldState.createEntity({
         ...createPositionComponent(pos.x, pos.y),
         ...createSpriteComponent(Sprite.Port, {
            layer: SpriteLayer.Port,
            bg: Color.PortBG,
            tint: Color.Port,
            font: CHARACTER_FONT_STACK,
         }),
         ...createTerrainComponent(Terrain.Impassable),
         ...createFogComponent(FogLevel.Full),
         ...createEncounterComponent({
            playerChanges: {
               [ComponentID.Stats]: {
                  food: { adjust: 10 },
                  portsVisited: { push: { x: pos.x, y: pos.y } },
                  event: { set: `At port; Gained ${bonusMessages.filter((v) => { return !!v; }).join(',')}` },
                  ...bonusesForPort,
               },
            },
            entityChanges: {
               [ComponentID.Sprite]: {
                  bg: { set: Color.PortVisitedBG },
                  tint: { set: Color.PortVisited },
                  secondarySprite: { set: Sprite.Check },
                  secondaryTint: { set: Color.PortVisitedCheck },
               },
            },
         }),
      });

      encounterDebug(pos.x, pos.y, 0.5);
   });

   createEncounters(prng, prng.inRange(opts.fishCount.min, opts.fishCount.max), possibleOceanEncounterLocations, (pos) => {
      const foodAdjust = prng.inRange(5, 20);

      worldState.createEntity({
         ...createPositionComponent(pos.x, pos.y),
         ...createSpriteComponent(FISH_SVG_PATH, {
            layer: SpriteLayer.Encounter,
            bg: Color.OceanBG,
            tint: Color.Fish,
         }),
         ...createFogComponent(FogLevel.Full),
         ...createEncounterComponent({
            destroyEntity: true,
            playerChanges: {
               [ComponentID.Stats]: {
                  food: { adjust: foodAdjust },
                  event: { set: `Caught fish, gained ${FISH_SVG_HTML}${foodAdjust}` },
               },
            },
         }),
      });

      encounterDebug(pos.x, pos.y, 0.25);
   });

   createEncounters(prng, pirateCount, possibleOceanEncounterLocations, (pos) => {
      function getStatImpact(): { set: boolean } | undefined {
         if (prng() < PIRATE_LOSS_CHANCE) {
            return { set: false };
         }
      }

      const foodAdjust = prng.inRange(-30, -5);

      worldState.createEntity({
         ...createPositionComponent(pos.x, pos.y),
         ...createSpriteComponent(Sprite.Pirate, {
            layer: SpriteLayer.Encounter,
            bg: Color.OceanBG,
            tint: Color.Fog,
            font: CHARACTER_FONT_STACK,
         }),
         ...createFogComponent(FogLevel.Full),
         ...createEncounterComponent({
            destroyEntity: true,
            playerChanges: {
               [ComponentID.Stats]: {
                  food: { adjust: foodAdjust },
                  event: { set: `Pirate attack, lost ${FISH_SVG_HTML}${foodAdjust}` },
                  navLog: getStatImpact(),
                  soundingLine: getStatImpact(),
                  localCrew: getStatImpact(),
               },
            },
         }),
      });

      encounterDebug(pos.x, pos.y, 0.45);
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
               return terrain && terrain.terrain === Terrain.Passable;
            });
      });
   }));

   if (!startingPoint) {
      throw Error();
   }

   worldState.createEntity({
      ...createPositionComponent(startingPoint.x, startingPoint.y),
      ...createMovementComponent(),
      ...createSpriteComponent(Sprite.Player, { layer: SpriteLayer.Player, bg: Color.OceanBG }),
      ...createTagComponent(ComponentID.Input),
      ...createStatsComponent({
         day: 0,
         food: prng.inRange(opts.startingFood.min, opts.startingFood.max),
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
