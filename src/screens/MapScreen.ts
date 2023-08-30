import { ComponentID, ScreenRenderFn } from '@/shared-types';
import { WorldState } from '@/lib/WorldState';
import { FogLevel } from '@/components/create-fog-component';
import { Color, ISpriteComponent, Sprite, SpriteLayer } from '@/components/create-sprite-component';
import { makeButton } from './elements/make-button';
import { makeIntroScreen } from './IntroScreen';

function bresenhamLine(x0: number, y0: number, x1: number, y1: number, draw: (x: number, y: number) => void) {
   const dx = Math.abs(x1 - x0),
         sx = x0 < x1 ? 1 : -1,
         dy = Math.abs(y1 - y0),
         sy = y0 < y1 ? 1 : -1;

   let err = (dx > dy ? dx : -dy) / 2;

   while (true) {
      draw(x0, y0);

      if (x0 === x1 && y0 === y1) {
         break;
      }

      const e2 = err;

      if (e2 > -dx) {
         err -= dy;
         x0 += sx;
      }

      if (e2 < dy) {
         err += dx;
         y0 += sy;
      }
   }
}

export function makeMapScreen(worldState: WorldState): ScreenRenderFn {
   return (el, renderScreen) => {
      const title = document.createElement('h2'),
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d')!,
            playerEntityID = worldState.getEntities([ ComponentID.Stats ])[0],
            [ stats ] = worldState.getComponents(playerEntityID, [ ComponentID.Stats ] as const),
            map: ISpriteComponent[][][] = [];

      title.innerText = 'Voyage Complete';
      el.appendChild(title);

      el.appendChild(canvas);

      const mapData = worldState.getEntities([ ComponentID.Position, ComponentID.Sprite ] as const).reduce((memo, entityID) => {
         const [ loc, sprite, fog ] = worldState.getComponents(entityID, [ ComponentID.Position, ComponentID.Sprite, ComponentID.Fog ] as const);

         if (!map[loc.y]) {
            map[loc.y] = [];
         }

         if (!map[loc.y][loc.x]) {
            map[loc.y][loc.x] = [];
         }

         // TODO: Types, `fog` would ideally be possibly undefined
         if (!fog || fog.level === FogLevel.None) {
            map[loc.y][loc.x].push(sprite);
            memo.tilesDiscovered ++;
         }

         if (loc.y >= memo.y) {
            memo.y = loc.y + 1;
         }

         if (loc.x >= memo.x) {
            memo.x = loc.x + 1;
         }

         return memo;
      }, { x: 0, y: 0, tilesDiscovered: 0 });

      const tileSize = 4;

      canvas.width = mapData.x * tileSize;
      canvas.height = mapData.y * tileSize;
      canvas.style.imageRendering = 'pixelated';
      canvas.style.imageRendering = 'crisp-edges';

      ctx.fillStyle = Color.DefaultBG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      map.forEach((row, y) => {
         row.forEach((tiles, x) => {
            const sprite = tiles.reduce((memo: ISpriteComponent | undefined, tile) => {
               if (!memo || (tile.layer > memo.layer && tile.layer < SpriteLayer.Encounter)) {
                  return tile;
               }

               return memo;
            }, undefined);

            if (!sprite) {
               return;
            }

            if ((sprite.layer === SpriteLayer.Land || sprite.layer === SpriteLayer.Port) && sprite.sprite !== Sprite.Land) {
               ctx.fillStyle = Color.CoastMap;
               ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
         });
      });

      ctx.fillStyle = Color.PortLineMap;

      stats.portsVisited.slice(1).reduce((src, dest) => {
         bresenhamLine(src.x, src.y, dest.x, dest.y, (x, y) => {
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
         });

         return dest;
      }, stats.portsVisited[0]);

      const statsSummary = document.createElement('p');

      statsSummary.innerHTML = `#portolani ${worldState.label}<br>`
         + `↟${mapData.tilesDiscovered} ☀︎${stats.day} ⚓︎${stats.portsVisited.length}`;

      el.appendChild(statsSummary);

      const downloadLink = document.createElement('a');

      downloadLink.className = 'button';
      downloadLink.innerText = 'Download Map';
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.download = 'somedata.png';
      el.appendChild(downloadLink);

      el.appendChild(makeButton('Main Menu', () => {
         renderScreen(makeIntroScreen());
      }));
   };
}
