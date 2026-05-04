/**
 * Extension to the Effect Struct module providing prototype-safe struct merging, field overriding,
 * one-key construction, derived-field enrichment, and a refined `evolve`.
 *
 * ## Mental model
 *
 * - This module operates on plain JavaScript objects (`MTypes.NonPrimitive`) treated as records of
 *   fields.
 * - Compared to the spread operator, the helpers here intentionally **do not copy the prototype**:
 *   the result is always a fresh `Data`-shaped object. This makes the loss of prototype explicit
 *   instead of hidden behind syntax sugar.
 * - Mutating variants ({@link mutableSet}, {@link mutableEnrichWith}) write in place and should be
 *   reserved for hot paths where allocation cost is unacceptable.
 *
 * ## Common tasks
 *
 * - **Merge / append**: {@link prepend}, {@link append}
 * - **Override existing fields**: {@link set}, {@link mutableSet}
 * - **Construct**: {@link make}
 * - **Add derived fields**: {@link enrichWith}, {@link mutableEnrichWith}
 * - **Transform fields**: {@link evolve}
 *
 * ## Quickstart
 *
 * **Example** (Append a field then derive another from `self`)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MStruct from '@parischap/effect-lib/MStruct';
 *
 * const built = pipe(
 *   { firstName: 'Ada' } as const,
 *   MStruct.append({ lastName: 'Lovelace' } as const),
 *   MStruct.enrichWith({ fullName: ({ firstName, lastName }) => `${firstName} ${lastName}` }),
 * );
 * console.log(built); // { firstName: 'Ada', lastName: 'Lovelace', fullName: 'Ada Lovelace' }
 * ```
 */

import { pipe } from 'effect';
import * as Function from 'effect/Function';
import * as Record from 'effect/Record';
import * as Struct from 'effect/Struct';

import type * as MTypes from './types/types.js';

/**
 * Utility type computing the result of `{ ...first, ...second }`.
 *
 * - When a field exists in both `First` and `Second`, the resulting type follows JavaScript's
 *   spread semantics: `Second`'s value wins, except when it is optional, in which case the result
 *   is the union of `Second[k]` (without `undefined`) and `First[k]`.
 *
 * @category Utility types
 */
export type Append<First extends MTypes.NonPrimitive, Second extends MTypes.NonPrimitive> = {
  readonly [k in keyof First | keyof Second]: k extends keyof Second
    ? k extends keyof First
      ? Extract<Second[k], undefined> extends never
        ? Second[k]
        : Exclude<Second[k], undefined> | First[k]
      : Second[k]
    : First[k];
};

/**
 * Builds `{ ...that, ...self }` — fields in `self` override fields in `that`.
 *
 * - Use instead of the spread operator when you want to make explicit that the prototype of the
 *   left-hand side is dropped.
 *
 * **Example** (Self overrides defaults)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MStruct from '@parischap/effect-lib/MStruct';
 *
 * const defaults = { theme: 'light', font: 'serif' } as const;
 * console.log(pipe({ font: 'mono' } as const, MStruct.prepend(defaults)));
 * // { theme: 'light', font: 'mono' }
 * ```
 *
 * @see {@link append} — symmetric variant where the new fields override
 *
 * @category Utils
 */
export const prepend =
  <O1 extends MTypes.NonPrimitive>(that: O1) =>
  <O extends MTypes.NonPrimitive>(self: O): MTypes.Data<Append<O1, O>> => ({
    ...that,
    ...self,
  });

/**
 * Builds `{ ...self, ...that }` — fields in `that` override fields in `self`.
 *
 * - Use instead of the spread operator when you want to make explicit that the prototype of the
 *   left-hand side is dropped.
 *
 * **Example** (New fields override)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MStruct from '@parischap/effect-lib/MStruct';
 *
 * console.log(pipe({ a: 1, b: 2 } as const, MStruct.append({ b: 3, c: 4 } as const)));
 * // { a: 1, b: 3, c: 4 }
 * ```
 *
 * @see {@link prepend} — symmetric variant where existing fields win
 *
 * @category Utils
 */
export const append =
  <O1 extends MTypes.NonPrimitive>(that: O1) =>
  <O extends MTypes.NonPrimitive>(self: O): MTypes.Data<Append<O, O1>> => ({
    ...self,
    ...that,
  });

/**
 * Like {@link append} but `that` may only override fields that already exist in `self`. New keys
 * are rejected at the type level.
 *
 * **Example** (Override only declared fields)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MStruct from '@parischap/effect-lib/MStruct';
 *
 * type User = { readonly name: string; readonly age: number };
 * const user: User = { name: 'Ada', age: 30 };
 * console.log(pipe(user, MStruct.set({ age: 31 }))); // { name: 'Ada', age: 31 }
 * ```
 *
 * @see {@link mutableSet} — in-place variant
 *
 * @category Utils
 */
export const set =
  <O extends MTypes.NonPrimitive, O1 extends Partial<O>>(that: O1) =>
  (self: O): MTypes.Data<Omit<O, keyof O1> & O1> => ({
    ...self,
    ...that,
  });

/**
 * Same as {@link set} but writes the new fields into `self` in place using `Object.assign`.
 *
 * - Use only when allocation cost matters and `self` is not shared.
 *
 * @category Utils
 */
export const mutableSet =
  <O extends MTypes.NonPrimitive, O1 extends Partial<O>>(that: O1) =>
  (self: O): Omit<O, keyof O1> & O1 =>
    Object.assign(self, that);

/**
 * Builds a single-field struct `{ [key]: value }`.
 *
 * **Example** (Single-key constructor)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MStruct from '@parischap/effect-lib/MStruct';
 *
 * console.log(pipe(42, MStruct.make('answer'))); // { answer: 42 }
 * ```
 *
 * @category Constructors
 */
export const make =
  <K extends string | symbol>(key: K) =>
  <V>(value: V): { readonly [key in K]: V } =>
    ({ [key]: value }) as never;

/**
 * Computes a record of new fields where each value is `f(self)` for the corresponding key, then
 * appends them to `self`.
 *
 * - Use when several derived fields all depend on the same source struct.
 * - Existing fields with the same key are overwritten.
 *
 * **Example** (Adding derived fields)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MStruct from '@parischap/effect-lib/MStruct';
 *
 * console.log(
 *   pipe(
 *     { firstName: 'Ada', lastName: 'Lovelace' } as const,
 *     MStruct.enrichWith({
 *       fullName: ({ firstName, lastName }) => `${firstName} ${lastName}`,
 *       initials: ({ firstName, lastName }) => `${firstName[0]}.${lastName[0]}.`,
 *     }),
 *   ),
 * );
 * // { firstName: 'Ada', lastName: 'Lovelace', fullName: 'Ada Lovelace', initials: 'A.L.' }
 * ```
 *
 * @see {@link mutableEnrichWith} — in-place variant
 *
 * @category Utils
 */

export const enrichWith =
  <
    O extends MTypes.NonPrimitive,
    O1 extends Record.ReadonlyRecord<string, MTypes.OneArgFunction<O, unknown>>,
  >(
    fields: O1,
  ) =>
  (self: O): MTypes.Data<Omit<O, keyof O1> & { readonly [key in keyof O1]: ReturnType<O1[key]> }> =>
    pipe(fields, Record.map(Function.apply(self)), (newValues) => ({ ...self, ...newValues }));

/**
 * Same as {@link enrichWith} but writes the new fields into `self` in place using `Object.assign`.
 *
 * - Use only when allocation cost matters and `self` is not shared.
 *
 * @category Utils
 */

export const mutableEnrichWith =
  <
    O extends MTypes.NonPrimitive,
    O1 extends Record.ReadonlyRecord<string, MTypes.OneArgFunction<O, unknown>>,
  >(
    fields: O1,
  ) =>
  (self: O): Omit<O, keyof O1> & { readonly [key in keyof O1]: ReturnType<O1[key]> } =>
    Object.assign(self, Record.map(fields, Function.apply(self)));

/* eslint-disable */
// Copied from Struct.ts
type Transformed<O, T> = unknown & {
  [K in keyof O]: K extends keyof T
    ? T[K] extends (...a: any) => any
      ? ReturnType<T[K]>
      : O[K]
    : O[K];
};
type PartialTransform<O, T> = {
  [K in keyof T]: T[K] extends (a: O[K & keyof O]) => any ? T[K] : (a: O[K & keyof O]) => unknown;
};
/* eslint-enable */

/**
 * Same as `Struct.evolve` but the return type drops any property carried by the prototype, since
 * those are not copied by spreading. Transformations whose key is missing in `self` are ignored.
 *
 * **Example** (Evolving selected fields)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MStruct from '@parischap/effect-lib/MStruct';
 *
 * console.log(
 *   pipe(
 *     { firstName: 'ada', lastName: 'lovelace' } as const,
 *     MStruct.evolve({ firstName: (s) => s.toUpperCase() }),
 *   ),
 * );
 * // { firstName: 'ADA', lastName: 'lovelace' }
 * ```
 *
 * @category Utils
 */
export const {
  evolve,
}: {
  readonly evolve: {
    <O, T>(t: PartialTransform<O, T>): (obj: O) => MTypes.Data<Transformed<O, T>>;
    <O, T>(obj: O, t: PartialTransform<O, T>): MTypes.Data<Transformed<O, T>>;
  };
} = Struct;
