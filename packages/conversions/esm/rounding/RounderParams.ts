/** This module implements a CVRounderParams, i.e. an object from which a CVRounder can be built */

import type * as Equivalence from 'effect/Equivalence';
import * as Hash from 'effect/Hash';
import * as Predicate from 'effect/Predicate';
import * as Struct from 'effect/Struct';

import * as MData from '@parischap/effect-lib/MData';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MString from '@parischap/effect-lib/MString';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import * as CVRoundingOption from './RoundingOption/RoundingOption.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/rounding/RounderParams/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type of a CVRounderParams
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** The precision at which to round the number. Must be a finite positive integer. */
  readonly precision: number;

  /** The rounding mode to use */
  readonly roundingOption: CVRoundingOption.Type;

  /** Class constructor */
  private constructor({ precision, roundingOption }: MTypes.Data<Type>) {
    super();
    this.precision = precision;
    this.roundingOption = roundingOption;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return `${CVRoundingOption.toString(this.roundingOption)}RounderWith\
${MString.fromNumber(10)(this.precision)}Precision`;
    };
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
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  self.precision === that.precision && self.roundingOption === that.roundingOption;

/**
 * Constructs a `CVRounderParams` with the specified `precision` and `roundingOption`
 *
 * @category Constructors
 */
export const make = ({
  precision = 0,
  roundingOption = CVRoundingOption.Type.HalfExpand,
}: {
  readonly precision?: number;
  readonly roundingOption?: CVRoundingOption.Type;
} = {}): Type => Type.make({ precision, roundingOption });

/**
 * `CVRounderParams` instance that uses the `HalfExpand` `CVRoundingOption` and `precision=2`. Can
 * be used in accounting apps of most countries throughout the world
 *
 * @category Instances
 */
export const halfExpand2 = make({ precision: 2 });

/**
 * Returns the `precision` property of `self`
 *
 * @category Getters
 */
export const precision: MTypes.OneArgFunction<Type, number> = Struct.get('precision');

/**
 * Returns the `roundingOption` property of `self`
 *
 * @category Getters
 */
export const roundingOption: MTypes.OneArgFunction<Type, CVRoundingOption.Type> =
  Struct.get('roundingOption');
