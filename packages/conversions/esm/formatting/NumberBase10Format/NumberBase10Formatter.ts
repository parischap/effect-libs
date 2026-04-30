/**
 * This module implements a CVNumberBase10Formatter, i.e. an object that can convert a number into a
 * string according to the CVNumberBase10Format that was used to construct it
 */

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import * as BigDecimal from 'effect/BigDecimal';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as Result from 'effect/Result';
import * as String from 'effect/String';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';

import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
import * as MData from '@parischap/effect-lib/MData';
import * as MFunction from '@parischap/effect-lib/MFunction';
import * as MPredicate from '@parischap/effect-lib/MPredicate';
import * as MRegExpString from '@parischap/effect-lib/MRegExpString';
import * as MString from '@parischap/effect-lib/MString';
import * as MTypes from '@parischap/effect-lib/MTypes';

import * as CVScientificNotationMantissaAdjuster from '../../internal/formatting/NumberBase10Format/NumberBase10FormatScientificNotationOption/ScientificNotationMantissaAdjuster.js';
import * as CVSignFormatter from '../../internal/formatting/NumberBase10Format/NumberBase10FormatSignDisplayOption/SignFormatter.js';
import * as CVRounder from '../../rounding/Rounder.js';
import * as CVRounderParams from '../../rounding/RounderParams.js';
import * as CVNumberBase10Format from './NumberBase10Format.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/conversions/formatting/NumberBase10Format/NumberBase10Formatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a CVNumberBase10Formatter
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Description of this formatter, e.g. 'signed integer formatter' */
  readonly description: string;
  /**
   * Function that formats a `number` respecting the options represented by the CVNumberBase10Format
   * from which `this` was constructed. If successful, that function returns a `some` of the
   * formatted number. Otherwise, it returns a `none`. `number` can be of type number or
   * `BigDecimal` for better accuracy. There is a difference between number and `BigDecimal` (and
   * bigint) regarding the sign of 0. In Javascript, Object.is(0,-0) is false whereas Object.is(0n,-
   * 0n) is true. So if the sign of zero is important to you, prefer passing a number to the
   * function. `0` as a BigDecimal will always be interpreted as a positive `0` as we have no means
   * of knowing if it is negative or positive
   */
  readonly format: MTypes.OneArgFunction<BigDecimal.BigDecimal | number, string>;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.description;
    };
  }

  /** Class constructor */
  constructor(numberFormat: CVNumberBase10Format.Type) {
    super();
    this.description = `${CVNumberBase10Format.toDescription(numberFormat)} formatter`;
    const rounder =
      numberFormat.maximumFractionalDigits === Infinity
        ? Function.identity
        : pipe(
            {
              precision: numberFormat.maximumFractionalDigits,
              roundingOption: numberFormat.roundingOption,
            },
            CVRounderParams.make,
            CVRounder.bigDecimal,
          );
    const signFormatter = CVSignFormatter.fromSignDisplayOption(numberFormat.signDisplayOption);
    const mantissaAdjuster = CVScientificNotationMantissaAdjuster.fromScientificNotationOption(
      numberFormat.scientificNotationOption,
    );
    const hasThousandSeparator = numberFormat.thousandSeparator !== '';
    const eNotationChar = pipe(
      numberFormat.eNotationChars,
      Array.get(0),
      Option.getOrElse(MFunction.constEmptyString),
    );
    const integerPartPadder: MTypes.StringTransformer = Option.match(
      numberFormat.integerPartPadding,
      {
        onNone: () => Function.identity,
        onSome: ({ length, fillChar }) => String.padStart(length, fillChar),
      },
    );
    const fractionalPartPadder = String.padEnd(numberFormat.minimumFractionalDigits, '0');
    const fractionalSeparatorPrepender = MString.prepend(numberFormat.fractionalSeparator);
    const thousandSeparatorIntersperser = Array.intersperse(numberFormat.thousandSeparator);
    const { showNullIntegerPart } = numberFormat;

    this.format = (number) => {
      const [sign, thisAsBigDecimal] = MTypes.isNumber(number)
        ? Tuple.make(
            number < 0 || Object.is(-0, number) ? (-1 as const) : (1 as const),
            BigDecimal.fromNumberUnsafe(number),
          )
        : Tuple.make(number.value < 0 ? (-1 as const) : (1 as const), number);

      const [adjusted, exponent] = mantissaAdjuster(thisAsBigDecimal);
      const absRounded = pipe(adjusted, rounder, BigDecimal.abs);
      const [integerPart, fractionalPart] = pipe(
        absRounded,
        MBigDecimal.truncatedAndFollowingParts(),
      );

      const signString = signFormatter({ sign, isZero: BigDecimal.isZero(absRounded) });

      const normalizedFractionalPart = BigDecimal.normalize(fractionalPart);

      const fractionalPartString = pipe(
        normalizedFractionalPart.value,
        Option.liftPredicate(Predicate.not(MPredicate.strictEquals(0n))),
        Option.map(MString.fromNonNullablePrimitive),
        Option.getOrElse(MFunction.constEmptyString),
        String.padStart(normalizedFractionalPart.scale, '0'),
        fractionalPartPadder,
        Option.liftPredicate(String.isNonEmpty),
        Option.map(fractionalSeparatorPrepender),
        Option.getOrElse(MFunction.constEmptyString),
      );

      const integerPartString = pipe(
        integerPart.value.toString(),
        MFunction.fIfTrue({
          condition: hasThousandSeparator,
          f: flow(
            MString.splitEquallyRestAtStart(MRegExpString.DIGIT_GROUP_SIZE),
            thousandSeparatorIntersperser,
            Array.join(''),
          ),
        }),
        Result.liftPredicate(
          Predicate.not(MPredicate.strictEquals('0')),
          MFunction.fIfTrue({
            condition: !showNullIntegerPart && fractionalPartString.length > 0,
            f: MFunction.constEmptyString,
          }),
        ),
        Result.merge,
      );

      const exponentString = pipe(
        exponent,
        Option.map(flow(MString.fromNumber(10), MString.prepend(eNotationChar))),
        Option.getOrElse(MFunction.constEmptyString),
      );

      return `${signString}${integerPartPadder(integerPartString)}${fractionalPartString}${exponentString}`;
    };
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Constructor of a CVNumberBase10Formatter from a CVNumberBase10Format
 *
 * @category Constructors
 */
export const fromFormat = (format: CVNumberBase10Format.Type) => new Type(format);

/**
 * Returns the `description` property of `self`
 *
 * @category Getters
 */
export const description: MTypes.OneArgFunction<Type, string> = Struct.get('description');

/**
 * Returns the `format` property of `self`.
 *
 * @category Getters
 */
export const format: MTypes.OneArgFunction<Type, Type['format']> = Struct.get('format');
