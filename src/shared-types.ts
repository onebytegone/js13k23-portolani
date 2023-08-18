import { ICameraComponent } from './components/create-camera-component';
import { IFogComponent } from './components/create-fog-component';
import { IMovementComponent } from './components/create-movement-component';
import { ISpriteComponent } from './components/create-sprite-component';
import { ITagComponent } from './components/create-tag-component';
import { ITerrainComponent } from './components/create-terrain-component';

declare const __nominal__type: unique symbol;
export type Nominal<Type, Identifier> = Type & {
  readonly [__nominal__type]: Identifier;
};

export type ValueOf<T> = T[keyof T];

export type EntityID = Nominal<number, 'EntityID'>;

// NOTE: Using a const and a separate type since TS and Google Closure don't play nicely
// together. If using an enum, referencing `ComponentID.Input` results in "WARNING -
// [JSC_INEXISTENT_PROPERTY] Property Input never defined on ComponentID". While
// `ComponentID['Input']`, resolves the warning, the enum JS is still fairly large (with 5
// components, using enums is about 225 bytes larger than the const approach).
// https://github.com/microsoft/TypeScript/issues/2655
export const ComponentID = {
   Position: 0,
   Movement: 1,
   Input: 2,
   Sprite: 3,
   Terrain: 4,
   Camera: 5,
   Fog: 6,
} as const;

export type ComponentIDEnum = ValueOf<typeof ComponentID>;

export interface Vector2D {
   x: number;
   y: number;
}

export interface ComponentMap extends Record<ComponentIDEnum, unknown> {
   [ComponentID.Position]: Vector2D;
   [ComponentID.Movement]: IMovementComponent;
   [ComponentID.Input]: ITagComponent;
   [ComponentID.Sprite]: ISpriteComponent;
   [ComponentID.Terrain]: ITerrainComponent;
   [ComponentID.Camera]: ICameraComponent;
   [ComponentID.Fog]: IFogComponent;
}

export type ComponentRegistration<T extends ComponentIDEnum> =  { [K in T]: ComponentMap[T] };
