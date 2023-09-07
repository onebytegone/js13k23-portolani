import { ComponentID, ComponentIDEnum, ComponentMap, EntityID, Vector2D } from '@/shared-types';
import { getComponentIDsFromMask, getMaskForComponentIDs, removeComponentIDFromMask } from './component-id-mask';

export function makeEntityID(id: string): EntityID {
   return Number(id) as EntityID;
}

export function anyEntity<T>(entities: { [s: string]: T }): T {
   return Object.values(entities)[0];
}

export class WorldState {

   private _entities: number[] = [];
   private _entitiesByComponentMask: Record<number, number[]> = {};
   private _components: Record<number, Record<number, any>> = {}; // TODO: better types

   constructor(public readonly label: string, public readonly date?: string) {}

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

   public destroyEntity(entityID: EntityID): void {
      const componentMask = this._entities[entityID];

      this._entitiesByComponentMask[componentMask] = this._entitiesByComponentMask[componentMask].filter((e) => {
         return e !== entityID;
      });

      delete this._entities[entityID];

      getComponentIDsFromMask(componentMask).forEach((componentID) => {
         delete this._components[componentID][entityID];
      });
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

      if (!this._entitiesByComponentMask[newComponentMask]) {
         this._entitiesByComponentMask[newComponentMask] = [];
      }
      this._entitiesByComponentMask[newComponentMask].push(entityID);
   }

   public getEntityIDs(componentIDs: readonly ComponentIDEnum[]): EntityID[] {
      const requestedMask = getMaskForComponentIDs(componentIDs);

      return Object.entries(this._entitiesByComponentMask).reduce((memo, [ entityMask, entityIDs ]) => {
         if ((requestedMask & Number(entityMask)) === requestedMask) {
            memo.push(...entityIDs);
         }

         return memo;
      }, [] as number[]) as EntityID[];
   }

   public getEntityIDsAtLocation(location: Vector2D, componentIDs: readonly ComponentIDEnum[] = []): EntityID[] {
      // TODO: This is really inefficient. Likely, a grid data structure, at minimum,
      // would be better.
      return this.getEntityIDs([ ComponentID.Position, ...componentIDs ]).filter((entityID) => {
         const [ loc ] = this.getComponents(entityID, [ ComponentID.Position ]);

         return loc && location.x === loc.x && location.y === loc.y;
      });
   }

   public getEntities<T extends readonly ComponentIDEnum[]>(componentIDs: T): Record<EntityID, { [K in keyof T]: ComponentMap[T[K]] }> {
      return this.getEntityIDs(componentIDs).reduce((memo, entityID) => {
         memo[entityID] = this.getComponents(entityID, componentIDs);

         return memo;
      }, {} as any); // TODO: types
   }

   public getEntitiesAtLocation<T extends readonly ComponentIDEnum[]>(location: Vector2D, componentIDs: T): Record<EntityID, { [K in keyof T]: ComponentMap[T[K]] }> {
      return this.getEntityIDsAtLocation(location, componentIDs).reduce((memo, entityID) => {
         memo[entityID] = this.getComponents(entityID, componentIDs);

         return memo;
      }, {} as any); // TODO: types
   }

   public getEntitiesAdjacentToLocation(location: Vector2D, componentIDs: readonly ComponentIDEnum[] = []): EntityID[][][] {
      const map: EntityID[][][] = [];

      for (let y = -1; y <= 1; y++) {
         map[y] = [];

         for (let x = -1; x <= 1; x++) {
            if (x === 0 && y === 0) {
               continue;
            }

            map[y][x] = this.getEntityIDsAtLocation({ x: location.x + x, y: location.y + y }, componentIDs);
         }
      }

      return map;
   }

   public getComponents<T extends readonly ComponentIDEnum[]>(entityID: EntityID, componentIDs: T): { [K in keyof T]?: ComponentMap[T[K]] } {
      return componentIDs.map((componentID) => {
         return (this._components[componentID] || [])[entityID];
      }) as any; // TODO: better types
   }

   public doesEntityHaveComponent(entityID: EntityID, componentID: ComponentIDEnum): boolean {
      return !!this._components[Number(componentID)][entityID];
   }

}
