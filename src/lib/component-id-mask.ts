import { ComponentID, ComponentIDEnum } from '@/shared-types';

export function getMaskForComponentIDs(componentIDs: readonly ComponentIDEnum[]): number {
   return componentIDs.reduce((memo: number, id) => {
      return memo | (1 << id);
   }, 0);
}


export function getComponentIDsFromMask(mask: number): readonly ComponentIDEnum[] {
   return Object.values(ComponentID).filter((id) => {
      return mask & (1 << id);
   });
}

export function removeComponentIDFromMask(mask: number, componentID: ComponentIDEnum): number {
   return mask ^ (1 << componentID);
}
