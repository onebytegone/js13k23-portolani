import { FogLevel } from '@/components/create-fog-component';
import { CHARACTER_FONT_STACK, Color, ISpriteComponent, Sprite } from '@/components/create-sprite-component';
import { WorldState, anyEntity, makeEntityID } from '@/lib/WorldState';
import { ComponentID } from '@/shared-types';
import { System } from './System';

const CAMERA_MARGIN = 4;

export class RenderSystem extends System {

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
      const [ camera ] = anyEntity(worldState.getEntities([ ComponentID.Camera ])),
            [ , player ] = anyEntity(worldState.getEntities([ ComponentID.Input, ComponentID.Position ] as const));

      const mapData = Object.entries(worldState.getEntities([ ComponentID.Position, ComponentID.Sprite ] as const)).reduce((memo, [ entityID, [ loc, sprite ] ]) => {
         const [ fog ] = worldState.getComponents(makeEntityID(entityID), [ ComponentID.Fog ]);

         if (!memo.map[loc.y]) {
            memo.map[loc.y] = [];
         }

         if (!memo.map[loc.y][loc.x]) {
            memo.map[loc.y][loc.x] = [];
         }

         if (!fog || fog.level === FogLevel.None) {
            memo.map[loc.y][loc.x].push(sprite);
         }

         if (loc.y >= memo.y) {
            memo.y = loc.y + 1;
         }

         if (loc.x >= memo.x) {
            memo.x = loc.x + 1;
         }

         return memo;
      }, { x: 0, y: 0, map: [] as ISpriteComponent[][][] });

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

      this._sprites = [];
      this._camera = { ...camera };
      this._mapSize = { x: mapData.x, y: mapData.y };

      for (let y = 0; y < this._mapSize.y; y++) {
         this._sprites.push([]);

         for (let x = 0; x < this._mapSize.x; x++) {
            this._sprites[y][x] = mapData.map[y][x].reduce((memo: ISpriteComponent | undefined, sprite) => {
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

      this._canvas.width = this._container.clientWidth * dpr; // eslint-disable-line id-denylist
      this._canvas.height = this._container.clientHeight * dpr; // eslint-disable-line id-denylist
      this._canvas.style.width = `${this._container.clientWidth}px`; // eslint-disable-line id-denylist
      this._canvas.style.height = `${this._container.clientHeight}px`; // eslint-disable-line id-denylist

      const tileMarginX = Math.ceil((Math.ceil(this._canvas.width / tileSize) - this._camera.viewportWidth) / 2),
            tileMarginY = Math.ceil((Math.ceil(this._canvas.height / tileSize) - this._camera.viewportHeight) / 2),
            visibleTilesX = this._camera.viewportWidth + tileMarginX * 2,
            visibleTilesY = this._camera.viewportHeight + tileMarginY * 2,
            renderX = Math.round((this._canvas.width - tileSize * visibleTilesX) / 2),
            renderY = Math.round((this._canvas.height - tileSize * visibleTilesY) / 2),
            tileOffsetX = Math.max(-2, Math.min(this._camera.x - tileMarginX, this._mapSize.x - visibleTilesX + 2)),
            tileOffsetY = Math.max(-2, Math.min(this._camera.y - tileMarginY, this._mapSize.y - visibleTilesY + 2));

      for (let y = 0; y < visibleTilesY; y++) {
         for (let x = 0; x < visibleTilesX; x++) {
            const spriteX = x + tileOffsetX,
                  spriteY = y + tileOffsetY,
                  sprite = this._sprites[spriteY] ? this._sprites[spriteY][spriteX] : undefined,
                  isOutOfBounds = spriteX < 0 || spriteY < 0 || spriteX >= this._mapSize.x || spriteY >= this._mapSize.y;

            if (!sprite) {
               ctx.fillStyle = isOutOfBounds ? Color.FogMap : Color.DefaultBG;
               ctx.fillRect(renderX + x * tileSize, renderY + y * tileSize, tileSize, tileSize);

               if (!isOutOfBounds) {
                  ctx.textBaseline = 'middle';
                  ctx.textAlign = 'center';
                  ctx.fillStyle = Color.Fog;
                  ctx.font = `${tileSize * 1.2}px ${CHARACTER_FONT_STACK}`;
                  ctx.fillText(
                     '≋',
                     renderX + x * tileSize + tileSize / 2,
                     renderY + y * tileSize + tileSize / 2
                  );
               }
               continue;
            }

            ctx.fillStyle = sprite.bg ?? Color.DefaultBG;
            ctx.fillRect(renderX + x * tileSize, renderY + y * tileSize, tileSize, tileSize);

            ctx.fillStyle = sprite.tint ?? Color.Default;

            ctx.save();
            if (sprite.sprite === Sprite.Player) {
               ctx.fillStyle = Color.PlayerSail;
               ctx.translate(renderX + x * tileSize, renderY + y * tileSize);
               ctx.scale(tileSize / 100, tileSize / 100);
               ctx.translate(50, 50);
               ctx.rotate(sprite.skew);
               ctx.scale(sprite.size.x, sprite.size.y);
               ctx.translate(-50, -50);
               ctx.fill(new Path2D([
                  'M35 8 v59 h59 z',
                  'M10 22 v42 h47 z',
               ].join(' ')));
               ctx.fillStyle = Color.PlayerHull;
               ctx.fill(new Path2D([
                  'M10 68 l26 1 l2 4 h23 l30 -2',
                  'c-1 5, -5 18, -17 20',
                  'h-48',
                  'c-5 -1, -11 -6, -16 -20',
                  'z',
               ].join(' ')));
            } else if ((Object.values(Sprite) as string[]).includes(sprite.sprite)) {
               ctx.textBaseline = 'middle';
               ctx.textAlign = 'center';
               ctx.font = `${tileSize}px ${sprite.font ? sprite.font : CHARACTER_FONT_STACK}`;
               ctx.translate(renderX + x * tileSize + tileSize / 2, renderY + y * tileSize + tileSize / 2);
               ctx.rotate(sprite.skew);
               ctx.scale(sprite.size.x, sprite.size.y);
               ctx.fillText(sprite.sprite, 0, 3);
            } else {
               ctx.translate(renderX + x * tileSize, renderY + y * tileSize);
               ctx.scale(tileSize / 100, tileSize / 100);
               ctx.translate(50, 50);
               ctx.rotate(sprite.skew);
               ctx.scale(sprite.size.x, sprite.size.y);
               ctx.translate(-50, -50);
               ctx.fill(new Path2D(sprite.sprite));
            }
            ctx.restore();
         }
      }
   }

}
