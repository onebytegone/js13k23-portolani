import { HEADING_SPRITES } from '@/components/create-heading-component';
import { makeButton } from './make-button';
import { Heading, HeadingEnum } from '@/lib/math';

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

const headingToKey = {
   [Heading.NW]: 'q',
   [Heading.N]: 'w',
   [Heading.NE]: 'e',
   [Heading.W]: 'a',
   [Heading.E]: 'd',
   [Heading.SW]: 'z',
   [Heading.S]: 'x',
   [Heading.SE]: 'c',
};

export function makeControls(onInput: (heading: HeadingEnum) => void, controlCenterEl?: HTMLElement): HTMLElement {
   const grid = document.createElement('div');

   grid.className = 'c7';

   buttons.forEach((heading) => {
      if (heading === undefined) {
         grid.appendChild(controlCenterEl ?? document.createElement('div'));
      } else {
         const button = makeButton(HEADING_SPRITES[heading], () =>{
            onInput(heading);
         });

         button.title = headingToKey[heading];
         grid.appendChild(button);
      }
   });

   return grid;
}
