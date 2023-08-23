import { ComponentID } from '@/shared-types';
import { System } from './System';
import { WorldState } from '@/lib/WorldState';
import { ISpriteComponent, Color } from '@/components/create-sprite-component';
import { FogLevel } from '@/components/create-fog-component';

const CAMERA_MARGIN = 12;

export class RenderSystem extends System {

   static components = [ ComponentID.Position, ComponentID.Sprite ] as const;

   private _sprites: (ISpriteComponent | undefined)[][] = [];
   private _camera: { x: number; y: number, viewportWidth: number, viewportHeight: number } = {
      x: 0,
      y: 0,
      viewportWidth: 0,
      viewportHeight: 0,
   };
   private _mapSize: { x: number; y: number } = { x: 0, y: 0 };

   public constructor(private _canvas: HTMLCanvasElement, private _container: HTMLElement) {
      super();

      new ResizeObserver(() => { this._draw(); }).observe(this._container);
   }

   public update(delta: number, worldState: WorldState): void {
      const [ camera ] = worldState.getComponents(worldState.getEntities([ ComponentID.Camera ])[0], [ ComponentID.Camera ]),
            [ player ] = worldState.getComponents(worldState.getEntities([ ComponentID.Input, ComponentID.Position ])[0], [ ComponentID.Position ]);

      const map: ISpriteComponent[][][] = [];

      this._mapSize = worldState.getEntities(RenderSystem.components).reduce((memo, entityID) => {
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

         if (loc.y >= memo.y) {
            memo.y = loc.y + 1;
         }

         if (loc.x >= memo.x) {
            memo.x = loc.x + 1;
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

      camera.x = Math.max(0, Math.min(this._mapSize.x - camera.viewportWidth + 1, camera.x));
      camera.y = Math.max(0, Math.min(this._mapSize.y - camera.viewportHeight + 1, camera.y));

      this._sprites = [];
      this._camera = { ...camera };

      for (let y = 0; y < this._mapSize.y; y++) {
         this._sprites.push([]);

         for (let x = 0; x < this._mapSize.x; x++) {
            this._sprites[y][x] = map[y][x].reduce((memo: ISpriteComponent | undefined, sprite) => {
               return memo ? (memo.layer >= sprite.layer ? memo : sprite) : sprite;
            }, undefined);
         }
      }

      this._draw();
   }

   private _draw(): void {
      const ctx = this._canvas.getContext('2d')!,
            dpr = window.devicePixelRatio,
            viewportRatio = this._camera.viewportHeight / this._camera.viewportWidth,
            wrapperRatio = this._container.clientHeight / this._container.clientWidth,
            [ axis, dimension ] = wrapperRatio > viewportRatio ? [ 'viewportWidth', 'clientWidth' ] as const : [ 'viewportHeight', 'clientHeight' ] as const,
            tileSize = Math.floor(dpr * this._container[dimension] / this._camera[axis]);

      this._canvas.width = this._container.clientWidth * dpr;
      this._canvas.height = this._container.clientHeight * dpr;
      this._canvas.style.width = `${this._container.clientWidth}px`;
      this._canvas.style.height = `${this._container.clientHeight}px`;

      const tileMarginX = Math.ceil((Math.ceil(this._canvas.width / tileSize) - this._camera.viewportWidth) / 2),
            tileMarginY = Math.ceil((Math.ceil(this._canvas.height / tileSize) - this._camera.viewportHeight) / 2),
            visibleTilesX = this._camera.viewportWidth + tileMarginX * 2,
            visibleTilesY = this._camera.viewportHeight + tileMarginY * 2,
            renderX = Math.round((this._canvas.width - tileSize * visibleTilesX) / 2),
            renderY = Math.round((this._canvas.height - tileSize * visibleTilesY) / 2),
            tileOffsetX = Math.max(-1, Math.min(this._camera.x - tileMarginX, this._mapSize.x - visibleTilesX + 1)),
            tileOffsetY = Math.max(-1, Math.min(this._camera.y - tileMarginY, this._mapSize.y - visibleTilesY + 1));

      for (let y = 0; y < visibleTilesY; y++) {
         for (let x = 0; x < visibleTilesX; x++) {
            const sprite = this._sprites[y + tileOffsetY] ? this._sprites[y + tileOffsetY][x + tileOffsetX] : undefined;

            if (!sprite) {
               ctx.fillStyle = Color.DefaultBG;
               ctx.fillRect(renderX + x * tileSize, renderY + y * tileSize, tileSize, tileSize);

               ctx.textBaseline = 'middle';
               ctx.textAlign = 'center';
               ctx.fillStyle = Color.Default;
               ctx.font = `${tileSize * 1.5}px monospace`;
               ctx.fillText(
                  '☁︎',
                  renderX + x * tileSize + tileSize / 2,
                  renderY + y * tileSize + tileSize / 2 - tileSize / 3
               );
               continue;
            }

            ctx.fillStyle = sprite.bg ?? Color.DefaultBG;
            ctx.fillRect(renderX + x * tileSize, renderY + y * tileSize, tileSize, tileSize);

            ctx.fillStyle = sprite.tint ?? Color.Default;
            ctx.save();
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = `${tileSize}px monospace`;
            ctx.filter = sprite.filter ?? 'none';
            ctx.translate(renderX + x * tileSize + tileSize / 2, renderY + y * tileSize + tileSize / 2);
            ctx.rotate(sprite.skew);
            ctx.scale(sprite.size.x, sprite.size.y);
            ctx.fillText(sprite.sprite, 0, 0);
            ctx.restore();
         }
      }
   }

}
