import { InputSystem } from '../systems/InputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { RenderSystem } from '../systems/RenderSystem';
import { WorldGenOptions, generateWorld } from '../lib/generate-world';
import { FogSystem } from '../systems/FogSystem';
import { ScreenRenderFn } from '@/shared-types';
import { makeControls } from './elements/make-controls';
import { EncounterSystem } from '@/systems/EncounterSystem';
import { HUDSystem } from '@/systems/HUDSystem';
import { WindSystem } from '@/systems/WindSystem';
import { Heading, HeadingEnum } from '@/lib/math';

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
   return (el) => {
      const gamePanel = document.createElement('div'),
            canvas = document.createElement('canvas'),
            controlPanel = document.createElement('div'),
            stats = document.createElement('div'),
            controlCenter = document.createElement('div'),
            worldState = generateWorld(worldGenOptions),
            inputSystem = new InputSystem(worldState);

      el.className = 'game';

      gamePanel.className = 'gamePanel';
      gamePanel.appendChild(canvas);

      controlPanel.className = 'controlPanel';
      stats.className = 'stats';
      controlCenter.className = 'center';

      controlPanel.append(stats);
      controlPanel.appendChild(makeControls((heading) => {
         inputSystem.processHeadingInput(heading);
         draw();
      }, controlCenter));

      el.appendChild(gamePanel);
      el.appendChild(controlPanel);

      const systems = [
         new WindSystem(),
         new MovementSystem(),
         new EncounterSystem(),
         new FogSystem(),
         new HUDSystem(stats, controlCenter),
         new RenderSystem(canvas, gamePanel),
         inputSystem,
      ];

      // TODO: remove listener when leaving the screen
      document.addEventListener('keydown', (event) => {
         const heading = KEY_HEADING_MAP[event.code];

         if (heading !== undefined) {
            inputSystem.processHeadingInput(heading);
            draw();
         }
      });

      function draw() {
         systems.forEach((system) => {
            system.update(0, worldState);
         });
      }

      draw();
   };
}
