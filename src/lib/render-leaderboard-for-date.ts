import { HighScore } from '@/shared-types';
import { createEl } from './dom';

export default function renderLeaderboardForDate(leaderboard: Record<string, HighScore[]>, date: string, label: string): HTMLElement {
   const el = createEl('div', { className: 'leaderboardWrap' });

   el.appendChild(createEl('h2', { innerText: `High scores for ${label}` }));

   if (!leaderboard[date]) {
      el.appendChild(createEl('span', { innerText: 'None yet!' }));
      return el;
   }

   el.appendChild(createEl('div', {
      className: 'leaderboard',
      childElements: leaderboard[date].flatMap((entry, i) => {
         return [
            createEl('span', { innerText: `${i + 1}.` }),
            createEl('span', { innerText: entry.sender }),
            createEl('span', { className: 'score', innerText: `↟${entry.tiles} ☀︎${entry.days} ⚓︎${entry.ports}` }),
         ];
      }),
   }));

   return el;
}
