export function makeButton(text: string, onClick: () => void): HTMLElement {
   const button = document.createElement('button');

   button.innerHTML = text;

   button.onclick = onClick;

   return button;
}
