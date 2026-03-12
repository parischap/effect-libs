/**
 * This module implements a type that takes care of the formatting of primitive values, e.g.
 * surround strings in quotes, add 'n' at the end of a bigint, display numbers with a thousand
 * separator,...
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import type * as PPOption from './Option.js';

import { flow, pipe } from 'effect';

import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MString from '@parischap/effect-lib/MString';
import * as MTypes from '@parischap/effect-lib/MTypes';

import * as Either from 'effect/Either';
import * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Number from 'effect/Number';
import * as Predicate from 'effect/Predicate';
import * as String from 'effect/String';
import * as Struct from 'effect/Struct';

import * as PPValue from './Value.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/PrimitiveFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Namespace of a PrimitiveFormatter used as an action
 *
 * @category Models
 */
export namespace Action {
  /**
   * Type of the action of a PrimitiveFormatter. The action takes the current formatting option and
   * a Primitive value (see Value.ts) and returns an unstyled string representing that value.
   */
  export interface Type {
    (option: PPOption.Type, value: PPValue.Primitive): string;
  }
}

/**
 * Type that represents a PrimitiveFormatter
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** Id of this PrimitiveFormatter instance. Useful for equality and debugging */
  readonly id: string;

  /** Action of this PrimitiveFormatter */
  readonly action: Action.Type;

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
 * Constructor
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
export const action: MTypes.OneArgFunction<Type, Action.Type> = Struct.get('action');

/**
 * Returns a function that formats `value` as a string according to `self`'s action.
 *
 * @category Formatting
 */
export const format =
  (self: Type) =>
  (option: PPOption.Type) =>
  (value: PPValue.Primitive): string =>
    self.action(option, value);

/**
 * PrimitiveFormatter constructor that builds an instance that works like util.inspect
 *
 * @category Constructors
 */
export const utilInspectLikeMaker = (
  {
    id,
    maxStringLength,
    numberFormatter,
  }: {
    readonly id: string;
    readonly maxStringLength: number;
    readonly numberFormatter: Intl.NumberFormat;
  } = { id: 'UtilInspectLike', maxStringLength: 10_000, numberFormatter: new Intl.NumberFormat() },
): Type =>
  make({
    id,
    action: (_option, value) =>
      pipe(
        value,
        PPValue.content,
        MMatch.make,
        MMatch.when(
          MTypes.isString,
          flow(
            Either.liftPredicate(
              flow(String.length, Number.greaterThan(maxStringLength)),
              Function.identity,
            ),
            Either.map(flow(String.takeLeft(maxStringLength), MString.append('...'))),
            Either.merge,
            MString.append("'"),
            MString.prepend("'"),
          ),
        ),
        MMatch.when(
          MTypes.isNumber,
          flow((n) => numberFormatter.format(n)),
        ),
        MMatch.when(
          MTypes.isBigInt,
          flow((n) => numberFormatter.format(n), MString.append('n')),
        ),
        MMatch.orElse(MString.fromPrimitive),
      ),
  });
