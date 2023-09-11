const SPEAKER_BASE_SVG_PATH = 'M55 20 v 60 h -8 l -20 -20 h -15 v -20 h 15 l 20 -20 h 8 z';
const PLAYING_SVG_PATH = 'M62 36 a 10 10 0 0 1 0 28 v -4 a 10 10 0 0 0 0 -20 z M62 28 a 10 10 0 0 1 0 44 v -4 a 10 10 0 0 0 0 -36 z';
const MUTED_SVG_PATH = 'M68 36 l 8 8 l 8 -8 l 4 4 l -8 8 l 8 8 l -4 4 l -8 -8 l -8 8 l -4 -4 l 8 -8 l -8 -8 z';

export function makeMusicToggle(): HTMLElement {
   const musicButton = document.createElement('a');

   musicButton.className = 'music';

   function updateButtonText() {
      const extra = window.isMusicPlaying ? PLAYING_SVG_PATH : MUTED_SVG_PATH;

      musicButton.innerHTML = `<svg height="1em" viewBox="0 0 100 100"><path d="${SPEAKER_BASE_SVG_PATH} ${extra}"/></svg>`;
   }
   updateButtonText();

   musicButton.href = '#';
   musicButton.onclick = (evt) => {
      evt.preventDefault();
      window.dispatchEvent(new Event('toggleMusic'));
      updateButtonText();
   };

   return musicButton;
}
