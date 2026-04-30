/**
 * This module implements a type that converts a primitive value to its string representation.
 * Typical responsibilities include: surrounding strings in quotes, truncating long strings with an
 * ellipsis, appending `n` to bigints, and formatting numbers with a custom formatter.
 *
 * Use the `make` function to define custom instances if the pre-built ones do not suit your needs.
 */

import { flow, pipe } from 'effect';
import type * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Number from 'effect/Number';
import * as Predicate from 'effect/Predicate';
import * as Result from 'effect/Result';
import * as String from 'effect/String';
import * as Struct from 'effect/Struct';

import * as MData from '@parischap/effect-lib/MData';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MString from '@parischap/effect-lib/MString';
import * as MTypes from '@parischap/effect-lib/MTypes';

import * as PPValue from '../internal/stringification/Value.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/Parameters/PrimitiveFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a `PPPrimitiveFormatter`
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** Id of `this` `PPPrimitiveFormatter` instance. Useful for equality and debugging */
  readonly id: string;

  /**
   * Action of `this` `PPPrimitiveFormatter`. Takes a `PPValue.Primitive` and returns its string
   * representation (e.g. `'hello'` for a string, `42` for a number, `42n` for a bigint)
   */
  readonly action: MTypes.OneArgFunction<PPValue.Primitive, string>;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.id;
    };
  }

  /** Class constructor */
  private constructor({ id, action }: MTypes.Data<Type>) {
    super();
    this.id = id;
    this.action = action;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
  }

  /** Function that implements the equivalence of `this` and `that` */
  [MEquivalenceBasedEqualityData.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  [MEquivalenceBasedEqualityData.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
    return Predicate.hasProperty(that, TypeId);
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Constructor of a `PPPrimitiveFormatter`
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type => Type.make(params);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/**
 * Returns the `id` property of `self`
 *
 * @category Getters
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * Returns the `action` property of `self`
 *
 * @category Getters
 */
export const action: MTypes.OneArgFunction<Type, Type['action']> = Struct.get('action');

/**
 * Constructor that builds a `PPPrimitiveFormatter` instance modelled on `util.inspect`: - Strings
 * are truncated at `maxStringLength` characters (an ellipsis is appended when truncated) and
 * surrounded with `quoteChar`. Pass `maxStringLength = +Infinity` to disable truncation. - Numbers
 * are formatted with `numberFormatter`. - Bigints are formatted with `bigintFormatter` and suffixed
 * with `n`.
 *
 * @category Constructors
 */
export const utilInspectLikeMaker = ({
  id,
  maxStringLength,
  quoteChar,
  numberFormatter,
  bigintFormatter,
}: {
  readonly id: string;
  readonly maxStringLength: number;
  readonly quoteChar: string;
  readonly numberFormatter: MTypes.OneArgFunction<number, string>;
  readonly bigintFormatter: MTypes.OneArgFunction<bigint, string>;
}): Type =>
  make({
    id,
    action: (value) =>
      pipe(
        value,
        PPValue.content,
        MMatch.make,
        MMatch.when(
          MTypes.isString,
          flow(
            Result.liftPredicate(
              flow(String.length, Number.isGreaterThan(maxStringLength)),
              Function.identity,
            ),
            Result.map(flow(String.takeLeft(maxStringLength - 3), MString.append('...'))),
            Result.merge,
            MString.append(quoteChar),
            MString.prepend(quoteChar),
          ),
        ),
        MMatch.when(
          MTypes.isNumber,
          flow((n) => numberFormatter(n)),
        ),
        MMatch.when(
          MTypes.isBigInt,
          flow((n) => bigintFormatter(n), MString.append('n')),
        ),
        MMatch.orElse(MString.fromPrimitive),
      ),
  });

/**
 * `PPPrimitiveFormatter` instance modelled on `util.inspect`: - Strings are truncated at 10 000
 * characters and surrounded with `'`. - Numbers are formatted with `MString.fromNumber(10)` (same
 * output as `Number.prototype.toString()`). - Bigints are formatted with `MString.fromNumber(10)`
 * (same output as `BigInt.prototype.toString()`) and suffixed with `n`.
 *
 * @category Instances
 */
export const utilInspectLike: Type = utilInspectLikeMaker({
  id: 'UtilInspectLike',
  maxStringLength: 10_000,
  quoteChar: "'",
  numberFormatter: MString.fromNumber(10),
  bigintFormatter: MString.fromNumber(10),
});
