export const LOCAL_STORAGE_NAMESPACE = 'portolani';

export const LocalStorageKey = {
   LastPlayed: 'lp',
};

function makeKey(key: string): string {
   return `${LOCAL_STORAGE_NAMESPACE}:${key}`;
}

export function getItem(key: string, fallback?: any): any {
   const value = localStorage.getItem(makeKey(key));

   return value ? JSON.parse(value) : fallback;
}

export function putItem(key: string, value: any): void {
   localStorage.setItem(makeKey(key), JSON.stringify(value));
}

export function removeItem(key: string): void {
   localStorage.removeItem(makeKey(key));
}
