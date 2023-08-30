import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';
import { HEADING_SPRITES } from '@/components/create-heading-component';

function addSpacer(el: HTMLElement): void {
   const spacer = document.createElement('div');

   spacer.style.flex = '1';
   el.appendChild(spacer);
}

export class HUDSystem extends System {

   private _foodEl = document.createElement('span');
   private _portEl = document.createElement('span');

   public constructor(statsEl: HTMLElement, private _controlCenterEl: HTMLElement) {
      super();

      const portWrapper = document.createElement('div');

      portWrapper.innerText = 'Ports: ';
      portWrapper.appendChild(this._portEl);
      statsEl.appendChild(portWrapper);

      addSpacer(statsEl);

      const foodWrapper = document.createElement('div');

      foodWrapper.innerText = 'Food left: ';
      foodWrapper.appendChild(this._foodEl);
      statsEl.appendChild(foodWrapper);
   }

   // eslint-disable-next-line class-methods-use-this
   public update(_delta: number, worldState: WorldState): void {
      const playerEntityID = worldState.getEntities([ ComponentID.Stats, ComponentID.Position ])[0],
            [ stats, player, movement, sprite ] = worldState.getComponents(playerEntityID, [ ComponentID.Stats, ComponentID.Position, ComponentID.Movement, ComponentID.Sprite ] as const),
            windEntityID = worldState.getEntitiesAtLocation(player, [ ComponentID.Terrain, ComponentID.Heading ])[0],
            [ heading ] = worldState.getComponents(windEntityID, [ ComponentID.Heading ]);

      this._foodEl.innerText = `${stats.food} days`;
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
   }

}
