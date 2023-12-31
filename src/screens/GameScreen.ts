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
import { createEl } from '@/lib/dom';
import { makeMusicToggle } from './elements/make-music-toggle';

// Google Closure Compiler will rename all the keys of any object (and there doesn't seem
// to be a way to disable this per object). Therefore, create a list of the literal string
// key codes we want to listen for.
const KeyCode = {
   Q: 'KeyQ',
   W: 'KeyW',
   Up: 'ArrowUp',
   E: 'KeyE',
   A: 'KeyA',
   Left: 'ArrowLeft',
   D: 'KeyD',
   Right: 'ArrowRight',
   Z: 'KeyZ',
   X: 'KeyX',
   Down: 'ArrowDown',
   C: 'KeyC',
   Numpad1: 'Numpad1',
   Numpad2: 'Numpad2',
   Numpad3: 'Numpad3',
   Numpad4: 'Numpad4',
   Numpad6: 'Numpad6',
   Numpad7: 'Numpad7',
   Numpad8: 'Numpad8',
   Numpad9: 'Numpad9',
};

const KEY_HEADING_MAP: Record<string, HeadingEnum | undefined> = {
   [KeyCode.Q]: Heading.NW,
   [KeyCode.Numpad7]: Heading.NW,
   [KeyCode.W]: Heading.N,
   [KeyCode.Up]: Heading.N,
   [KeyCode.Numpad8]: Heading.N,
   [KeyCode.E]: Heading.NE,
   [KeyCode.Numpad9]: Heading.NE,
   [KeyCode.A]: Heading.W,
   [KeyCode.Left]: Heading.W,
   [KeyCode.Numpad4]: Heading.W,
   [KeyCode.D]: Heading.E,
   [KeyCode.Right]: Heading.E,
   [KeyCode.Numpad6]: Heading.E,
   [KeyCode.Z]: Heading.SW,
   [KeyCode.Numpad1]: Heading.SW,
   [KeyCode.X]: Heading.S,
   [KeyCode.Down]: Heading.S,
   [KeyCode.Numpad2]: Heading.S,
   [KeyCode.C]: Heading.SE,
   [KeyCode.Numpad3]: Heading.SE,
};

export function makeGameScreen(worldGenOptions: WorldGenOptions): ScreenRenderFn {
   return async (el, renderScreen) => {
      const canvas = document.createElement('canvas'),
            controlPanel = document.createElement('div'),
            hud = createEl('div', { className: 'hud' }),
            controlCenter = document.createElement('div'),
            worldState = generateWorld(worldGenOptions),
            inputSystem = new InputSystem(worldState);

      el.className = 'game';

      controlPanel.className = 'controlPanel';
      controlCenter.className = 'center';
      controlCenter.title = 'Current wind heading';

      controlPanel.appendChild(makeMusicToggle());
      controlPanel.appendChild(makeControls(processHeadingInput, controlCenter));

      const gameFrame = createEl('div', {
         className: 'gameFrame',
         childElements: [ canvas, hud ],
      });

      const statusBar = createEl('div', {
         className: 'status',
      });

      el.appendChild(createEl('div', { className: 'gamePanel', childElements: [ gameFrame, statusBar ] }));
      el.appendChild(controlPanel);

      const systems = [
         new WindSystem(),
         new MovementSystem(),
         new EncounterSystem(),
         new FogSystem(),
         new HUDSystem(hud, statusBar, controlCenter),
         new RenderSystem(canvas, gameFrame),
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
            renderScreen(makeMapScreen(worldState, isOutOfFood ? `Ran out of food<div class='small'>${statsComponent.event}</div>` : 'Explored all ports'));
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
