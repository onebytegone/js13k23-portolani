import { ScreenRenderFn } from '@/shared-types';
import { makeButton } from './elements/make-button';
import { makeGameScreen } from './GameScreen';

export function makeIntroScreen(): ScreenRenderFn {
   return (el, renderScreen) => {
      el.className = 'intro';

      const title = document.createElement('h1');

      title.innerText = '𝕻𝔬𝔯𝔱𝔬𝔩𝔞𝔫𝔦';
      el.appendChild(title);

      const generatorVersion = ' a.0';

      el.appendChild(makeButton('Daily Challenge', () => {
         renderScreen(makeGameScreen({
            kernel: Math.floor(Date.now() / 1000 / 60 / 60 / 24),
            label: new Date().toISOString().replace(/T.*/, '') + generatorVersion,
            mapSize: { x: 40, y: 30 },
            startingFood: { min: 31, max: 31 },
            portCount: { min: 8, max: 8 },
            fishCount: { min: 3, max: 6 },
            pirateCount: { min: 10, max: 15 },
            copiesOfBonuses: 2,
         }));
      }));

      el.appendChild(makeButton('Mega Map', () => {
         renderScreen(makeGameScreen({
            kernel: Math.floor(Date.now() / 1000 / 60 / 60 / 24),
            label: new Date().toISOString().replace(/T.*/, '') + ' MEGA' + generatorVersion,
            mapSize: { x: 160, y: 120 },
            startingFood: { min: 41, max: 61 },
            portCount: { min: 20, max: 30 },
            fishCount: { min: 10, max: 30 },
            pirateCount: { min: 30, max: 60 },
            copiesOfBonuses: 5,
         }));
      }));
   };
}
