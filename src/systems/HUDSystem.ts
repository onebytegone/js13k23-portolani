import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';
import { HEADING_SPRITES } from '@/components/create-heading-component';
import { CHARACTER_FONT_STACK, FISH_SVG_PATH, Sprite } from '@/components/create-sprite-component';
import { createEl, loadHTML } from '@/lib/dom';

export class HUDSystem extends System {

   private _foodEl = createEl('span');
   private _portEl = createEl('span');
   private _eventEl = createEl('span');

   public constructor(hudEl: HTMLElement, private _controlCenterEl: HTMLElement) {
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

      hudEl.appendChild(createEl('div', {
         className: 'ne',
         childElements: [
            createEl('div', {
               className: 'stat',
               childElements: [
                  loadHTML(`<svg height="1em" viewBox="0 -20 100 100"><path d="${FISH_SVG_PATH}"/></svg>`),
                  this._foodEl,
               ],
            }),
         ]
      }));

      hudEl.appendChild(createEl('div', {
         className: 's',
         childElements: [
            createEl('div', {
               className: 'stat',
               childElements: [
                  this._eventEl,
               ],
            }),
         ]
      }));
   }

   // eslint-disable-next-line class-methods-use-this
   public update(_delta: number, worldState: WorldState): void {
      const playerEntityID = worldState.getEntities([ ComponentID.Stats, ComponentID.Position ])[0],
            [ stats, player, movement, sprite ] = worldState.getComponents(playerEntityID, [ ComponentID.Stats, ComponentID.Position, ComponentID.Movement, ComponentID.Sprite ] as const),
            windEntityID = worldState.getEntitiesAtLocation(player, [ ComponentID.Terrain, ComponentID.Heading ])[0],
            [ heading ] = worldState.getComponents(windEntityID, [ ComponentID.Heading ]),
            foodLevel = Math.floor(stats.food),
            foodDelta = stats.lastReportedFood !== undefined ? foodLevel - stats.lastReportedFood : undefined;

      this._foodEl.innerText = `${foodLevel} days ${foodDelta ? ` (${foodDelta})` : ''}`;
      this._eventEl.innerText = stats.event || '';
      this._portEl.innerText = `${stats.portsVisited.length}/${stats.totalPorts}`;
      this._controlCenterEl.innerHTML = `${HEADING_SPRITES[heading.heading]}`;

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
