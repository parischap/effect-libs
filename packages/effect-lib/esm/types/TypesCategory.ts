/** This module implements a type that represents the possible categories of a JavaScript value */

import * as Array from 'effect/Array'
import * as Function from 'effect/Function'
import * as Predicate from 'effect/Predicate'

/**
 * Type of a MTypeCategory
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
 * Constructor
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
      return (
        u === null ? Type.Null
        : Array.isArray(u) ? Type.Array
        : Type.Record
      );
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
