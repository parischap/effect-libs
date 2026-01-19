/**
 * This module implements a `CVRoundingOption` which describes the possible options to round a
 * number or `BigDecimal` and implements the rounding algortithm
 */

import {
  MBigDecimal,
  MBigInt,
  MInspectable,
  MNumber,
  MPipeable,
  MString,
  MTypes,
} from '@parischap/effect-lib';
import { BigDecimal, Equal, Equivalence, Hash, pipe, Pipeable, Predicate, Struct } from 'effect';
import * as CVRoundingMode from './RoundingMode.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/RoundingOption/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

const _bigDecimal10 = BigDecimal.make(10n, 0);

/**
 * `CVRoundingOption` Type
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
  /** The precision at which to round the number. Must be a finite positive integer. */
  readonly precision: number;

  /** The rounding mode to use */
  readonly roundingMode: CVRoundingMode.Type;

  /** @internal */
  readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  self.precision === that.precision && self.roundingMode === that.roundingMode;

/** Prototype */

const _proto: MTypes.Proto<Type> = {
  [_TypeId]: _TypeId,
  [Equal.symbol](this: Type, that: unknown): boolean {
    return has(that) && equivalence(this, that);
  },
  [Hash.symbol](this: Type) {
    return pipe(
      this.precision,
      Hash.hash,
      Hash.combine(Hash.hash(this.roundingMode)),
      Hash.cached(this),
    );
  },
  [MInspectable.IdSymbol](this: Type) {
    return `${CVRoundingMode.getName(this.roundingMode)}RounderWith${MString.fromNumber(10)(this.precision)}Precision`;
  },
  ...MInspectable.BaseProto(moduleTag),
  ...MPipeable.BaseProto,
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(_proto, params);

/**
 * Constructs a `CVRoundingOption` with the specified `precision` and `roundingMode`
 *
 * @category Constructors
 */
export const make = ({
  precision = 0,
  roundingMode = CVRoundingMode.Type.HalfExpand,
}: {
  readonly precision?: number;
  readonly roundingMode?: CVRoundingMode.Type;
} = {}): Type => _make({ precision, roundingMode });

/**
 * `CVRoundingOption` instance that uses the `HalfExpand` `CVRoundingMode` and `precision=2`. Can be
 * used in accounting apps of most countries througout the world
 *
 * @category Instances
 */
export const halfExpand2 = make({ precision: 2, roundingMode: CVRoundingMode.Type.HalfExpand });

/**
 * Returns the `precision` property of `self`
 *
 * @category Destructors
 */
export const precision: MTypes.OneArgFunction<Type, number> = Struct.get('precision');

/**
 * Returns the `roundingMode` property of `self`
 *
 * @category Destructors
 */
export const roundingMode: MTypes.OneArgFunction<Type, CVRoundingMode.Type> =
  Struct.get('roundingMode');

/**
 * Builds a number Rounder implementing `self`, i.e a function that rounds a number as specified by
 * `self`
 *
 * @category Destructors
 */
export const toNumberRounder = (self: Type): MTypes.OneArgFunction<number> => {
  const shiftMultiplicand = pipe(1, MNumber.shift(self.precision));
  const unshiftMultiplicand = 1 / shiftMultiplicand;
  const correcter = CVRoundingMode.toCorrecter(self.roundingMode);
  return (n) => {
    const shiftedSelf = shiftMultiplicand * n;
    const truncatedShiftedSelf = Math.trunc(shiftedSelf);
    const firstFollowingDigit = Math.trunc((shiftedSelf - truncatedShiftedSelf) * 10);
    return (
      unshiftMultiplicand
      * (truncatedShiftedSelf
        + correcter({ firstFollowingDigit, isEven: truncatedShiftedSelf % 2 === 0 }))
    );
  };
};

/**
 * Builds a BigDecimal Rounder implementing `self`, i.e a function that rounds a BigDecimal as
 * specified by `self`
 *
 * @category Destructors
 */
export const toBigDecimalRounder = (self: Type): MTypes.OneArgFunction<BigDecimal.BigDecimal> => {
  const shiftValue = BigDecimal.make(1n, -self.precision);
  const shift = BigDecimal.multiply(shiftValue);
  const unshift = BigDecimal.unsafeDivide(shiftValue);
  const correcter = CVRoundingMode.toCorrecter(self.roundingMode);
  return (n) => {
    const shiftedSelf = shift(n);
    const truncatedShiftedSelf = pipe(shiftedSelf, MBigDecimal.trunc());
    const firstFollowingDigit = pipe(
      shiftedSelf,
      BigDecimal.subtract(truncatedShiftedSelf),
      BigDecimal.multiply(_bigDecimal10),
      MBigDecimal.trunc(),
      BigDecimal.unsafeToNumber,
    );
    return pipe(
      truncatedShiftedSelf,
      BigDecimal.sum(
        pipe(
          { firstFollowingDigit, isEven: MBigInt.isEven(truncatedShiftedSelf.value) },
          correcter,
          BigDecimal.unsafeFromNumber,
        ),
      ),
      unshift,
    );
  };
};
