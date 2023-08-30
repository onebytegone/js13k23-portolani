import { ScreenRenderFn } from '@/shared-types';
import { makeButton } from './elements/make-button';
import { makeGameScreen } from './GameScreen';

export function makeIntroScreen(): ScreenRenderFn {
   return (el, renderScreen) => {
      const title = document.createElement('h1');

      title.innerText = '𝕻𝔬𝔯𝔱𝔬𝔩𝔞𝔫𝔦';
      el.appendChild(title);

      el.appendChild(makeButton('Play', () => {
         renderScreen(makeGameScreen());
      }));
   };
}
