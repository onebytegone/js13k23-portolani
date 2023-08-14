import { WorldState } from '@/lib/WorldState';
import { ComponentIDEnum } from '@/shared-types';

export abstract class System {

   static components: readonly ComponentIDEnum[];

   public abstract update(delta: number, worldState: WorldState): void;

}
