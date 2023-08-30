import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';
import { HEADING_SPRITES } from '@/components/create-heading-component';
import { FISH_SVG_PATH, Sprite } from '@/components/create-sprite-component';

function addSpacer(el: HTMLElement): void {
   const spacer = document.createElement('div');

   spacer.style.flex = '1';
   el.appendChild(spacer);
}

export class HUDSystem extends System {

   private _foodEl = document.createElement('span');
   private _portEl = document.createElement('span');
   private _eventEl = document.createElement('span');

   public constructor(statsEl: HTMLElement, private _controlCenterEl: HTMLElement) {
      super();

      const portWrapper = document.createElement('div');

      portWrapper.innerText = `${Sprite.Port}`;
      portWrapper.appendChild(this._portEl);
      statsEl.appendChild(portWrapper);

      addSpacer(statsEl);
      statsEl.appendChild(this._eventEl);
      addSpacer(statsEl);

      const foodWrapper = document.createElement('div');

      foodWrapper.innerHTML = `<svg height="1em" viewBox="0 -20 100 100"><path d="${FISH_SVG_PATH}"/></svg>`;
      foodWrapper.appendChild(this._foodEl);
      statsEl.appendChild(foodWrapper);
   }

   // eslint-disable-next-line class-methods-use-this
   public update(_delta: number, worldState: WorldState): void {
      const playerEntityID = worldState.getEntities([ ComponentID.Stats, ComponentID.Position ])[0],
            [ stats, player, movement, sprite ] = worldState.getComponents(playerEntityID, [ ComponentID.Stats, ComponentID.Position, ComponentID.Movement, ComponentID.Sprite ] as const),
            windEntityID = worldState.getEntitiesAtLocation(player, [ ComponentID.Terrain, ComponentID.Heading ])[0],
            [ heading ] = worldState.getComponents(windEntityID, [ ComponentID.Heading ]),
            foodDelta = stats.lastReportedFood !== undefined ? stats.food - stats.lastReportedFood : undefined;

      this._foodEl.innerText = `${stats.food} days ${foodDelta !== undefined ? ` (${foodDelta})` : ''}`;
      this._eventEl.innerText = stats.event || '';
      this._portEl.innerText = `${stats.portsVisited}/${stats.totalPorts}`;
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

      stats.lastReportedFood = stats.food;
   }

}
