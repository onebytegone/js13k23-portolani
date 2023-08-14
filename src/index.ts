import { InputSystem } from './systems/InputSystem';
import { MovementSystem } from './systems/MovementSystem';
import { RenderSystem } from './systems/RenderSystem';
import { generateWorld } from './lib/generate-world';

const FPS = 60,
      worldState = generateWorld(0);

const systems = [
   new InputSystem(),
   new MovementSystem(),
   new RenderSystem(),
];

let lastFrame = 0;

function draw(currentTime: number) {
   const delta = (currentTime - lastFrame) / 1000;

   if (delta >= 1 / FPS) {
      lastFrame = currentTime;

      systems.forEach((system) => {
         system.update(delta, worldState);
      });
   }

   requestAnimationFrame(draw);
}

draw(0);
