import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';
import { HEADING_SPRITES } from '@/components/create-heading-component';

export class HUDSystem extends System {

   private _foodEl = document.createElement('span');
   private _windHeadingEl = document.createElement('span');

   public constructor(headerEl: HTMLElement, private _footerEl: HTMLElement, private _controlCenterEl: HTMLElement) {
      super();

      const foodWrapper = document.createElement('div');

      foodWrapper.innerText = 'Food:';
      foodWrapper.appendChild(this._foodEl);
      headerEl.appendChild(foodWrapper);

      const spacer = document.createElement('div');

      spacer.style.flex = '1';
      headerEl.appendChild(spacer);

      const windHeadingWrapper = document.createElement('div');

      windHeadingWrapper.innerText = 'Wind:';
      windHeadingWrapper.appendChild(this._windHeadingEl);
      headerEl.appendChild(windHeadingWrapper);
   }

   // eslint-disable-next-line class-methods-use-this
   public update(_delta: number, worldState: WorldState): void {
      const playerEntityID = worldState.getEntities([ ComponentID.Stats, ComponentID.Position ])[0],
            [ stats, player, movement, sprite ] = worldState.getComponents(playerEntityID, [ ComponentID.Stats, ComponentID.Position, ComponentID.Movement, ComponentID.Sprite ] as const),
            windEntityID = worldState.getEntitiesAtLocation(player, [ ComponentID.Terrain, ComponentID.Heading ])[0],
            [ heading ] = worldState.getComponents(windEntityID, [ ComponentID.Heading ]);

      this._foodEl.innerText = `${stats.food}`;
      this._windHeadingEl.innerText = HEADING_SPRITES[heading.heading];
      this._controlCenterEl.innerHTML = `${HEADING_SPRITES[heading.heading]}`;

      sprite.skew = 0;
      sprite.size.x = 1;
      sprite.size.y = 1;
      if (movement.x === -1 && movement.y === -1) {
         sprite.skew = Math.PI / 4;
      } else if (movement.x === -1 && movement.y === 1) {
         sprite.skew = Math.PI / -4;
      } else if (movement.x === 0 && movement.y === -1) {
         sprite.skew = Math.PI / 2;
      } else if (movement.x === 1 && movement.y === 0) {
         sprite.size.x = -1;
      } else if (movement.x === 1 && movement.y === 1) {
         sprite.skew = Math.PI / 4;
         sprite.size.x = -1;
      } else if (movement.x === 1 && movement.y === -1) {
         sprite.skew = Math.PI / -4;
         sprite.size.x = -1;
      } else if (movement.x === 0 && movement.y === 1) {
         sprite.skew = Math.PI / 2;
         sprite.size.x = -1;
         sprite.size.y = -1;
      }
   }

}
