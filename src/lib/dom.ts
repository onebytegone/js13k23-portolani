export function createEl(tagName: string, params: { className?: string, childElements?: HTMLElement[]  } = {}): HTMLElement {
   const el = document.createElement(tagName);

   if (params.className) {
      el.className = params.className;
   }

   (params.childElements || []).forEach((child) => {
      el.appendChild(child);
   });

   return el;
}

export function loadHTML(html: string): HTMLElement {
   const el = document.createElement('div');

   el.innerHTML = html;

   return el.firstChild as HTMLElement;
}
