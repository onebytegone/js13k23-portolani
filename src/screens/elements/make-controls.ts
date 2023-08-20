import { HEADING_SPRITES, Heading, HeadingEnum } from '@/components/create-heading-component';
import { makeButton } from './make-button';

const buttons = [
   Heading.NW,
   Heading.N,
   Heading.NE,
   Heading.W,
   undefined,
   Heading.E,
   Heading.SW,
   Heading.S,
   Heading.SE,
];

export function makeControls(onInput: (heading: HeadingEnum) => void): HTMLElement {
   const grid = document.createElement('div');

   grid.className = 'c7';

   buttons.forEach((heading) => {
      if (heading === undefined) {
         grid.appendChild(document.createElement('div'));
      } else {
         const button = makeButton(HEADING_SPRITES[heading], () =>{
            onInput(heading);
         });
         grid.appendChild(button);
      }
   });

   return grid;
}
