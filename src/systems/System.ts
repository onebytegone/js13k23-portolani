import { WorldState } from '@/lib/WorldState';

export abstract class System {

   public abstract update(delta: number, worldState: WorldState): void;

}
