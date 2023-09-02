import { InputSystem } from '../systems/InputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { RenderSystem } from '../systems/RenderSystem';
import { WorldGenOptions, generateWorld } from '../lib/generate-world';
import { FogSystem } from '../systems/FogSystem';
import { ComponentID, ScreenRenderFn } from '@/shared-types';
import { makeControls } from './elements/make-controls';
import { EncounterSystem } from '@/systems/EncounterSystem';
import { HUDSystem } from '@/systems/HUDSystem';
import { WindSystem } from '@/systems/WindSystem';
import { Heading, HeadingEnum } from '@/lib/math';
import { makeMapScreen } from './MapScreen';
import { anyEntity } from '@/lib/WorldState';

const KEY_HEADING_MAP: Record<string, HeadingEnum | undefined> = {
   KeyQ: Heading.NW,
   KeyW: Heading.N,
   ArrowUp: Heading.N,
   KeyE: Heading.NE,
   KeyA: Heading.W,
   ArrowLeft: Heading.W,
   KeyD: Heading.E,
   ArrowRight: Heading.E,
   KeyZ: Heading.SW,
   KeyX: Heading.S,
   ArrowDown: Heading.S,
   KeyC: Heading.SE,
};

export function makeGameScreen(worldGenOptions: WorldGenOptions): ScreenRenderFn {
   return (el, renderScreen) => {
      const gamePanel = document.createElement('div'),
            canvas = document.createElement('canvas'),
            controlPanel = document.createElement('div'),
            hud = document.createElement('div'),
            controlCenter = document.createElement('div'),
            worldState = generateWorld(worldGenOptions),
            inputSystem = new InputSystem(worldState);

      el.className = 'game';

      gamePanel.className = 'gamePanel';
      gamePanel.appendChild(canvas);

      hud.className = 'hud';
      gamePanel.appendChild(hud);

      controlPanel.className = 'controlPanel';
      controlCenter.className = 'center';
      controlCenter.title = 'Current wind heading';

      controlPanel.appendChild(makeControls(processHeadingInput, controlCenter));

      el.appendChild(gamePanel);
      el.appendChild(controlPanel);

      const systems = [
         new WindSystem(),
         new MovementSystem(),
         new EncounterSystem(),
         new FogSystem(),
         new HUDSystem(hud, controlCenter),
         new RenderSystem(canvas, gamePanel),
         inputSystem,
      ];

      function processHeadingInput(heading: HeadingEnum): void {
         inputSystem.processHeadingInput(heading);
         draw();

         const [ statsComponent ] = anyEntity(worldState.getEntities([ ComponentID.Stats ] as const)),
               isOutOfFood = (statsComponent.food <= 0),
               visitedAllPorts = statsComponent.portsVisited.length === statsComponent.totalPorts;

         if (isOutOfFood || visitedAllPorts) {
            document.removeEventListener('keydown', processKeyboardInput);
            renderScreen(makeMapScreen(worldState, isOutOfFood ? 'Ran out of food' : 'Explored all ports'));
         }
      }

      function processKeyboardInput(event: KeyboardEvent) {
         const heading = KEY_HEADING_MAP[event.code];

         if (heading !== undefined) {
            processHeadingInput(heading);
         }
      }

      document.addEventListener('keydown', processKeyboardInput);

      function draw() {
         systems.forEach((system) => {
            system.update(0, worldState);
         });
      }

      draw();
   };
}
