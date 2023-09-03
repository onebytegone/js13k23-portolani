import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState, anyEntity } from '@/lib/WorldState';
import { HEADING_SPRITES } from '@/components/create-heading-component';
import { CHARACTER_FONT_STACK, FISH_SVG_HTML, FISH_SVG_PATH, Sprite } from '@/components/create-sprite-component';
import { createEl, loadHTML } from '@/lib/dom';

export class HUDSystem extends System {

   private _foodEl = createEl('span', { className: 'value', title: 'Days of food remaining' });
   private _portEl = createEl('span', { className: 'value', title: 'Number of ports visited' });
   private _bonusEl = createEl('span');

   public constructor(hudEl: HTMLElement, private _statusEl: HTMLElement, private _controlCenterEl: HTMLElement) {
      super();

      const portIcon = createEl('span');

      portIcon.innerText = Sprite.Port;
      portIcon.style.fontFamily = CHARACTER_FONT_STACK;

      hudEl.appendChild(createEl('div', {
         className: 'nw',
         childElements: [
            createEl('div', {
               className: 'stat',
               childElements: [
                  portIcon,
                  this._portEl,
               ],
            }),
         ]
      }));

      this._bonusEl = createEl('div', { className: 'stat bonus' });

      hudEl.appendChild(createEl('div', {
         className: 'ne',
         childElements: [
            createEl('div', {
               className: 'stat',
               childElements: [
                  loadHTML(FISH_SVG_HTML),
                  this._foodEl,
               ],
            }),
            this._bonusEl,
         ]
      }));
   }

   // eslint-disable-next-line class-methods-use-this
   public update(_delta: number, worldState: WorldState): void {
      const [ stats, player, movement, sprite ] = anyEntity(worldState.getEntities([ ComponentID.Stats, ComponentID.Position, ComponentID.Movement, ComponentID.Sprite ] as const)),
            [ , heading ] = anyEntity(worldState.getEntitiesAtLocation(player, [ ComponentID.Terrain, ComponentID.Heading ] as const)),
            foodLevel = Math.floor(stats.food),
            foodDelta = stats.lastReportedFood !== undefined ? foodLevel - stats.lastReportedFood : undefined;

      this._foodEl.innerText = `${foodLevel} days ${foodDelta ? ` (${foodDelta})` : ''}`;
      this._statusEl.innerHTML = stats.event || '';
      this._portEl.innerText = `${stats.portsVisited.length}/${stats.totalPorts}`;
      this._controlCenterEl.innerHTML = `${HEADING_SPRITES[heading.heading]}`;

      this._bonusEl.innerHTML = '';
      if (stats.localCrew) {
         this._bonusEl.appendChild(createEl('div', {
            innerText: Sprite.LocalCrew,
            title: 'Local Crew: Advanced knowledge about fish, pirates, and ports',
         }));
      }
      if (stats.navLog) {
         this._bonusEl.appendChild(createEl('div', {
            innerText: Sprite.NavLog,
            title: 'Nav Log: More insight into wind conditions',
         }));
      }
      if (stats.soundingLine) {
         this._bonusEl.appendChild(createEl('div', {
            innerText: Sprite.SoundingLine,
            title: 'Sounding Line: Better understanding about the location of land',
         }));
      }

      sprite.skew = 0;
      sprite.size.x = 1;
      sprite.size.y = 1;
      if (movement.x === -1 && movement.y === -1) {
         sprite.skew = Math.PI / 4;
         sprite.size.x = -1;
      } else if (movement.x === -1 && movement.y === 1) {
         sprite.skew = Math.PI / -4;
         sprite.size.x = -1;
      } else if (movement.x === 0 && movement.y === -1) {
         sprite.skew = Math.PI / 2;
         sprite.size.x = -1;
      } else if (movement.x === -1 && movement.y === 0) {
         sprite.size.x = -1;
      } else if (movement.x === 1 && movement.y === 1) {
         sprite.skew = Math.PI / 4;
      } else if (movement.x === 1 && movement.y === -1) {
         sprite.skew = Math.PI / -4;
      } else if (movement.x === 0 && movement.y === 1) {
         sprite.skew = Math.PI / 2;
         sprite.size.y = -1;
      }

      stats.lastReportedFood = foodLevel;
   }

}
