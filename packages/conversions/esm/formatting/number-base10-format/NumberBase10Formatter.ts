/**
 * This module implements a CVNumberBase10Formatter, i.e. an object that can convert a number into a
 * string according to the CVNumberBase10Format that was used to construct it
 */

import { MBigInt, MFunction, MRegExpString, MString } from '@parischap/effect-lib';
import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
import * as MData from '@parischap/effect-lib/MData';
import * as MPredicate from '@parischap/effect-lib/MPredicate';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { Array, Either, flow, pipe, Struct } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as String from 'effect/String';
import * as Tuple from 'effect/Tuple';
import * as CVScientificNotationMantissaAdjuster from '../../internal/formatting/number-base10-format/number-base10-format-scientific-notation-option/ScientificNotationMantissaAdjuster.js';
import * as CVSignFormatter from '../../internal/formatting/number-base10-format/number-base10-format-sign-display-option/SignFormatter.js';
import * as CVRounder from '../../rounding/Rounder.js';
import * as CVRounderParams from '../../rounding/RounderParams.js';
import * as CVNumberBase10Format from './index.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/conversions/formatting/number-base10-format/NumberBase10Formatter/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a CVNumberBase10Formatter
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Description of this formatter, e.g. 'signed integer formatter' */
  readonly description: string;

  /**
   * Function that rounds a BigDecimal according to the `maximumFractionalDigits` and
   * `roundingOption` parameters of the CVNumberBase10Format that was used to build this
   * CVNumberBase10Formatter
   */
  readonly rounder: CVRounder.Type<BigDecimal.BigDecimal>;

  /**
   * Function that formats a sign according to the `signDisplayOption` parameter of the
   * CVNumberBase10Format that was used to build this CVNumberBase10Formatter
   */
  readonly signFormatter: CVSignFormatter.Type;

  /**
   * Function that adjusts the mantissa according to the `scientificNotationOption` parameter of the
   * CVNumberBase10Format that was used to build this CVNumberBase10Formatter
   */
  readonly mantissaAdjuster: CVScientificNotationMantissaAdjuster.Type;

  /**
   * Flag that indicates whether the CVNumberBase10Format that was used to build this
   * CVNumberBase10Formatter had a thousandSeparator
   */
  readonly hasThousandSeparator: boolean;

  /**
   * The first `eNotationChar` provided to the `eNotationChars` parameter of the
   * CVNumberBase10Format that was used to build this CVNumberBase10Formatter
   */
  readonly eNotationChar: string;

  /**
   * Function that pads the integer part of the mantissa of a number according to the
   * `integerPartPadding` and `fillChar` parameters of the CVNumberBase10Format that was used to
   * build this CVNumberBase10Formatter
   */
  readonly integerPartPadder: MTypes.StringTransformer;

  /**
   * Function that pads the fractional part of the mantissa of a number according to the
   * `minimumFractionalDigits` parameter of the CVNumberBase10Format that was used to build this
   * CVNumberBase10Formatter
   */
  readonly fractionalPartPadder: MTypes.StringTransformer;

  /**
   * Function that prepends the fractional separator to the fractional part of the mantissa of a
   * number
   */
  readonly fractionalSeparatorPrepender: MTypes.StringTransformer;

  /**
   * Function that adds intersperses the thousand separator in the inter part of the mantissa of a
   * number
   */
  readonly thousandSeparatorIntersperser: MTypes.OneArgFunction<Array<string>>;

  /** Same as CVNumberBase10.showNullIntegerPart */
  readonly showNullIntegerPart: boolean;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return moduleTag;
  }

  /** Class constructor */
  private constructor({
    description,
    rounder,
    signFormatter,
    mantissaAdjuster,
    hasThousandSeparator,
    eNotationChar,
    integerPartPadder,
    fractionalPartPadder,
    fractionalSeparatorPrepender,
    thousandSeparatorIntersperser,
    showNullIntegerPart,
  }: MTypes.Data<Type>) {
    super();
    this.description = description;
    this.rounder = rounder;
    this.signFormatter = signFormatter;
    this.mantissaAdjuster = mantissaAdjuster;
    this.hasThousandSeparator = hasThousandSeparator;
    this.eNotationChar = eNotationChar;
    this.integerPartPadder = integerPartPadder;
    this.fractionalPartPadder = fractionalPartPadder;
    this.fractionalSeparatorPrepender = fractionalSeparatorPrepender;
    this.thousandSeparatorIntersperser = thousandSeparatorIntersperser;
    this.showNullIntegerPart = showNullIntegerPart;
  }

  /** Static constructor */
  static fromFormat(format: CVNumberBase10Format.Type): Type {
    return new Type({
      description: `${CVNumberBase10Format.toDescription(format)} formatter`,
      rounder:
        format.maximumFractionalDigits === Infinity ?
          Function.identity
        : pipe(
            {
              precision: format.maximumFractionalDigits,
              roundingOption: format.roundingOption,
            },
            CVRounderParams.make,
            CVRounder.bigDecimal,
          ),
      signFormatter: CVSignFormatter.fromSignDisplayOption(format.signDisplayOption),
      mantissaAdjuster: CVScientificNotationMantissaAdjuster.fromScientificNotationOption(
        format.scientificNotationOption,
      ),
      hasThousandSeparator: format.thousandSeparator !== '',
      eNotationChar: pipe(
        format.eNotationChars,
        Array.get(0),
        Option.getOrElse(MFunction.constEmptyString),
      ),
      integerPartPadder: Option.match(format.integerPartPadding, {
        onNone: MFunction.constIdentity,
        onSome: ({ length, fillChar }) => String.padStart(length, fillChar),
      }),
      fractionalPartPadder: String.padEnd(format.minimumFractionalDigits, '0'),
      fractionalSeparatorPrepender: MString.prepend(format.fractionalSeparator),
      thousandSeparatorIntersperser: Array.intersperse(format.thousandSeparator),
      showNullIntegerPart: format.showNullIntegerPart,
    });
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Constructor of a CVNumberBase10Parser from a CVNumberBase10Format
 *
 * @category Constructors
 */
export const fromFormat = (format: CVNumberBase10Format.Type) => Type.fromFormat(format);

/**
 * Returns the `description` property of `self`
 *
 * @category Destructors
 */
export const description: MTypes.OneArgFunction<Type, string> = Struct.get('description');

/**
 * Tries to format a `number` respecting the options represented by the CVNumberBase10Format from
 * which `self` was constructed. If successful, that function returns a `some` of the formatted
 * number. Otherwise, it returns a `none`. `number` can be of type number or `BigDecimal` for better
 * accuracy. There is a difference between number and `BigDecimal` (and bigint) regarding the sign
 * of 0. In Javascript, Object.is(0,-0) is false whereas Object.is(0n,-0n) is true. So if the sign
 * of zero is important to you, prefer passing a number to the function. `0` as a BigDecimal will
 * always be interpreted as a positive `0` as we have no means of knowing if it is negative or
 * positive
 *
 * @category Formatting
 */
export const format = (
  self: Type,
): MTypes.OneArgFunction<BigDecimal.BigDecimal | number, string> => {
  return (number) => {
    const [sign, selfAsBigDecimal] =
      MTypes.isNumber(number) ?
        Tuple.make(
          number < 0 || Object.is(-0, number) ? (-1 as const) : (1 as const),
          BigDecimal.unsafeFromNumber(number),
        )
      : Tuple.make(number.value < 0 ? (-1 as const) : (1 as const), number);

    const [adjusted, exponent] = self.mantissaAdjuster(selfAsBigDecimal);
    const absRounded = pipe(adjusted, self.rounder, BigDecimal.abs);
    const [integerPart, fractionalPart] = pipe(
      absRounded,
      MBigDecimal.truncatedAndFollowingParts(),
    );

    const signString = self.signFormatter({ sign, isZero: BigDecimal.isZero(absRounded) });

    const normalizedFractionalPart = BigDecimal.normalize(fractionalPart);

    const fractionalPartString = pipe(
      normalizedFractionalPart.value,
      Option.liftPredicate(Predicate.not(MBigInt.isZero)),
      Option.map(MString.fromNonNullablePrimitive),
      Option.getOrElse(MFunction.constEmptyString),
      String.padStart(normalizedFractionalPart.scale, '0'),
      self.fractionalPartPadder,
      Option.liftPredicate(String.isNonEmpty),
      Option.map(self.fractionalSeparatorPrepender),
      Option.getOrElse(MFunction.constEmptyString),
    );

    const integerPartString = pipe(
      integerPart.value.toString(),
      MFunction.fIfTrue({
        condition: self.hasThousandSeparator,
        f: flow(
          MString.splitEquallyRestAtStart(MRegExpString.DIGIT_GROUP_SIZE),
          self.thousandSeparatorIntersperser,
          Array.join(''),
        ),
      }),
      Either.liftPredicate(
        Predicate.not(MPredicate.strictEquals('0')),
        MFunction.fIfTrue({
          condition: !self.showNullIntegerPart && fractionalPartString.length > 0,
          f: MFunction.constEmptyString,
        }),
      ),
      Either.merge,
    );

    const exponentString = pipe(
      exponent,
      Option.map(flow(MString.fromNumber(10), MString.prepend(self.eNotationChar))),
      Option.getOrElse(MFunction.constEmptyString),
    );

    return `${signString}${self.integerPartPadder(integerPartString)}${fractionalPartString}${exponentString}`;
  };
};
