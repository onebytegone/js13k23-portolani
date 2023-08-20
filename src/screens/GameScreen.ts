import { InputSystem } from '../systems/InputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { RenderSystem } from '../systems/RenderSystem';
import { generateWorld } from '../lib/generate-world';
import { FogSystem } from '../systems/FogSystem';
import { ScreenRenderFn } from '@/shared-types';
import { makeControls } from './elements/make-controls';
import { Heading, HeadingEnum } from '@/components/create-heading-component';

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
      const wrapper = document.createElement('div'),
            canvas = document.createElement('canvas'),
            worldState = generateWorld(Date.now()),
            inputSystem = new InputSystem(worldState);

      el.className = 'game';
      wrapper.className = 'wrapper';

      wrapper.appendChild(canvas);
      el.appendChild(wrapper);
      el.appendChild(makeControls((heading) => {
         inputSystem.processHeadingInput(heading);
         draw();
      }));

      const systems = [
         new MovementSystem(),
         new FogSystem(),
         new RenderSystem(canvas),
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
