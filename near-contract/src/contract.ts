import { NearBindgen, near, call, view, Vector } from 'near-sdk-js';
import { HighScore } from './HighScore';
import sortScores from '../../src/lib/sort-scores';

@NearBindgen({})
class Leaderboard { // eslint-disable-line unused-imports/no-unused-vars
   entries: Vector<HighScore> = new Vector<HighScore>('v-uid');

   @call({})
   submit_score({ ports, tiles, days, date }: { ports: number; tiles: number; days: number; date: string }) {
      const sender = near.predecessorAccountId(),
            timestamp = near.blockTimestamp(),
            now = new Date(Number(timestamp) / 1000000),
            currentDate = now.toISOString().replace(/T.*/, ''),
            yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, '');

      if (currentDate !== date) {
         throw new Error(`Unable to accept scores for ${date} as it's currently ${currentDate}`);
      }

      const oldEntries = this.entries.toArray();

      const yesterdaysEntries = oldEntries.filter((entries) => {
         return entries.date === yesterday;
      });

      const todaysEntries = oldEntries.filter((entries) => {
         return entries.date === currentDate;
      });

      todaysEntries.push({ sender, date, ports, tiles, days });
      sortScores(todaysEntries);

      this.entries.clear();
      this.entries.extend(yesterdaysEntries);
      this.entries.extend(todaysEntries.slice(0, 13));
   }

   @view({})
   get_scores(): HighScore[] {
      return this.entries.toArray();
   }

}
