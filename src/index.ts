import { InputSystem } from './systems/InputSystem';
import { MovementSystem } from './systems/MovementSystem';
import { RenderSystem } from './systems/RenderSystem';
import { generateWorld } from './lib/generate-world';

const worldState = generateWorld(0);

const systems = [
   new MovementSystem(),
   new RenderSystem(),
   new InputSystem(worldState, () => {
      draw(Date.now());
   }),
];

let lastFrame = 0;

function draw(currentTime: number) {
   const delta = (currentTime - lastFrame) / 1000;

   systems.forEach((system) => {
      system.update(delta, worldState);
   });
}

draw(Date.now());
