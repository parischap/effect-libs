/**
 * Foundational primitive / container types used throughout `effect-lib`.
 *
 * ## Mental model
 *
 * - **Containers**: `NonPrimitive`, `Object`, `Pair`, `Singleton`, `OverOne` (non-empty), `OverTwo`
 *   (≥ 2 elements), and their readonly variants — typed views over `Array`/`ReadonlyArray` used by
 *   the rest of the package.
 * - **Primitives**: `Primitive`, `NonNullablePrimitive`, `Unknown` — describe the shape space of
 *   JavaScript values.
 * - **All values type union**: `Unknown` — same as `unknown` but defined as a type union, allows
 *   pattern matching.
 * - **Function shapes**: `AnyFunction`, `OneArgFunction`, `StringTransformer`, `NumberFromString`.
 * - **Predicate / refinement shapes**: `AnyPredicate`, `AnyRefinement`, `RefinementFrom`.
 * - **Type-level utilities**: `Data` strips inherited / pipeable / equality fields off an object type
 *   to produce its plain-data view (used by class constructors); `Proto` is its complement;
 *   `Tuple<T, N>` materializes a fixed-size tuple; `IntersectAndSimplify` and `ToKeyIntersection`
 *   help build intersections in conditional types.
 *
 * Runtime guards for these shapes live in `MPredicate`.
 *
 * ## Common tasks
 *
 * - **Tuple / array shapes**: {@link Pair}, {@link Singleton}, {@link OverOne}, {@link OverTwo}
 * - **Primitive shapes**: {@link Primitive}, {@link NonNullablePrimitive}, {@link NonPrimitive},
 *   {@link Unknown}
 * - **Type-level helpers**: {@link Data}, {@link Proto}, {@link Tuple}, {@link ReadonlyTuple},
 *   {@link MapToTarget}, {@link IntersectAndSimplify}, {@link ToKeyIntersection},
 *   {@link WithMutable}, {@link WithRequired}
 */

import type * as Equal from 'effect/Equal';
import type * as Hash from 'effect/Hash';
import type * as Predicate from 'effect/Predicate';

/**
 * Type that represents a real object, not an array, not a function, not null. However, this type
 * does not represent a class instance. So prefer using NonPrimitive when class instances are
 * important (even though this type includes functions and arrays which may not be desirable)
 *
 * @category Models
 */
export interface Object {
  [x: PropertyKey]: unknown;
}

/**
 * Same as Object but readonly
 *
 * @category Models
 */
export interface ReadonlyObject {
  readonly [x: PropertyKey]: unknown;
}

/**
 * Type that represents anything but a JavaScript primitive. It includes records (in their usual
 * computer science meaning), class instances, arrays, and functions but not null or undefined.
 * Equivalent to the Effect ObjectKeyword type. Should be defined as an alias to the `object` type
 * but the object type cannot be indexed so this definition is better
 *
 * @category Models
 */
export interface NonPrimitive {
  // DO NOT REPLACE any by unknown: in that case, arrays and functions are excluded.
  [key: PropertyKey]: any;
}

/**
 * Same as NonPrimitive but readonly
 *
 * @category Models
 */
export interface ReadonlyNonPrimitive {
  // DO NOT REPLACE any by unknown: in that case, arrays and functions are excluded.
  readonly [key: PropertyKey]: any;
}

/**
 * Type that represents an array
 *
 * @category Models
 */
export interface AnyArray extends Array<any> {}

/**
 * Type that represents a ReadonlyArray
 *
 * @category Models
 */
export interface AnyReadonlyArray extends ReadonlyArray<any> {}

/**
 * Type that represents an empty array or tuple
 *
 * @category Models
 */
export type EmptyArray = [];

/**
 * Type that represents an empty array or tuple
 *
 * @category Models
 */
export type EmptyReadonlyArray = readonly [];

/**
 * Type that represents a tuple or array with one element
 *
 * @category Models
 */
export type Singleton<A> = [A];

/**
 * Type that represents a tuple or array with one element
 *
 * @category Models
 */
export type ReadonlySingleton<A> = readonly [A];

/**
 * Type that represents a tuple or array with two elements
 *
 * @category Models
 */
export type Pair<A, B> = [A, B];

/**
 * Type that represents a tuple or array with two elements
 *
 * @category Models
 */
export type ReadonlyPair<A, B> = readonly [A, B];

/**
 * Type that represents a non empty array
 *
 * @category Models
 */
export type OverOne<A> = [A, ...Array<A>];

/**
 * Type that represents a non empty array
 *
 * @category Models
 */
export type ReadonlyOverOne<A> = readonly [A, ...ReadonlyArray<A>];

/**
 * Type that represents an array with at least two elements
 *
 * @category Models
 */
export type OverTwo<A> = [A, A, ...Array<A>];

/**
 * Type that represents an array with at least two elements
 *
 * @category Models
 */
export type ReadonlyOverTwo<A> = readonly [A, A, ...ReadonlyArray<A>];

/**
 * Type that represents a function
 *
 * @category Models
 */
export interface AnyFunction {
  (...args: ReadonlyArray<any>): any;
}

/**
 * Type that represents a function with one argument
 *
 * @category Models
 */
export interface OneArgFunction<in A, out B = A> {
  (a: A): B;
}

/**
 * Type that represents a primitive except `null` and `undefined`
 *
 * @category Models
 */
export type NonNullablePrimitive = string | number | bigint | boolean | symbol;

/**
 * Type that represents a primitive
 *
 * @category Models
 */
export type Primitive = NonNullablePrimitive | null | undefined;

/**
 * Type that represents all possible Javascript values but not all possible Typescript types (it
 * does not represent Branded types for instance)
 *
 * @category Models
 */
export type Unknown = Primitive | NonPrimitive;

/**
 * Same as `Unknown` but readonly
 *
 * @category Models
 */
export type ReadonlyUnknown = Primitive | ReadonlyNonPrimitive;

/**
 * Type that represents any predicate or refinement
 *
 * @category Models
 */
export type AnyPredicate = Predicate.Predicate.Any;

/**
 * Type that represents any refinement
 *
 * @category Models
 */
export type AnyRefinement = Predicate.Refinement.Any;

/**
 * Type that represents any refinement from a given type
 *
 * @category Models
 */
export type RefinementFrom<Source> = Predicate.Refinement<Source, any>;

/**
 * Type of a string transformer, i.e. a function that transforms a string into another one
 *
 * @category Models
 */
export interface StringTransformer extends OneArgFunction<string> {}

/**
 * Type that represents a function that transforms a string into a number.
 *
 * @category Models
 */
export interface NumberFromString extends OneArgFunction<string, number> {}

/**
 * Utility type that removes all non-data. An Optionals parameter can be passed with a list of
 * fields to make optional
 *
 * @category Utility types
 */
export type Data<T extends NonPrimitive, Optionals extends string = never> = {
  [k in keyof T as [k] extends [
    | symbol
    | `_${string}`
    | 'toString'
    | 'toJSON'
    | 'pipe'
    | typeof Equal.symbol
    | typeof Hash.symbol
    | Optionals,
  ]
    ? never
    : k]: T[k];
} & { [k in keyof T as [k] extends [Optionals] ? k : never]?: T[k] };

/**
 * Utility type that removes all data from a type.
 *
 * @category Utility types
 */
export type Proto<T extends NonPrimitive> = Omit<T, keyof Data<T>>;

/**
 * Utility type that makes field `field` of target type `X` mutable
 *
 * @category Utility types
 */
export type WithMutable<X, field extends string | symbol> = {
  readonly [k in keyof X as [k] extends [field] ? never : k]: X[k];
} & {
  -readonly [k in keyof X as [k] extends readonly [field] ? k : never]: X[k];
};

/**
 * Utility type that makes field `field` of target type `X` required
 *
 * @category Utility types
 */
export type WithRequired<X, field extends string | symbol> = {
  readonly [k in keyof X as readonly [k] extends readonly [field] ? never : k]: X[k];
} & {
  readonly [k in keyof X as readonly [k] extends readonly [field] ? k : never]-?: X[k];
};

/**
 * Utility type that generates a tuple of `N` `T`'s
 *
 * @category Utility types
 */
export type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? Array<T>
    : _TupleOf<T, N, []>
  : never;
type _TupleOf<T, N extends number, R extends Array<unknown>> = R['length'] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

/**
 * Utility type that generates a readonly tuple of `N` `T`'s
 *
 * @category Utility types
 */
export type ReadonlyTuple<T, N extends number> = Readonly<Tuple<T, N>>;

/**
 * Utility type that generates a range of numeric literal types
 *
 * @category Utility types
 */
/*export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
type Enumerate<N extends number, Acc extends Array<number> = []> =
  [Acc['length']] extends [N] ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>;*/

/**
 * Utility type that extracts all elements of a tuple but the first
 *
 * @category Utility types
 */
/*export type ReadonlyTail<T> =
  [T] extends [[any, ...infer R]] ? { [key in keyof R]: R[key] } : never;*/

/**
 * Utility type that changes the types of all keys of a tuple, array, struct or record to Target
 *
 * @category Utility types
 */
export type MapToTarget<T, Target> = {
  [k in keyof T]: Target;
};

/**
 * Utility type that changes the type of the unique parameter of `F` to `A` if `F` is a Refinement
 * or a OneArgFunction. Returns `F` otherwise
 *
 * @category Utility types
 */
/*export type SetArgTypeTo<F, A> =
  [F] extends [Predicate.Refinement<infer _, infer R>] ?
    [R] extends [A] ?
      Predicate.Refinement<A, R>
    : F
  : [F] extends [OneArgFunction<infer _, infer R>] ? OneArgFunction<A, R>
  : F;*/

/**
 * Utility type that creates an intersection of the types all keys of a type. Meant to be used with
 * Tuples even though not set as a constraint
 *
 * @category Utility types
 */
export type ToKeyIntersection<T> = [
  {
    readonly [K in keyof T]: (x: T[K]) => void;
  },
] extends [
  {
    readonly [K: number]: (x: infer I) => void;
  },
]
  ? I
  : never;

/**
 * Utility type that creates an intersection and simplifies it which Typescript does not do by
 * itself (see https://stackoverflow.com/questions/72395823/why-does-typescript-not-simplify-the-
 * intersection-of-a-type-and-one-of-its-super)
 *
 * @category Utility types
 */

export type IntersectAndSimplify<T, U> = [T] extends [U] ? T : [U] extends [T] ? U : T & U;
