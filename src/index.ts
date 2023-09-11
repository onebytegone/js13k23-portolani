import { createEl } from './lib/dom';
import { CHORD, Sequencer } from './lib/music';
import { makeIntroScreen } from './screens/IntroScreen';
import { ScreenRenderFn } from './shared-types';

declare global {
   interface Window { isMusicPlaying: boolean; }
}

window.isMusicPlaying = false;

function renderScreen(screen: ScreenRenderFn): void {
   const s5 = createEl('div');

   s5.id = 's5';
   page.innerHTML = '';
   page.appendChild(s5);

   screen(s5, renderScreen);
}

window.addEventListener('load', function() {
   renderScreen(makeIntroScreen());
});

let sequencer: Sequencer | undefined;

window.addEventListener('toggleMusic', () => {
   if (sequencer) {
      sequencer.stop();
      sequencer = undefined;
      window.isMusicPlaying = false;
      return;
   }

   window.isMusicPlaying = true;
   sequencer = new Sequencer(new AudioContext(), [
      // ------------------------------
      { pluck: [ ,,,,, 0 ] }, // E4
      ,,
      { pluck: [ ,,,,, 0 ] }, // E4
      ,
      { pluck: [ ,,,,, 0 ] }, // E4
      // ------------------------------
      { pluck: [ ,,, 2,, ] }, // A3
      ,,
      { pluck: [ ,,,, 0, ] }, // B3
      ,
      { pluck: [ ,,,, 0, ] }, // B3
      // ------------------------------
      { pluck: [ ,,,, 1, ] }, // C4
      ,
      { pluck: [ ,,,, 1, ] }, // C4
      { pluck: [ ,,,, 3, ] }, // D4
      ,,
      // ------------------------------
      { pluck: [ ,,,, 0, ] }, // B3
      { pluck: [ ,,, 0,, ] }, // G3
      ,
      { pluck: [ ,,,, 3, ] }, // D4
      ,,
      // ------------------------------
      { pluck: [ ,,,, 1, ] }, // C4
      ,
      { pluck: [ ,,,, 1, ] }, // C4
      { pluck: [ ,,, 2,, ] }, // A3
      ,,
      // ------------------------------
      { pluck: [ ,,, 0,, ] }, // G3
      ,,,,,
      // ------------------------------
      { strum: CHORD.A, speed: 0.03 }, // { pluck: [ ,,,,, 0 ] }, // E4
      ,,
      { pluck: [ ,,,,, 0 ] }, // E4
      ,,
      // ------------------------------
      { pluck: [ ,,, 2,, ] }, // A3
      ,,
      { pluck: [ ,,,, 0, ] }, // B3
      ,,
      // ------------------------------
      { strum: CHORD.C, speed: 0.03 }, // { pluck: [ ,,,, 1, ] }, // C4
      ,,
      { pluck: [ ,,,, 3, ] }, // D4
      ,,
      // ------------------------------
      { pluck: [ ,,,, 0, ] }, // B3
      { pluck: [ ,,, 0,, ] }, // G3
      ,
      { pluck: [ ,,,, 3, ] }, // D4
      ,,
      // ------------------------------
      { pluck: [ ,,,, 1, ] }, // C4
      ,,
      { pluck: [ ,,, 2,, ] }, // A3
      ,,
      // ------------------------------
      { strum: CHORD.G, speed: 0.03 }, // { pluck: [ ,,, 0,, ] }, // G3
      ,,,,,
      // ------------------------------
      { pluck: [ ,,,,, 0 ] }, // E4
      { pluck: [ ,,,,, 1 ] }, // F4
      ,
      { pluck: [ ,,,,, 0 ] }, // E4
      { pluck: [ ,,,, 3, ] }, // D4
      { pluck: [ ,,,, 1, ] }, // C4
      // ------------------------------
      { pluck: [ ,,,, 3, ] }, // D4
      ,,
      { pluck: [ ,,,,, 0 ] }, // E4
      ,,
      // ------------------------------
      { pluck: [ ,,,, 1, ] }, // C4
      { pluck: [ ,,, 2,, ] }, // A3
      ,
      { pluck: [ ,,, 2,, ] }, // A3
      ,,
      // ------------------------------
      { pluck: [ ,,, 0,, ] }, // G3
      ,,,,,
      // ------------------------------
      { strum: CHORD.A, speed: 0.03 }, // { pluck: [ ,,,,, 0 ] }, // E4
      { pluck: [ ,,,,, 1 ] }, // F4
      ,
      { pluck: [ ,,,,, 0 ] }, // E4
      { pluck: [ ,,,, 3, ] }, // D4
      { pluck: [ ,,,, 1, ] }, // C4
      // ------------------------------
      { strum: CHORD.G, speed: 0.03 }, // { pluck: [ ,,,, 3, ] }, // D4
      ,,
      { pluck: [ ,,,,, 0 ] }, // E4
      ,,
      // ------------------------------
      { pluck: [ ,,,, 1, ] }, // C4
      { pluck: [ ,,, 2,, ] }, // A3
      ,
      { pluck: [ ,,, 2,, ] }, // A3
      ,,
      // ------------------------------
      { pluck: [ ,,, 0,, ] }, // G3
      ,,,,,
      // ------------------------------
      { pluck: [ ,,,, 1, ] }, // C4
      ,,
      { pluck: [ ,,,, 0, ] }, // B3
      { pluck: [ ,,,, 3, ] }, // D4
      ,
      // ------------------------------
      { pluck: [ ,,,, 1, ] }, // C4
      { pluck: [ ,,, 2,, ] }, // A3
      ,
      { pluck: [ ,,, 2,, ] }, // A3
      { pluck: [ ,, 3,,, ] }, // F3
      ,
      // ------------------------------
      { pluck: [ ,,, 0,, ] }, // G3
      ,,,,,
   ], 260);

   sequencer.play();
});
