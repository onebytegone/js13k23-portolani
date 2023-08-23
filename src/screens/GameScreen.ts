import { InputSystem } from '../systems/InputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { RenderSystem } from '../systems/RenderSystem';
import { generateWorld } from '../lib/generate-world';
import { FogSystem } from '../systems/FogSystem';
import { ScreenRenderFn } from '@/shared-types';
import { makeControls } from './elements/make-controls';
import { Heading, HeadingEnum } from '@/components/create-heading-component';
import { EncounterSystem } from '@/systems/EncounterSystem';
import { HUDSystem } from '@/systems/HUDSystem';
import { WindSystem } from '@/systems/WindSystem';

const KEY_HEADING_MAP: Record<string, HeadingEnum | undefined> = {
   KeyQ: Heading.NW,
   KeyW: Heading.N,
   KeyE: Heading.NE,
   KeyA: Heading.W,
   KeyD: Heading.E,
   KeyZ: Heading.SW,
   KeyX: Heading.S,
   KeyC: Heading.SE,
};

export function makeGameScreen(): ScreenRenderFn {
   return (el) => {
      const gamePanel = document.createElement('div'),
            frame = document.createElement('div'),
            header = document.createElement('div'),
            footer = document.createElement('div'),
            canvas = document.createElement('canvas'),
            worldState = generateWorld(Date.now()),
            inputSystem = new InputSystem(worldState);

      el.className = 'game';
      gamePanel.className = 'gamePanel';
      frame.className = 'frame';

      frame.appendChild(canvas);
      gamePanel.appendChild(header);
      gamePanel.appendChild(frame);
      gamePanel.appendChild(footer);
      el.appendChild(gamePanel);
      el.appendChild(makeControls((heading) => {
         inputSystem.processHeadingInput(heading);
         draw();
      }));

      const systems = [
         new WindSystem(),
         new MovementSystem(),
         new EncounterSystem(),
         new FogSystem(),
         new HUDSystem(header, footer),
         new RenderSystem(canvas, frame),
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
