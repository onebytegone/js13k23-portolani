export function createEl(tagName: string, params: { className?: string; innerHTML?: string; innerText?: string; title?: string; childElements?: HTMLElement[] } = {}): HTMLElement {
   const el = document.createElement(tagName);

   if (params.className) {
      el.className = params.className;
   }

   if (params.innerText) {
      el.innerText = params.innerText;
   }

   if (params.innerHTML) {
      el.innerHTML = params.innerHTML;
   }

   if (params.title) {
      el.title = params.title;
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
