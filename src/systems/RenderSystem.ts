import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';
import { ISpriteComponent } from '@/components/create-sprite-component';

const CAMERA_MARGIN = 4;

export class RenderSystem extends System {

   static components = [ ComponentID.Position, ComponentID.Sprite ] as const;

   public update(delta: number, worldState: WorldState): void { // eslint-disable-line class-methods-use-this
      const [ camera ] = worldState.getComponents(worldState.getEntities([ ComponentID.Camera ])[0], [ ComponentID.Camera ]),
            [ player ] = worldState.getComponents(worldState.getEntities([ ComponentID.Input, ComponentID.Position ])[0], [ ComponentID.Position ]);

      const map: ISpriteComponent[][][] = [];

      const maxPoint = worldState.getEntities(RenderSystem.components).reduce((memo, entityID) => {
         const [ loc, sprite ] = worldState.getComponents(entityID, RenderSystem.components);

         if (!map[loc.y]) {
            map[loc.y] = [];
         }

         if (!map[loc.y][loc.x]) {
            map[loc.y][loc.x] = [];
         }

         map[loc.y][loc.x].push(sprite);

         if (loc.y > memo.y) {
            memo.y = loc.y;
         }

         if (loc.x > memo.x) {
            memo.x = loc.x;
         }

         return memo;
      }, { x: 0, y: 0 });

      if (player.x - CAMERA_MARGIN < camera.x) {
         camera.x = player.x - CAMERA_MARGIN;
      }

      if (player.x + CAMERA_MARGIN >= camera.x + camera.viewportWidth) {
         camera.x = player.x - camera.viewportWidth + CAMERA_MARGIN + 1;
      }

      if (player.y - CAMERA_MARGIN < camera.y) {
         camera.y = player.y - CAMERA_MARGIN;
      }

      if (player.y + CAMERA_MARGIN >= camera.y + camera.viewportHeight) {
         camera.y = player.y - camera.viewportHeight + CAMERA_MARGIN + 1;
      }

      if (camera.x < 0) {
         camera.x = 0;
      }

      if (camera.x > maxPoint.x - camera.viewportWidth + 1) {
         camera.x = maxPoint.x - camera.viewportWidth + 1;
      }

      if (camera.y < 0) {
         camera.y = 0;
      }

      if (camera.y > maxPoint.y - camera.viewportHeight + 1) {
         camera.y = maxPoint.y - camera.viewportHeight + 1;
      }

      // console.log(camera);

      const view: string[][] = [];

      for (let y = 0; y < camera.viewportHeight; y++) {
         view.push([]);

         for (let x = 0; x < camera.viewportWidth; x++) {
            const topSprite = (map[y + camera.y][x + camera.x]).reduce((memo: ISpriteComponent | undefined, sprite) => {
               return memo ? (memo.layer >= sprite.layer ? memo : sprite) : sprite;
            }, undefined);

            view[y].push(topSprite ? topSprite.sprite : ' ');
         }
      }

      t2d.innerHTML = view
         .map((row) => {
            return row.join('');
         })
         .join('<br>');
   }

}
