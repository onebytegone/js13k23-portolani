import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';
import { ISpriteComponent, Color } from '@/components/create-sprite-component';
import { FogLevel } from '@/components/create-fog-component';

const CAMERA_MARGIN = 12;

export class RenderSystem extends System {

   static components = [ ComponentID.Position, ComponentID.Sprite ] as const;

   private _sprites: (ISpriteComponent | undefined)[][] = [];
   private _viewport: { x: number; y: number } = { x: 0, y: 0 };

   public constructor(private _canvas: HTMLCanvasElement) {
      super();

      new ResizeObserver(() => { this._draw(); }).observe(this._canvas.parentElement!);
   }

   public update(delta: number, worldState: WorldState): void {
      const [ camera ] = worldState.getComponents(worldState.getEntities([ ComponentID.Camera ])[0], [ ComponentID.Camera ]),
            [ player ] = worldState.getComponents(worldState.getEntities([ ComponentID.Input, ComponentID.Position ])[0], [ ComponentID.Position ]);

      const map: ISpriteComponent[][][] = [];

      const maxPoint = worldState.getEntities(RenderSystem.components).reduce((memo, entityID) => {
         const [ loc, sprite, fog ] = worldState.getComponents(entityID, [ ...RenderSystem.components, ComponentID.Fog ] as const);

         if (!map[loc.y]) {
            map[loc.y] = [];
         }

         if (!map[loc.y][loc.x]) {
            map[loc.y][loc.x] = [];
         }

         // TODO: Types, `fog` would ideally be possibly undefined
         if (!fog || fog.level === FogLevel.None) {
            map[loc.y][loc.x].push(sprite);
         }

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

      this._sprites = [];
      this._viewport = {
         x: camera.viewportWidth,
         y: camera.viewportHeight,
      };

      for (let y = 0; y < this._viewport.y; y++) {
         const tileY = y + camera.y;

         this._sprites.push([]);

         for (let x = 0; x < this._viewport.x; x++) {
            const tileX = x + camera.x;

            this._sprites[y][x] = map[tileY][tileX].reduce((memo: ISpriteComponent | undefined, sprite) => {
               return memo ? (memo.layer >= sprite.layer ? memo : sprite) : sprite;
            }, undefined);
         }
      }

      this._draw();
   }

   private _draw(): void {
      const ctx = this._canvas.getContext('2d')!,
            dpr = window.devicePixelRatio,
            viewportRatio = this._viewport.y / this._viewport.x,
            wrapperRatio = this._canvas.parentElement!.clientHeight / this._canvas.parentElement!.clientWidth,
            [ axis, dimension ] = wrapperRatio > viewportRatio ? [ 'x', 'clientWidth' ] as const : [ 'y', 'clientHeight' ] as const,
            tileSize = Math.round(Math.round(dpr * this._canvas.parentElement![dimension]) / this._viewport[axis]);

      this._canvas.width = tileSize * this._viewport.x;
      this._canvas.height = this._canvas.width * viewportRatio;

      for (let y = 0; y < this._viewport.y; y++) {
         for (let x = 0; x < this._viewport.x; x++) {
            const sprite = this._sprites[y][x];

            if (!sprite) {
               ctx.fillStyle = Color.DefaultBG;
               ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

               ctx.textBaseline = 'middle';
               ctx.textAlign = 'center';
               ctx.fillStyle = Color.Default;
               ctx.font = `${tileSize * 1.5}px monospace`;
               ctx.fillText(
                  '☁︎',
                  x * tileSize + tileSize / 2,
                  y * tileSize + tileSize / 2 - tileSize / 3
               );
               continue;
            }

            ctx.fillStyle = sprite.bg ?? Color.DefaultBG;
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = sprite.tint ?? Color.Default;
            ctx.font = `${tileSize}px monospace`;
            ctx.fillText(
               sprite.sprite,
               x * tileSize + tileSize / 2,
               y * tileSize + tileSize / 2
            );
         }
      }
   }

}
