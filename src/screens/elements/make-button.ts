export function makeButton(text: string, onClick: () => void): HTMLElement {
   const button = document.createElement('button');

   button.innerText = text;

   button.onclick = onClick;

   return button;
}
