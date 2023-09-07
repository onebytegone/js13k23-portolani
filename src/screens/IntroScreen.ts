import { ScreenRenderFn } from '@/shared-types';
import { makeButton } from './elements/make-button';
import { makeGameScreen } from './GameScreen';
import { createEl } from '@/lib/dom';
import formatDate from '@/lib/format-date';
import { getHighScores, getNearAccount, isNearAvailable, isSignedIn, signIn, signOut } from '@/lib/near';
import renderLeaderboardForDate from '@/lib/render-leaderboard-for-date';

export function makeIntroScreen(): ScreenRenderFn {
   return async (el, renderScreen) => {
      el.className = 'intro';

      el.appendChild(createEl('div', {
         childElements: [
            createEl('h1', { innerText: '𝕻𝔬𝔯𝔱𝔬𝔩𝔞𝔫𝔦' }),
            createEl('div', { className: 'subtitle', innerText: 'A game of exploration and charting' }),
         ],
      }));

      if (isNearAvailable() && await isSignedIn()) {
         el.appendChild(createEl('p', { innerText: `Welcome ${await getNearAccount()}!` }));
      }

      const generatorVersion = ' a.0',
            now = new Date();

      el.appendChild(makeButton('Daily Challenge', () => {
         renderScreen(makeGameScreen({
            kernel: Math.floor(now.getTime() / 1000 / 60 / 60 / 24),
            label: formatDate(now) + generatorVersion,
            date: formatDate(now),
            mapSize: { x: 40, y: 30 },
            startingFood: { min: 31, max: 31 },
            portCount: { min: 8, max: 8 },
            fishCount: { min: 3, max: 6 },
            pirateCount: { min: 10, max: 15 },
            copiesOfBonuses: 2,
         }));
      }));

      if (isNearAvailable()) {
         if (await isSignedIn()) {
            el.appendChild(makeButton('Sign out of NEAR', signOut));
         } else {
            el.appendChild(makeButton('Login with NEAR', signIn));
         }

         const leaderboard = await getHighScores();

         el.appendChild(renderLeaderboardForDate(leaderboard, formatDate(now), 'today'));
         el.appendChild(renderLeaderboardForDate(leaderboard, formatDate(new Date(now.getTime() - 24 * 60 * 60 * 1000)), 'yesterday'));
      }
   };
}
