import { makeIntroScreen } from './screens/IntroScreen';
import { ScreenRenderFn } from './shared-types';

function renderScreen(screen: ScreenRenderFn): void {
   s5.innerHTML = '';
   s5.className = '';
   screen(s5, renderScreen);
}

window.addEventListener('load', function() {
   renderScreen(makeIntroScreen());
});
