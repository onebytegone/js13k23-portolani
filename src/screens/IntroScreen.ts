import { ScreenRenderFn } from '@/shared-types';
import { makeButton } from './elements/make-button';
import { makeGameScreen } from './GameScreen';
import { createEl } from '@/lib/dom';
import formatDate from '@/lib/format-date';
import { NEAR_CONSENT_KEY, getHighScores, getNearAccount, isSignedIn, loadNear, signIn, signOut } from '@/lib/near';
import renderLeaderboardForDate from '@/lib/render-leaderboard-for-date';
import { LocalStorageKey, getItem, putItem } from '@/lib/local-storage';
import { makeIslandGenerator } from '@/lib/generators/land-islands';
import { makeRiverGenerator } from '@/lib/generators/land-rivers';
import { makeMusicToggle } from './elements/make-music-toggle';

const DAILY_CHALLENGE = 'Daily Challenge';

export function makeIntroScreen(): ScreenRenderFn {
   return async (el, renderScreen) => {
      el.className = 'intro';

      el.appendChild(createEl('div', {
         childElements: [
            makeMusicToggle(),
            createEl('h1', { innerText: '𝕻𝔬𝔯𝔱𝔬𝔩𝔞𝔫𝔦' }),
            createEl('div', { className: 'subtitle', innerText: 'A game of exploration and charting' }),
         ],
      }));

      const now = new Date(),
            todayFormatted = formatDate(now),
            tomorrow = Math.floor(now.getTime() / 1000 / 60 / 60 / 24 + 1) * 86400,
            kernel = Math.floor(now.getTime() / 1000 / 60 / 60 / 24);

      const dailyChallengeEl = el.appendChild(makeButton(DAILY_CHALLENGE, () => {
         renderScreen(makeGameScreen({
            kernel,
            label: todayFormatted,
            date: todayFormatted,
            mapSize: { x: 40, y: 30 },
            makeLandGeneratorFn: makeIslandGenerator,
            startingFood: { min: 31, max: 31 },
            portCount: { min: 8, max: 8 },
            fishCount: { min: 3, max: 6 },
            pirateCount: { min: 8, max: 12 },
            copiesOfBonuses: 2,
         }));
      }));

      if (getItem(LocalStorageKey.LastPlayed, false) === todayFormatted) {
         function updateClock() {
            const remaining = tomorrow - Math.floor(new Date().getTime() / 1000),
                  hours = Math.floor((remaining % 86400) / (3600)),
                  minutes = Math.floor((remaining % 3600) / (60)),
                  seconds = remaining % 60;

            function pad(v: number): string {
               return `${v}`.padStart(2, '0');
            }

            dailyChallengeEl.innerText = `${DAILY_CHALLENGE} (Next ${pad(hours)}:${pad(minutes)}:${pad(seconds)})`;
         }

         updateClock();
         setInterval(updateClock, 1000);

         el.appendChild(makeButton('BONUS: Mega Map', () => {
            renderScreen(makeGameScreen({
               kernel,
               label: formatDate(now) + ' MEGA',
               mapSize: { x: 160, y: 120 },
               makeLandGeneratorFn: makeIslandGenerator,
               startingFood: { min: 41, max: 61 },
               portCount: { min: 20, max: 30 },
               fishCount: { min: 10, max: 30 },
               pirateCount: { min: 30, max: 60 },
               copiesOfBonuses: 5,
            }));
         }));

         el.appendChild(makeButton('BONUS: Rivers and Streams', () => {
            renderScreen(makeGameScreen({
               kernel,
               label: formatDate(now) + ' RIVER',
               mapSize: { x: 160, y: 120 },
               makeLandGeneratorFn: makeRiverGenerator,
               startingFood: { min: 41, max: 61 },
               portCount: { min: 20, max: 30 },
               fishCount: { min: 30, max: 90 },
               pirateCount: { min: 30, max: 60 },
               copiesOfBonuses: 5,
            }));
         }));
      }

      async function loadNearUI(): Promise<void> {
         const signedIn = await isSignedIn();

         if (signedIn) {
            el.appendChild(createEl('p', { innerText: `Welcome ${await getNearAccount()}!` }));
         } else {
            el.appendChild(makeButton('Log in with NEAR', signIn));
         }

         const leaderboard = await getHighScores(),
               yesterday = formatDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));

         el.appendChild(renderLeaderboardForDate(leaderboard, formatDate(now), 'today'));

         if (leaderboard[yesterday]) {
            el.appendChild(renderLeaderboardForDate(leaderboard, yesterday, 'yesterday'));
         }

         const disconnect = document.createElement('a');

         disconnect.className = 'signOut';
         disconnect.innerText = signedIn
            ? 'Sign out of NEAR and disconnect from external resources'
            : 'Disconnect from external resources';
         disconnect.href = '#';
         disconnect.onclick = signOut;
         el.appendChild(disconnect);
      }

      if (await loadNear()) {
         await loadNearUI();
      } else {
         const loadNearButton = el.appendChild(makeButton('Connect to NEAR Leaderboard<div class="disclaimer">(will download external resources)</div>', () => {
            putItem(NEAR_CONSENT_KEY, true);
            el.removeChild(loadNearButton);
            loadNear().then(loadNearUI);
         }));
      }
   };
}
