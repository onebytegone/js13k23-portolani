import { ComponentID, ScreenRenderFn } from '@/shared-types';
import { WorldState } from '@/lib/WorldState';
import { FogLevel } from '@/components/create-fog-component';
import { CHARACTER_FONT_STACK, Color, ISpriteComponent, Sprite, SpriteLayer } from '@/components/create-sprite-component';
import { makeButton } from './elements/make-button';
import { makeIntroScreen } from './IntroScreen';

const TILE_SIZE = 6;

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


      canvas.width = mapData.x * TILE_SIZE;
      canvas.height = mapData.y * TILE_SIZE;
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
               ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
         });
      });

      ctx.fillStyle = Color.PortLineMap;

      stats.portsVisited.slice(1).reduce((src, dest) => {
         bresenhamLine(src.x, src.y, dest.x, dest.y, (x, y) => {
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
         });

         return dest;
      }, stats.portsVisited[0]);


      ctx.fillStyle = '#2A261F';
      ctx.font = `22px ${CHARACTER_FONT_STACK}`;

      const mapInfo = `#portolani ${worldState.label}`,
            scores = `↟${mapData.tilesDiscovered} ☀︎${Math.floor(stats.day)} ⚓︎${stats.portsVisited.length}`,
            metrics = ctx.measureText(scores),
            textY = mapData.y * TILE_SIZE - metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      ctx.fillText(mapInfo, TILE_SIZE * 2, textY);
      ctx.fillText(scores, mapData.x * TILE_SIZE - metrics.width - TILE_SIZE * 2, textY);

      const shareRow = document.createElement('div'),
            downloadLink = document.createElement('a');

      shareRow.className = 'share';

      downloadLink.className = 'button';
      downloadLink.innerText = 'Download Map';
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.download = `portolani-${worldState.label}.png`;
      shareRow.appendChild(downloadLink);

      if (window.ClipboardItem) {
         shareRow.appendChild(makeButton('Copy Map', () => {
            canvas.toBlob(async (blob) => {
               if (!blob) {
                  return;
               }

               await navigator.clipboard.write([
                  new ClipboardItem({
                     'image/png': blob,
                  }),
               ]);
               alert('Map copied to clipboard!');
           });
         }));
      }

      shareRow.appendChild(makeButton('Copy Stats', async () => {
         await navigator.clipboard.writeText(`${mapInfo}\n${scores}`);
         alert('Stats copied to clipboard!');
      }));

      el.appendChild(shareRow);

      el.appendChild(makeButton('Main Menu', () => {
         renderScreen(makeIntroScreen());
      }));
   };
}
