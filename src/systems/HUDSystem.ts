import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';

export class HUDSystem extends System {

   public constructor(private _headerEl: HTMLElement, private _footerEl: HTMLElement) {
      super();
   }

   // eslint-disable-next-line class-methods-use-this
   public update(_delta: number, worldState: WorldState): void {
      const [ stats ] = worldState.getComponents(worldState.getEntities([ ComponentID.Stats ])[0], [ ComponentID.Stats ]);

      this._headerEl.innerText = `Food: ${stats.food}`;
   }

}
