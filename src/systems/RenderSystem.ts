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

   public constructor(private _canvas: HTMLCanvasElement, private _container: HTMLElement) {
      super();

      new ResizeObserver(() => { this._draw(); }).observe(this._container);
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
      this._camera = { ...camera };

      for (let y = 0; y < maxPoint.y; y++) {
         this._sprites.push([]);

         for (let x = 0; x < maxPoint.x; x++) {
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
            tileSize = Math.round(Math.round(dpr * this._container[dimension]) / this._camera[axis]);

      this._canvas.width = this._container.clientWidth * dpr;
      this._canvas.height = this._container.clientHeight * dpr;
      this._canvas.style.width = `${this._container.clientWidth}px`;
      this._canvas.style.height = `${this._container.clientHeight}px`;

      const renderX = Math.floor((this._canvas.width - tileSize * this._camera.viewportWidth) / 2),
            renderY = Math.floor((this._canvas.height - tileSize * this._camera.viewportHeight) / 2),
            tileOffsetX = this._camera.x,
            tileOffsetY = this._camera.y;

      for (let y = 0; y < this._camera.viewportHeight; y++) {
         for (let x = 0; x < this._camera.viewportWidth; x++) {
            const sprite = this._sprites[y + tileOffsetY][x + tileOffsetX];

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

            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = sprite.tint ?? Color.Default;
            ctx.font = `${tileSize}px monospace`;
            ctx.fillText(
               sprite.sprite,
               renderX + x * tileSize + tileSize / 2,
               renderY + y * tileSize + tileSize / 2
            );
         }
      }
   }

}
