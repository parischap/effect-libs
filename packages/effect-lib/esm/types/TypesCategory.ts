/**
 * Enum classifying JavaScript values into ten runtime categories, plus a {@link fromValue}
 * constructor and per-category predicates.
 *
 * ## Mental model
 *
 * - **`Type`** has 10 cases: `String`, `Number`, `Bigint`, `Boolean`, `Symbol`, `Null`,
 *   `Undefined`, `Record`, `Array`, `Function`.
 * - `Record` is the computer-science meaning (a string-keyed object), **not** the TypeScript
 *   `Record<K, V>` utility — arrays and functions get their own categories despite being objects
 *   at the JS level.
 * - {@link fromValue} normalizes any JavaScript value to one of these categories;
 *   {@link isPrimitive} / {@link isNonPrimitive} group the categories accordingly.
 *
 * ## Common tasks
 *
 * - **Classify a value**: {@link fromValue}
 * - **Group test**: {@link isPrimitive}, {@link isNonPrimitive}
 * - **Per-category test**: {@link isString}, {@link isNumber}, {@link isBigint},
 *   {@link isBoolean}, {@link isSymbol}, {@link isNull}, {@link isUndefined},
 *   {@link isFunction}, {@link isArray}, {@link isRecord}
 *
 * ## Quickstart
 *
 * **Example** (Classify and dispatch on category)
 *
 * ```ts
 * import * as MTypesCategory from '@parischap/effect-lib/types/TypesCategory';
 *
 * console.log(MTypesCategory.fromValue('hi') === MTypesCategory.Type.String); // true
 * console.log(MTypesCategory.isNonPrimitive(MTypesCategory.fromValue([1, 2]))); // true
 * ```
 */

import * as Array from 'effect/Array';
import * as Function from 'effect/Function';
import * as Predicate from 'effect/Predicate';

/**
 * Enum of JavaScript runtime categories.
 *
 * @category Models
 */
export enum Type {
  String = 0,
  Number = 1,
  Bigint = 2,
  Boolean = 3,
  Symbol = 4,
  Null = 5,
  Undefined = 6,
  // Record is to be understood in its computer science usual meaning, so a list of values identified by a key. Not to be confused with a Typescript Record that also includes arrays and functions.
  Record = 7,
  Array = 8,
  Function = 9,
}

/**
 * Builds the category of `u`.
 *
 * - Returns the matching {@link Type} variant for any JavaScript value.
 * - `null` and arrays each get their own category, even though `typeof` reports them as
 *   `'object'`.
 *
 * @category Constructors
 */
export const fromValue = (u: unknown): Type => {
  switch (typeof u) {
    case 'string': {
      return Type.String;
    }
    case 'number': {
      return Type.Number;
    }
    case 'bigint': {
      return Type.Bigint;
    }
    case 'boolean': {
      return Type.Boolean;
    }
    case 'symbol': {
      return Type.Symbol;
    }
    case 'undefined': {
      return Type.Undefined;
    }
    case 'function': {
      return Type.Function;
    }
    case 'object': {
      return u === null ? Type.Null : Array.isArray(u) ? Type.Array : Type.Record;
    }
    default: {
      return Function.absurd(u as never);
    }
  }
};

/**
 * Returns `true` if `self` represents a non-primitive. `false` otherwise
 *
 * @category Predicates
 */
export const isNonPrimitive: Predicate.Predicate<Type> = (self) =>
  self === Type.Record || self === Type.Array || self === Type.Function;

/**
 * Returns `true` if `self` represents a primitive. `false` otherwise
 *
 * @category Predicates
 */
export const isPrimitive: Predicate.Predicate<Type> = Predicate.not(isNonPrimitive);

/**
 * Returns `true` if `self` represents a string. `false` otherwise
 *
 * @category Predicates
 */
export const isString: Predicate.Predicate<Type> = (self) => self === Type.String;

/**
 * Returns `true` if `self` represents a number. `false` otherwise
 *
 * @category Predicates
 */
export const isNumber: Predicate.Predicate<Type> = (self) => self === Type.Number;

/**
 * Returns `true` if `self` represents a bigint. `false` otherwise
 *
 * @category Predicates
 */
export const isBigint: Predicate.Predicate<Type> = (self) => self === Type.Bigint;

/**
 * Returns `true` if `self` represents a boolean. `false` otherwise
 *
 * @category Predicates
 */
export const isBoolean: Predicate.Predicate<Type> = (self) => self === Type.Boolean;

/**
 * Returns `true` if `self` represents a symbol. `false` otherwise
 *
 * @category Predicates
 */
export const isSymbol: Predicate.Predicate<Type> = (self) => self === Type.Symbol;

/**
 * Returns `true` if `self` is undefined. `false` otherwise
 *
 * @category Predicates
 */
export const isUndefined: Predicate.Predicate<Type> = (self) => self === Type.Undefined;

/**
 * Returns `true` if `self` is null. `false` otherwise
 *
 * @category Predicates
 */
export const isNull: Predicate.Predicate<Type> = (self) => self === Type.Null;

/**
 * Returns `true` if `self` represents a function. `false` otherwise
 *
 * @category Predicates
 */
export const isFunction: Predicate.Predicate<Type> = (self) => self === Type.Function;

/**
 * Returns `true` if `self` represents an array. `false` otherwise
 *
 * @category Predicates
 */
export const isArray: Predicate.Predicate<Type> = (self) => self === Type.Array;

/**
 * Returns `true` if `self` represents a record. `false` otherwise
 *
 * @category Predicates
 */
export const isRecord: Predicate.Predicate<Type> = (self) => self === Type.Record;
