/**
 * This module implements a `MNumberBase10Format` which describes the possible options to
 * format/parse a base-10 number or `BigDecimal` and implements the formatting/parsing algorithms
 */

import { flow, pipe } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';
import * as BigInt from 'effect/BigInt';
import * as Function from 'effect/Function';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';

import type * as internalSignString from './internal/NumberBase10Format/SignString.js';
import type * as MTypes from './types/types.js';

import * as MBigDecimal from './BigDecimal.js';
import * as MData from './Data/Data.js';
import * as MFunction from './Function.js';
import * as internalScientificNotationMantissaValidator from './internal/NumberBase10Format/ScientificNotationMantissaValidator.js';
import * as internalScientificNotationParser from './internal/NumberBase10Format/ScientificNotationParser.js';
import * as internalSignParser from './internal/NumberBase10Format/SignParser.js';
import * as internal from './internal/String.js';
import * as MMatch from './Match.js';
import * as MPredicate from './Predicate.js';
import * as MRegExpString from './RegExpString.js';
import * as MStruct from './Struct.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/NumberBase10Format/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents the possible scientific notation options
 *
 * @category Models
 */
export enum ScientificNotationOption {
  /**
   * Formatting: scientific notation is not used.
   *
   * Parsing: conversion will fail if a scientific notation is present.
   */
  None = 0,

  /**
   * Formatting: scientific notation is not used.
   *
   * Parsing: scientific notation may be used but is not mandatory.
   */
  Standard = 1,

  /**
   * Formatting: scientific notation is used so that the absolute value of the mantissa m fulfills 1
   * ≤ |m| < 10. Number 0 will be displayed as `0e0`.
   *
   * Parsing: the conversion will fail if the mantissa is not null and its value m does not fulfill
   * 1 ≤ |m| < 10. Scientific notation may be used but is not mandatory. A string that does not
   * contain a scientific notation is deemed equivalent to a string with a null exponent.
   */
  Normalized = 2,

  /**
   * Formatting: scientific notation is used so that the mantissa m fulfills 1 ≤ |m| < 1000 and the
   * exponent is a multiple of 3. Number 0 will be displayed as `0e0`.
   *
   * Parsing: the conversion will fail if the mantissa is not null and its value m does not fulfill
   * 1 ≤ |m| < 1000 or if the exponent is not a multiple of 3. Scientific notation may be used but
   * is not mandatory. A string that does not contain a scientific notation is deemed equivalent to
   * a string with a null exponent.
   */
  Engineering = 3,
}

/**
 * Type that represents the possible sign display options
 *
 * @category Models
 */
export enum SignDisplayOption {
  /**
   * Formatting: sign display for negative numbers only, including negative zero.
   *
   * Parsing: conversion will fail if a positive sign is used.
   */
  Auto = 0,

  /**
   * Formatting: sign display for all numbers.
   *
   * Parsing: conversion will fail if no sign is present
   */
  Always = 1,

  /**
   * Formatting: sign display for positive and negative numbers, but not zero
   *
   * Parsing: conversion will fail if a sign is not present for a value other than 0 or if a sign is
   * present for 0.
   */
  ExceptZero = 2,

  /**
   * Formatting: sign display for negative numbers only, excluding negative zero.
   *
   * Parsing: conversion will fail if a positive sign is used or if a negative sign is used for 0.
   */
  Negative = 3,

  /**
   * Formatting: no sign display.
   *
   * Parsing: conversion will fail if any sign is present. The number will be treated as positive.
   */
  Never = 4,
}

/**
 * Type of the value returned by `_bigDecimalExtractor`
 *
 * @category Models
 */
export interface BigDecimalExtraction {
  readonly value: BigDecimal.BigDecimal;
  readonly match: string;
  readonly sign: -1 | 1;
  readonly input: string;
}

/**
 * Type that represents a `MNumberBase10Format`
 *
 * @category Models
 */
export class Type extends MData.Class {
  /**
   * Thousand separator. Use an empty string for no separator. Usually a string made of at most one
   * character different from `fractionalSeparator`. Will not throw otherwise but unexpected results
   * might occur.
   */
  readonly thousandSeparator: string;

  /**
   * Fractional separator. Usually a one-character string different from `thousandSeparator`. Will
   * not throw otherwise but unexpected results might occur.
   */
  readonly fractionalSeparator: string;

  /**
   * Formatting:
   *
   * - If `true`, numbers with a null integer part are displayed starting with `0`. Otherwise, they
   *   are displayed starting with `.` unless `maximumFractionalDigits===0`, in which case they are
   *   displayed starting with `0`.
   *
   * Parsing
   *
   * - If `true`, conversion will fail for numbers starting with `.` (after an optional sign).
   * - If `false`, conversion will fail for numbers starting with `0.` (after an optional sign).
   */
  readonly showNullIntegerPart: boolean;

  /**
   * If `integerPartPadding` is a `none`, no padding is applied. Otherwise the string representation
   * of the integer part of the mantissa will be padded with `fillChar`'s on the left of the
   * mantissa (but after the sign if there is one) so that it is length characters long
   * (thousandSeparator included).
   *
   * Formatting: `fillChar`'s are padded on the left of the mantissa (but after the sign if there is
   * one) until the integer part occupies `length` characters. Conversion does not fail if the
   * integer part of the mantissa occupies more than length characters (it is displayed as is
   * without any padding).
   *
   * Parsing: conversion will fail if the string representation of the integer part of the mantissa
   * does not occupy length characters. If it occupies length characters, any `fillChar` character
   * present on the left of the mantissa (but after the sign if there is one) is removed
   */
  readonly integerPartPadding: Option.Option<{
    readonly length: number;
    readonly fillChar: string;
  }>;

  /**
   * Minimum number of digits forming the fractional part of a number. Must be a positive integer
   * (>=0) less than or equal to `maximumFractionalDigits`. Will not throw otherwise but unexpected
   * results might occur.
   *
   * Formatting: the string will be right-padded with `0`'s if necessary to respect the condition
   *
   * Parsing: will fail if the input string does not respect this condition (the string must be
   * right-padded with `0`'s to respect the condition if necessary).
   */
  readonly minimumFractionalDigits: number;

  /**
   * Maximum number of digits forming the fractional part of a number. Must be an integer value
   * greater than or equal to `minimumFractionalDigits`. Will not throw otherwise but unexpected
   * results might occur. Can take the +Infinity value. Use 0 for integers.
   *
   * Formatting: the number will be rounded using the roundingOption to respect the condition
   * (unless `maximumFractionalDigits` is `+Infinity`).
   *
   * Parsing: will fail if the input string has too many fractional digits.
   */
  readonly maximumFractionalDigits: number;

  /**
   * Possible characters to use to represent e-notation. Usually ['e','E']. Must be an array of one-
   * character strings. Will not throw otherwise but unexpected results will occur. Not used if
   * `scientificNotationOption === None`
   *
   * Formatting: the string at index 0 is used
   *
   * Parsing: the first character of the e-notation must be one of the one-character strings present
   * in the array
   */
  readonly eNotationChars: ReadonlyArray<string>;

  /** Scientific notation options. See `ScientificNotationOption` */
  readonly scientificNotationOption: ScientificNotationOption;

  /** Rounding mode options used when formatting. See `MBigDecimal.RoundingOption` */
  readonly roundingOption: MBigDecimal.RoundingOption;

  /** Sign display options. See `SignDisplayOption` */
  readonly signDisplayOption: SignDisplayOption;

  /**
   * Cache for `_bigDecimalExtractor`. Mutable only to memoize a value derived from `this`; never
   * used to hold external state.
   */
  private _cachedBigDecimalExtractor:
    | MTypes.OneArgFunction<string, Option.Option<BigDecimalExtraction>>
    | undefined;

  /**
   * Function that tries to extract, from the start of a string, a `BigDecimal` respecting the
   * options represented by `this`. If successful, returns a `some` containing the extracted
   * `value`, the `match` (the part of the string that could be analyzed as representing a number)
   * and the `sign` of the value (kept apart because, contrary to `number`, `BigDecimal` cannot
   * distinguish `-0` from `0`)
   *
   * @category Getters
   */
  get _bigDecimalExtractor(): MTypes.OneArgFunction<string, Option.Option<BigDecimalExtraction>> {
    if (this._cachedBigDecimalExtractor !== undefined) return this._cachedBigDecimalExtractor;

    const {
      thousandSeparator,
      fractionalSeparator,
      eNotationChars,
      integerPartPadding,
      minimumFractionalDigits,
      maximumFractionalDigits,
      scientificNotationOption,
      signDisplayOption,
      showNullIntegerPart,
    } = this;

    const getParts = internal.matchWithCapturingGroups(
      pipe(
        {
          thousandSeparator,
          fractionalSeparator,
          eNotationChars,
          fillChar: Option.match(integerPartPadding, {
            onNone: MFunction.constEmptyString,
            onSome: Struct.get('fillChar'),
          }),
        },
        MRegExpString.base10Number,
        MRegExpString.atStart,
        RegExp,
      ),
      ['signPart', 'padding', 'mantissaIntegerPart', 'mantissaFractionalPart', 'exponentPart'],
    );
    const removeThousandSeparator = internal.removeNCharsEveryMCharsFromRight({
      m: MRegExpString.DIGIT_GROUP_SIZE,
      n: thousandSeparator.length,
    });
    const signParser = internalSignParser.fromSignDisplayOption(signDisplayOption);
    const exponentParser =
      internalScientificNotationParser.fromScientificNotationOption(scientificNotationOption);
    const scientificNotationMantissaValidator =
      internalScientificNotationMantissaValidator.fromScientificNotationOption(
        scientificNotationOption,
      );
    const mantissaFractionalPartLengthValidator = Option.liftPredicate(
      Number.between({
        minimum: minimumFractionalDigits,
        maximum: maximumFractionalDigits,
      }),
    );
    const mantissaIntegerPartAndPaddingLengthValidator: MTypes.OneArgFunction<
      [mantissaIntegerPartLength: number, paddingLength: number],
      Option.Option<[mantissaIntegerPartLength: number, paddingLength: number]>
    > = Option.match(integerPartPadding, {
      onNone: () => Option.some,
      onSome: ({ length }) =>
        Option.liftPredicate(flow(Number.sumAll, MPredicate.strictEquals(length))),
    });
    const fillCharIsZero = Option.match(integerPartPadding, {
      onNone: Function.constFalse,
      onSome: ({ fillChar }) => fillChar === '0',
    });

    /* The sign is kept apart from the value because for numbers -0 is different from 0 which is not the case for BigDecimal's. So if we multiply the value by the sign, we lose that information */
    const bigDecimalExtractor = (input: string): Option.Option<BigDecimalExtraction> =>
      Option.gen(function* () {
        const {
          match,
          groups: { signPart, padding, mantissaIntegerPart, mantissaFractionalPart, exponentPart },
        } = yield* getParts(input);

        const validatedMantissaFractionalPartLength = yield* mantissaFractionalPartLengthValidator(
          mantissaFractionalPart.length,
        );

        const [validatedMantissaIntegerPartLength, validatedPaddingLength] =
          yield* mantissaIntegerPartAndPaddingLengthValidator(
            Tuple.make(mantissaIntegerPart.length, padding.length),
          );

        const isInteger = validatedMantissaFractionalPartLength === 0;

        const mantissa = yield* pipe(
          validatedMantissaIntegerPartLength,
          Option.liftPredicate(Number.isGreaterThan(0)),
          Option.as(mantissaIntegerPart),
          Option.match({
            // No integer part
            onNone: () =>
              (!showNullIntegerPart && !isInteger) || (fillCharIsZero && validatedPaddingLength > 0)
                ? Option.some(MBigDecimal.zero)
                : Option.none(),
            // With integer part
            onSome: flow(
              showNullIntegerPart || isInteger
                ? Option.some
                : Option.liftPredicate(Predicate.not(MPredicate.strictEquals('0'))),
              Option.map(flow(removeThousandSeparator, BigInt.BigInt, BigDecimal.fromBigInt)),
            ),
          }),
          Option.map(
            BigDecimal.sum(
              pipe(
                mantissaFractionalPart,
                Option.liftPredicate((s) => s.length > 0),
                Option.map((stringValue) =>
                  BigDecimal.make(
                    BigInt.BigInt(stringValue),
                    validatedMantissaFractionalPartLength,
                  ),
                ),
                Option.getOrElse(Function.constant(MBigDecimal.zero)),
              ),
            ),
          ),
        );
        const validatedMantissa = yield* scientificNotationMantissaValidator(mantissa);
        const sign = yield* signParser({
          isZero: BigDecimal.isZero(validatedMantissa),
          sign: signPart as internalSignString.Type,
        });
        const exponent = yield* exponentParser(exponentPart);

        return {
          value: BigDecimal.make(validatedMantissa.value, validatedMantissa.scale - exponent),
          match,
          sign,
          input,
        };
      });

    this._cachedBigDecimalExtractor = bigDecimalExtractor;
    return bigDecimalExtractor;
  }

  /** Class constructor */
  private constructor({
    thousandSeparator,
    fractionalSeparator,
    showNullIntegerPart,
    integerPartPadding,
    minimumFractionalDigits,
    maximumFractionalDigits,
    eNotationChars,
    scientificNotationOption,
    roundingOption,
    signDisplayOption,
  }: MTypes.Data<Type>) {
    super();
    this.thousandSeparator = thousandSeparator;
    this.fractionalSeparator = fractionalSeparator;
    this.showNullIntegerPart = showNullIntegerPart;
    this.integerPartPadding = integerPartPadding;
    this.minimumFractionalDigits = minimumFractionalDigits;
    this.maximumFractionalDigits = maximumFractionalDigits;
    this.eNotationChars = eNotationChars;
    this.scientificNotationOption = scientificNotationOption;
    this.roundingOption = roundingOption;
    this.signDisplayOption = signDisplayOption;
    this._cachedBigDecimalExtractor = undefined;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return moduleTag;
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

type IntegerPartPadding = Type['integerPartPadding'];

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type => Type.make(params);

/**
 * Returns the `thousandSeparator` property of `self`
 *
 * @category Getters
 */
export const thousandSeparator: MTypes.OneArgFunction<Type, string> =
  Struct.get('thousandSeparator');

/**
 * Returns the `fractionalSeparator` property of `self`
 *
 * @category Getters
 */
export const fractionalSeparator: MTypes.OneArgFunction<Type, string> =
  Struct.get('fractionalSeparator');

/**
 * Returns the `showNullIntegerPart` property of `self`
 *
 * @category Getters
 */
export const showNullIntegerPart: MTypes.OneArgFunction<Type, boolean> =
  Struct.get('showNullIntegerPart');

/**
 * Returns the `integerPartPadding` property of `self`
 *
 * @category Getters
 */
export const integerPartPadding: MTypes.OneArgFunction<Type, IntegerPartPadding> =
  Struct.get('integerPartPadding');

/**
 * Returns the `minimumFractionalDigits` property of `self`
 *
 * @category Getters
 */
export const minimumFractionalDigits: MTypes.OneArgFunction<Type, number> =
  Struct.get('minimumFractionalDigits');

/**
 * Returns the `maximumFractionalDigits` property of `self`
 *
 * @category Getters
 */
export const maximumFractionalDigits: MTypes.OneArgFunction<Type, number> =
  Struct.get('maximumFractionalDigits');

/**
 * Returns the `eNotationChars` property of `self`
 *
 * @category Getters
 */
export const eNotationChars: MTypes.OneArgFunction<Type, ReadonlyArray<string>> = Struct.get(
  'eNotationChars',
);

/**
 * Returns the `scientificNotationOption` property of `self`
 *
 * @category Getters
 */
export const scientificNotationOption: MTypes.OneArgFunction<Type, ScientificNotationOption> =
  Struct.get('scientificNotationOption');

/**
 * Returns the `roundingOption` property of `self`
 *
 * @category Getters
 */
export const roundingOption: MTypes.OneArgFunction<Type, MBigDecimal.RoundingOption> =
  Struct.get('roundingOption');

/**
 * Returns the `signDisplayOption` property of `self`
 *
 * @category Getters
 */
export const signDisplayOption: MTypes.OneArgFunction<Type, SignDisplayOption> =
  Struct.get('signDisplayOption');

/**
 * Returns a `some` of the length of `self` if `self` represents a fixed-length number format.
 * Return a `none` otherwise
 *
 * @category Utils
 */
export const getFixedLength = (self: Type): Option.Option<number> =>
  Option.gen(function* () {
    const { length: integerPartLength } = yield* self.integerPartPadding;
    const signLength = yield* pipe(
      self.signDisplayOption,
      MMatch.make,
      MMatch.whenIs(SignDisplayOption.Always, () => Option.some(1)),
      MMatch.whenIs(SignDisplayOption.Never, () => Option.some(0)),
      MMatch.orElse(() => Option.none()),
    );
    const fractionalPartLength = yield* pipe(
      self.minimumFractionalDigits,
      Option.liftPredicate(MPredicate.strictEquals(self.maximumFractionalDigits)),
      Option.map(
        flow(
          Option.liftPredicate(Predicate.not(MPredicate.strictEquals(0))),
          Option.map(Number.sum(self.fractionalSeparator.length)),
          Option.getOrElse(Function.constant(0)),
        ),
      ),
    );

    return yield* pipe(
      self.scientificNotationOption,
      Option.liftPredicate(MPredicate.strictEquals(ScientificNotationOption.None)),
      Option.as(signLength + integerPartLength + fractionalPartLength),
    );
  });

/**
 * Returns a short description of `self`, e.g. 'signed integer'
 *
 * @category Destructors
 */
export const toDescription = (self: Type): string => {
  const {
    integerPartPadding,
    thousandSeparator,
    fractionalSeparator,
    minimumFractionalDigits,
    maximumFractionalDigits,
    scientificNotationOption,
    signDisplayOption,
  } = self;

  const isInteger = maximumFractionalDigits <= 0;
  const isUngrouped = thousandSeparator.length === 0;
  return (
    Option.match(integerPartPadding, {
      onNone: MFunction.constEmptyString,
      onSome: flow(Struct.get('fillChar'), internal.append('-left-padded ')),
    }) +
    pipe(
      signDisplayOption,
      MMatch.make,
      MMatch.whenIs(SignDisplayOption.Always, Function.constant('signed ')),
      MMatch.whenIs(SignDisplayOption.Never, Function.constant('unsigned ')),
      MMatch.orElse(Function.constant('potentially signed ')),
    ) +
    (isUngrouped && isInteger
      ? ''
      : (isUngrouped || thousandSeparator === ' ') && (fractionalSeparator === ',' || isInteger)
        ? 'French-style '
        : thousandSeparator === '.' && (fractionalSeparator === ',' || isInteger)
          ? 'Dutch-style '
          : (isUngrouped || thousandSeparator === ',') && (fractionalSeparator === '.' || isInteger)
            ? 'UK-style '
            : '') +
    (isInteger
      ? 'integer'
      : minimumFractionalDigits === maximumFractionalDigits
        ? `${internal.fromNumber(10)(minimumFractionalDigits)}-decimal number`
        : 'number') +
    pipe(
      scientificNotationOption,
      MMatch.make,
      MMatch.whenIs(ScientificNotationOption.None, MFunction.constEmptyString),
      MMatch.whenIs(
        ScientificNotationOption.Standard,
        Function.constant(' in standard scientific notation'),
      ),
      MMatch.whenIs(
        ScientificNotationOption.Normalized,
        Function.constant(' in normalized scientific notation'),
      ),
      MMatch.whenIs(
        ScientificNotationOption.Engineering,
        Function.constant(' in engineering notation'),
      ),
      MMatch.exhaustive,
    )
  );
};

/**
 * Returns a copy of `self` with `minimumFractionalDigits` and `maximumFractionalDigits` set to `n`.
 * `n` must be a finite positive integer
 *
 * @category Modifiers
 */
export const withNDecimals = (decimalNumber: number): MTypes.OneArgFunction<Type> =>
  flow(
    MStruct.append({
      minimumFractionalDigits: decimalNumber,
      maximumFractionalDigits: decimalNumber,
    }),
    make,
  );

/**
 * Returns a copy of `self` with `maximumFractionalDigits` set to `n`. `n` must be a positive
 * integer (`+Infinity` allowed). Pass 0 for an integer format
 *
 * @category Modifiers
 */
export const withMaxNDecimals =
  (maxDecimalNumber: number) =>
  (self: Type): Type =>
    pipe(
      self,
      MStruct.append({
        minimumFractionalDigits: Math.min(self.minimumFractionalDigits, maxDecimalNumber),
        maximumFractionalDigits: maxDecimalNumber,
      }),
      make,
    );

/**
 * Returns a copy of `self` with `minimumFractionalDigits` set to `n`. `n` must be a finite positive
 * integer
 *
 * @category Modifiers
 */
export const withMinNDecimals =
  (minDecimalNumber: number) =>
  (self: Type): Type =>
    pipe(
      self,
      MStruct.append({
        minimumFractionalDigits: minDecimalNumber,
        maximumFractionalDigits: Math.max(self.maximumFractionalDigits, minDecimalNumber),
      }),
      make,
    );

/**
 * Returns a copy of `self` with `scientificNotationOption` set to `None`
 *
 * @category Modifiers
 */
export const withNoScientificNotation: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    scientificNotationOption: ScientificNotationOption.None,
  }),
  make,
);

/**
 * Returns a copy of `self` with `scientificNotationOption` set to `Standard`
 *
 * @category Modifiers
 */
export const withStandardScientificNotation: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    scientificNotationOption: ScientificNotationOption.Standard,
  }),
  make,
);

/**
 * Returns a copy of `self` with `scientificNotationOption` set to `Normalized`
 *
 * @category Modifiers
 */
export const withNormalizedScientificNotation: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    scientificNotationOption: ScientificNotationOption.Normalized,
  }),
  make,
);

/**
 * Returns a copy of `self` with `scientificNotationOption` set to `Engineering`
 *
 * @category Modifiers
 */
export const withEngineeringScientificNotation: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    scientificNotationOption: ScientificNotationOption.Engineering,
  }),
  make,
);

/**
 * Returns a copy of `self` with `thousandSeparator` set to `thousandSeparator`
 *
 * @category Modifiers
 */
export const withThousandSeparator = (thousandSeparator: string): MTypes.OneArgFunction<Type> =>
  flow(
    MStruct.append({
      thousandSeparator,
    }),
    make,
  );

/**
 * Returns a copy of `self` with `thousandSeparator` set to ''
 *
 * @category Modifiers
 */
export const withoutThousandSeparator: MTypes.OneArgFunction<Type> = withThousandSeparator('');

/**
 * Returns a copy of `self` with `fractionalSeparator` set to `fractionalSeparator`
 *
 * @category Modifiers
 */
export const withFractionalSeparator = (fractionalSeparator: string): MTypes.OneArgFunction<Type> =>
  flow(
    MStruct.append({
      fractionalSeparator,
    }),
    make,
  );

/**
 * Returns a copy of `self` with `signDisplayOption` set to `Auto`
 *
 * @category Modifiers
 */
export const withSignDisplayForNegative: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    signDisplayOption: SignDisplayOption.Auto,
  }),
  make,
);

/**
 * Returns a copy of `self` with `signDisplayOption` set to `Always`
 *
 * @category Modifiers
 */
export const withSignDisplay: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    signDisplayOption: SignDisplayOption.Always,
  }),
  make,
);

/**
 * Returns a copy of `self` with `signDisplayOption` set to `ExceptZero`
 *
 * @category Modifiers
 */
export const withSignDisplayExceptZero: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    signDisplayOption: SignDisplayOption.ExceptZero,
  }),
  make,
);

/**
 * Returns a copy of `self` with `signDisplayOption` set to `Negative`
 *
 * @category Modifiers
 */
export const withSignDisplayForNegativeExceptZero: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    signDisplayOption: SignDisplayOption.Negative,
  }),
  make,
);

/**
 * Returns a copy of `self` with `signDisplayOption` set to `Never`
 *
 * @category Modifiers
 */
export const withoutSignDisplay: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    signDisplayOption: SignDisplayOption.Never,
  }),
  make,
);

/**
 * Returns a copy of `self` with `roundingOption` set to `Ceil`
 *
 * @category Modifiers
 */
export const withCeilRoundingOption: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    roundingOption: MBigDecimal.RoundingOption.Ceil,
  }),
  make,
);
/**
 * Returns a copy of `self` with `roundingOption` set to `Floor`
 *
 * @category Modifiers
 */
export const withFloorRoundingOption: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    roundingOption: MBigDecimal.RoundingOption.Floor,
  }),
  make,
);

/**
 * Returns a copy of `self` with `roundingOption` set to `Expand`
 *
 * @category Modifiers
 */
export const withExpandRoundingOption: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    roundingOption: MBigDecimal.RoundingOption.Expand,
  }),
  make,
);

/**
 * Returns a copy of `self` with `roundingOption` set to `Trunc`
 *
 * @category Modifiers
 */
export const withTruncRoundingOption: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    roundingOption: MBigDecimal.RoundingOption.Trunc,
  }),
  make,
);

/**
 * Returns a copy of `self` with `roundingOption` set to `HalfCeil`
 *
 * @category Modifiers
 */
export const withHalfCeilRoundingOption: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    roundingOption: MBigDecimal.RoundingOption.HalfCeil,
  }),
  make,
);

/**
 * Returns a copy of `self` with `roundingOption` set to `HalfFloor`
 *
 * @category Modifiers
 */
export const withHalfFloorRoundingOption: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    roundingOption: MBigDecimal.RoundingOption.HalfFloor,
  }),
  make,
);

/**
 * Returns a copy of `self` with `roundingOption` set to `HalfExpand`
 *
 * @category Modifiers
 */
export const withHalfExpandRoundingOption: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    roundingOption: MBigDecimal.RoundingOption.HalfExpand,
  }),
  make,
);

/**
 * Returns a copy of `self` with `roundingOption` set to `HalfTrunc`
 *
 * @category Modifiers
 */
export const withHalfTruncRoundingOption: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    roundingOption: MBigDecimal.RoundingOption.HalfTrunc,
  }),
  make,
);

/**
 * Returns a copy of `self` with `roundingOption` set to `HalfEven`
 *
 * @category Modifiers
 */
export const withHalfEvenRoundingOption: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    roundingOption: MBigDecimal.RoundingOption.HalfEven,
  }),
  make,
);

/**
 * Returns a copy of `self` with `showNullIntegerPart` set to `false`
 *
 * @category Modifiers
 */
export const withNullIntegerPartNotShowing: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    showNullIntegerPart: false,
  }),
  make,
);

/**
 * Returns a copy of `self` with `showNullIntegerPart` set to `true`
 *
 * @category Modifiers
 */
export const withNullIntegerPartShowing: MTypes.OneArgFunction<Type> = flow(
  MStruct.append({
    showNullIntegerPart: true,
  }),
  make,
);

const charPadded =
  (fillChar: string) =>
  (length: number): MTypes.OneArgFunction<Type> =>
    flow(
      MStruct.append({
        integerPartPadding: Option.some({ length, fillChar }),
      }),
      make,
    );
/**
 * Returns a copy of `self` with `integerPartPadding` set to `n` and `fillChar` set to `0`
 *
 * @category Modifiers
 */
export const zeroPadded: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = charPadded(
  '0',
);

/**
 * Returns a copy of `self` with `integerPartPadding` set to `n` and `fillChar` set to ` `
 *
 * @category Modifiers
 */
export const spacePadded: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = charPadded(
  ' ',
);

/**
 * `MNumberBase10Format` instance that uses a comma as fractional separator, a space as thousand
 * separator and shows at most three fractional digits. Used in countries like France, French-
 * speaking Canada, French-speaking Belgium, Denmark, Finland, Sweden...
 *
 * @category Instances
 */
export const frenchStyleNumber: Type = make({
  thousandSeparator: ' ',
  fractionalSeparator: ',',
  showNullIntegerPart: true,
  minimumFractionalDigits: 0,
  maximumFractionalDigits: 3,
  eNotationChars: ['e', 'E'],
  scientificNotationOption: ScientificNotationOption.None,
  roundingOption: MBigDecimal.RoundingOption.HalfExpand,
  signDisplayOption: SignDisplayOption.Negative,
  integerPartPadding: Option.none(),
});

/**
 * `MNumberBase10Format` instance that uses a comma as fractional separator, no thousand separator
 * and shows at most three fractional digits. Used in countries like France, French-speaking Canada,
 * French-speaking Belgium, Denmark, Finland, Sweden...
 *
 * @category Instances
 */
export const frenchStyleUngroupedNumber: Type = pipe(frenchStyleNumber, withoutThousandSeparator);

/**
 * French-style integer `MNumberBase10Format` instance. Used in countries like France, French-
 * speaking Canada, French-speaking Belgium, Denmark, Finland, Sweden...
 *
 * @category Instances
 */
export const frenchStyleInteger: Type = pipe(frenchStyleNumber, withMaxNDecimals(0));

/**
 * `MNumberBase10Format` instance that uses a comma as fractional separator, a dot as thousand
 * separator and shows at most three fractional digits. Used in countries like Dutch-speaking
 * Belgium, the Netherlands, Germany, Italy, Norway, Croatia, Spain...
 *
 * @category Instances
 */
export const dutchStyleNumber: Type = pipe(
  frenchStyleNumber,
  MStruct.append({
    thousandSeparator: '.',
  }),
  make,
);

/**
 * `MNumberBase10Format` instance that uses a comma as fractional separator, no thousand separator
 * and shows at most three fractional digits. Used in countries like Dutch-speaking Belgium, the
 * Netherlands, Germany, Italy, Norway, Croatia, Spain...
 *
 * @category Instances
 */
export const dutchStyleUngroupedNumber: Type = pipe(dutchStyleNumber, withoutThousandSeparator);

/**
 * Dutch-style integer `MNumberBase10Format` instance. Used in countries like Dutch-speaking
 * Belgium, the Netherlands, Germany, Italy, Norway, Croatia, Spain...
 *
 * @category Instances
 */
export const dutchStyleInteger: Type = pipe(dutchStyleNumber, withMaxNDecimals(0));

/**
 * `MNumberBase10Format` instance that uses a dot as fractional separator, a comma as thousand
 * separator and shows at most three fractional digits. Used in countries like the UK, the US,
 * English-speaking Canada, Australia, Thaïland, Bosnia...
 *
 * @category Instances
 */
export const ukStyleNumber: Type = pipe(
  frenchStyleNumber,
  MStruct.append({
    fractionalSeparator: '.',
    thousandSeparator: ',',
  }),
  make,
);

/**
 * `MNumberBase10Format` instance that uses a dot as fractional separator, no thousand separator and
 * shows at most three fractional digits. Used in countries like the UK, the US, English- speaking
 * Canada, Australia, Thaïland, Bosnia...
 *
 * @category Instances
 */
export const ukStyleUngroupedNumber: Type = pipe(ukStyleNumber, withoutThousandSeparator);

/**
 * Uk-style integer `MNumberBase10Format` instance. Used in countries like the UK, the US, English-
 * speaking Canada, Australia, Thaïland, Bosnia...
 *
 * @category Instances
 */
export const ukStyleInteger: Type = pipe(ukStyleNumber, withMaxNDecimals(0));

/**
 * Integer `MNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const integer: Type = pipe(frenchStyleInteger, withoutThousandSeparator);

/**
 * SignedInteger `MNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const signedInteger: Type = pipe(integer, withSignDisplay);

/**
 * 2-digit signed integer `MNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const twoDigitSignedInteger: Type = pipe(signedInteger, zeroPadded(2));

/**
 * 3-digit signed integer `MNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const threeDigitSignedInteger: Type = pipe(signedInteger, zeroPadded(3));

/**
 * 4-digit signed integer `MNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const fourDigitSignedInteger: Type = pipe(signedInteger, zeroPadded(4));

/**
 * Unsigned integer `MNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const unsignedInteger: Type = pipe(integer, withoutSignDisplay);

/**
 * 2-digit unsigned integer `MNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const twoDigitUnsignedInteger: Type = pipe(unsignedInteger, zeroPadded(2));

/**
 * 3-digit unsigned integer `MNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const threeDigitUnsignedInteger: Type = pipe(unsignedInteger, zeroPadded(3));

/**
 * 4-digit unsigned integer `MNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const fourDigitUnsignedInteger: Type = pipe(unsignedInteger, zeroPadded(4));
