import { InputSystem } from '../systems/InputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { RenderSystem } from '../systems/RenderSystem';
import { generateWorld } from '../lib/generate-world';
import { FogSystem } from '../systems/FogSystem';
import { ScreenRenderFn } from '@/shared-types';
import { makeControls } from './elements/make-controls';

export function makeGameScreen(): ScreenRenderFn {
   return (el) => {
      const wrapper = document.createElement('div'),
            canvas = document.createElement('canvas'),
            worldState = generateWorld(Date.now());

      el.className = 'game';
      wrapper.className = 'wrapper';

      wrapper.appendChild(canvas);
      el.appendChild(wrapper);
      el.appendChild(makeControls());

      const systems = [
         new MovementSystem(),
         new FogSystem(),
         new RenderSystem(canvas),
         new InputSystem(worldState, () => {
            draw();
         }),
      ];

      function draw() {
         systems.forEach((system) => {
            system.update(0, worldState);
         });
      }

      draw();
   };
}
