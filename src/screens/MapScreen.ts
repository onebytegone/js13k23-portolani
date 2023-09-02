import { ComponentID, ScreenRenderFn } from '@/shared-types';
import { WorldState } from '@/lib/WorldState';
import { FogLevel } from '@/components/create-fog-component';
import { CHARACTER_FONT_STACK, Color, ISpriteComponent, Sprite, SpriteLayer } from '@/components/create-sprite-component';
import { makeButton } from './elements/make-button';
import { makeIntroScreen } from './IntroScreen';
import { createEl } from '@/lib/dom';

const TARGET_WIDTH = 900,
      TEXT_INSET = 20;

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

export function makeMapScreen(worldState: WorldState, endCondition: string): ScreenRenderFn {
   return (el, renderScreen) => {
      const canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d')!,
            playerEntityID = worldState.getEntities([ ComponentID.Stats ])[0],
            [ stats ] = worldState.getComponents(playerEntityID, [ ComponentID.Stats ] as const),
            map: ISpriteComponent[][][] = [];

      el.className = 'map';

      el.appendChild(createEl('h1', { innerText: 'Voyage Complete' }));
      el.appendChild(createEl('div', { className: 'subtitle', innerText: endCondition }));
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

      const tileSize = Math.round(TARGET_WIDTH / mapData.x);

      canvas.width = mapData.x * tileSize; // eslint-disable-line id-denylist
      canvas.height = mapData.y * tileSize; // eslint-disable-line id-denylist
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
               ctx.fillStyle = Color.FogMap;
               ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
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


      ctx.fillStyle = Color.Default;
      ctx.font = `28px ${CHARACTER_FONT_STACK}`;

      const mapInfo = `#portolani ${worldState.label}`,
            scores = `↟${mapData.tilesDiscovered} ☀︎${Math.floor(stats.day)} ⚓︎${stats.portsVisited.length}`,
            metrics = ctx.measureText(scores),
            textY = canvas.height - metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      ctx.fillText(mapInfo, TEXT_INSET, textY);
      ctx.fillText(scores, canvas.width - metrics.width - TEXT_INSET, textY);

      const shareRow = document.createElement('div'),
            downloadLink = document.createElement('a');

      shareRow.className = 'share';

      downloadLink.className = 'button';
      downloadLink.innerText = 'Download Map';
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.download = `portolani-${worldState.label}.png`;
      shareRow.appendChild(downloadLink);

      if (window.ClipboardItem) {
         shareRow.appendChild(makeButton('Copy Map', async () => {
            await navigator.clipboard.write([
               new ClipboardItem({
                  'image/png': new Promise((resolve, reject) => {
                     canvas.toBlob(async (blob) => {
                        if (blob) {
                           resolve(blob);
                           return;
                        }
                        reject();
                    });
                  }),
               }),
            ]);
            alert('Map copied to clipboard');
         }));
      }

      shareRow.appendChild(makeButton('Copy Stats', async () => {
         await navigator.clipboard.writeText(`${mapInfo}\n${scores}`);
         alert('Stats copied to clipboard');
      }));

      el.appendChild(shareRow);

      el.appendChild(makeButton('Main Menu', () => {
         renderScreen(makeIntroScreen());
      }));
   };
}
