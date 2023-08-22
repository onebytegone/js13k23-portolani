import { ComponentID, ComponentIDEnum, ComponentMap, EntityID, Vector2D } from '@/shared-types';
import { getMaskForComponentIDs, removeComponentIDFromMask } from './component-id-mask';

export class WorldState {

   private _entities: number[] = [];
   private _entitiesByComponentMask: Record<number, number[]> = {};
   private _components: Record<number, Record<number, any>> = {}; // TODO: better types

   public createEntity(components: Partial<ComponentMap>): EntityID {
      const entityID = this._entities.length as EntityID,
            componentMask = getMaskForComponentIDs(Object.keys(components) as any);

      this._entities[entityID] = componentMask;

      if (!this._entitiesByComponentMask[componentMask]) {
         this._entitiesByComponentMask[componentMask] = [];
      }
      this._entitiesByComponentMask[componentMask].push(entityID);

      Object.entries(components).forEach(([ componentID, component ]) => {
         if (!this._components[Number(componentID)]) {
            this._components[Number(componentID)] = {};
         }

         this._components[Number(componentID)][entityID] = component;
      });

      return entityID;
   }

   // TODO: add components to entity

   public removeComponentFromEntity(entityID: EntityID, componentID: ComponentIDEnum): void {
      const componentMask = this._entities[entityID],
            newComponentMask = removeComponentIDFromMask(componentMask, componentID);

      this._entitiesByComponentMask[componentMask] = this._entitiesByComponentMask[componentMask].filter((e) => {
         return e !== entityID;
      });

      delete this._components[Number(componentID)][entityID];
      this._entities[entityID] = newComponentMask;
      this._entitiesByComponentMask[newComponentMask].push(entityID);
   }

   public getEntities(componentIDs: readonly ComponentIDEnum[]): EntityID[] {
      const requestedMask = getMaskForComponentIDs(componentIDs);

      return Object.entries(this._entitiesByComponentMask).reduce((memo, [ entityMask, entityIDs ]) => {
         if ((requestedMask & Number(entityMask)) === requestedMask) {
            memo.push(...entityIDs);
         }

         return memo;
      }, [] as number[]) as EntityID[];
   }

   public getEntitiesAtLocation(location: Vector2D, componentIDs: readonly ComponentIDEnum[] = []): EntityID[] {
      // TODO: This is really inefficient. Likely, a grid data structure, at minimum,
      // would be better.
      return this.getEntities([ ComponentID.Position, ...componentIDs ]).filter((entityID) => {
         const [ loc ] = this.getComponents(entityID, [ ComponentID.Position ]);

         return location.x === loc.x && location.y === loc.y;
      });
   }

   public getEntitiesAdjacentToLocation(location: Vector2D, componentIDs: readonly ComponentIDEnum[] = []): EntityID[][][] {
      const map: EntityID[][][] = [];

      for (let y = -1; y <= 1; y++) {
         map[y] = [];

         for (let x = -1; x <= 1; x++) {
            if (x === 0 && y === 0) {
               continue;
            }

            map[y][x] = this.getEntitiesAtLocation({ x: location.x + x, y: location.y + y }, componentIDs);
         }
      }

      return map;
   }

   public getComponents<T extends readonly ComponentIDEnum[]>(entityID: EntityID, componentIDs: T): { [K in keyof T]: ComponentMap[T[K]] } {
      return componentIDs.map((componentID) => {
         return (this._components[componentID] || [])[entityID];
      }) as any; // TODO: better types
   }

   public doesEntityHaveComponent(entityID: EntityID, componentID: ComponentIDEnum): boolean {
      return !!this._components[Number(componentID)][entityID];
   }

}
