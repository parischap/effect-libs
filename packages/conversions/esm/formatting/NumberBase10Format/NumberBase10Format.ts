/**
 * This module implements a `CVNumberBase10Format` which describes the possible options to
 * format/parse a base-10 number or `BigDecimal` and implements the Formatting/parsing algortithms
 */

import { MPredicate } from '@parischap/effect-lib';
import * as MData from '@parischap/effect-lib/MData';
import * as MFunction from '@parischap/effect-lib/MFunction';
import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MString from '@parischap/effect-lib/MString';
import * as MStruct from '@parischap/effect-lib/MStruct';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { flow, Number, Option, pipe, Predicate } from 'effect';
import * as Function from 'effect/Function';
import * as Struct from 'effect/Struct';
import * as CVRoundingOption from '../../Rounding/RoundingOption/RoundingOption.js';
import * as CVNumberBase10FormatScientificNotationOption from './NumberBase10FormatScientificNotationOption/NumberBase10FormatScientificNotationOption.js';
import * as CVNumberBase10FormatSignDisplayOption from './NumberBase10FormatSignDisplayOption/NumberBase10FormatSignDisplayOption.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/Formatting/NumberBase10Format/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a `CVNumberBase10Format`
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
   *   displayed starting wiyh `0`.
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
   * Minimim number of digits forming the fractional part of a number. Must be a positive integer
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
   * Possible characters to use to represent e-notation. Usually ['e','E']. Must be an array of
   * one-character strings. Will not throw otherwise but unexpected results will occur. Not used if
   * `scientificNotationOption === None`
   *
   * Formatting: the string at index 0 is used
   *
   * Parsing: the first character of the e-notation must be one of the one-character strings present
   * in the array
   */
  readonly eNotationChars: ReadonlyArray<string>;

  /** Scientific notation options. See CVNumberBase10FormatScientificNotationOption */
  readonly scientificNotationOption: CVNumberBase10FormatScientificNotationOption.Type;

  /** Rounding mode options used when formatting. See CVRoundingOption.ts */
  readonly roundingOption: CVRoundingOption.Type;

  /** Sign display options. See CVNumberBase10FormatSignDisplayOption.ts */
  readonly signDisplayOption: CVNumberBase10FormatSignDisplayOption.Type;

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
  protected get [_TypeId](): _TypeId {
    return _TypeId;
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
 * @category Destructors
 */
export const thousandSeparator: MTypes.OneArgFunction<Type, string> =
  Struct.get('thousandSeparator');

/**
 * Returns the `fractionalSeparator` property of `self`
 *
 * @category Destructors
 */
export const fractionalSeparator: MTypes.OneArgFunction<Type, string> =
  Struct.get('fractionalSeparator');

/**
 * Returns the `showNullIntegerPart` property of `self`
 *
 * @category Destructors
 */
export const showNullIntegerPart: MTypes.OneArgFunction<Type, boolean> =
  Struct.get('showNullIntegerPart');

/**
 * Returns the `integerPartPadding`property of `self`
 *
 * @category Destructors
 */
export const integerPartPadding: MTypes.OneArgFunction<Type, IntegerPartPadding> =
  Struct.get('integerPartPadding');

/**
 * Returns the `minimumFractionalDigits` property of `self`
 *
 * @category Destructors
 */
export const minimumFractionalDigits: MTypes.OneArgFunction<Type, number> =
  Struct.get('minimumFractionalDigits');

/**
 * Returns the `maximumFractionalDigits` property of `self`
 *
 * @category Destructors
 */
export const maximumFractionalDigits: MTypes.OneArgFunction<Type, number> =
  Struct.get('maximumFractionalDigits');

/**
 * Returns the `eNotationChar` property of `self`
 *
 * @category Destructors
 */
export const eNotationChars: MTypes.OneArgFunction<Type, ReadonlyArray<string>> = Struct.get(
  'eNotationChars',
);

/**
 * Returns the `scientificNotationOption` property of `self`
 *
 * @category Destructors
 */
export const scientificNotationOption: MTypes.OneArgFunction<
  Type,
  CVNumberBase10FormatScientificNotationOption.Type
> = Struct.get('scientificNotationOption');

/**
 * Returns the `roundingOption` property of `self`
 *
 * @category Destructors
 */
export const roundingOption: MTypes.OneArgFunction<Type, CVRoundingOption.Type> =
  Struct.get('roundingOption');

/**
 * Returns the `signDisplayOption` property of `self`
 *
 * @category Destructors
 */
export const signDisplayOption: MTypes.OneArgFunction<
  Type,
  CVNumberBase10FormatSignDisplayOption.Type
> = Struct.get('signDisplayOption');

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
      MMatch.whenIs(CVNumberBase10FormatSignDisplayOption.Type.Always, () => Option.some(1)),
      MMatch.whenIs(CVNumberBase10FormatSignDisplayOption.Type.Never, () => Option.some(0)),
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
      Option.liftPredicate(
        MPredicate.strictEquals(CVNumberBase10FormatScientificNotationOption.Type.None),
      ),
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
      onSome: flow(Struct.get('fillChar'), MString.append('-left-padded ')),
    })
    + pipe(
      signDisplayOption,
      MMatch.make,
      MMatch.whenIs(
        CVNumberBase10FormatSignDisplayOption.Type.Always,
        Function.constant('signed '),
      ),
      MMatch.whenIs(
        CVNumberBase10FormatSignDisplayOption.Type.Never,
        Function.constant('unsigned '),
      ),
      MMatch.orElse(Function.constant('potentially signed ')),
    )
    + (isUngrouped && isInteger ? ''
    : (isUngrouped || thousandSeparator === ' ') && (fractionalSeparator === ',' || isInteger) ?
      'French-style '
    : thousandSeparator === '.' && (fractionalSeparator === ',' || isInteger) ? 'Dutch-style '
    : (isUngrouped || thousandSeparator === ',') && (fractionalSeparator === '.' || isInteger) ?
      'UK-style '
    : '')
    + (isInteger ? 'integer'
    : minimumFractionalDigits === maximumFractionalDigits ?
      `${MString.fromNumber(10)(minimumFractionalDigits)}-decimal number`
    : 'number')
    + pipe(
      scientificNotationOption,
      MMatch.make,
      MMatch.whenIs(
        CVNumberBase10FormatScientificNotationOption.Type.None,
        MFunction.constEmptyString,
      ),
      MMatch.whenIs(
        CVNumberBase10FormatScientificNotationOption.Type.Standard,
        Function.constant(' in standard scientific notation'),
      ),
      MMatch.whenIs(
        CVNumberBase10FormatScientificNotationOption.Type.Normalized,
        Function.constant(' in normalized scientific notation'),
      ),
      MMatch.whenIs(
        CVNumberBase10FormatScientificNotationOption.Type.Engineering,
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
    scientificNotationOption: CVNumberBase10FormatScientificNotationOption.Type.None,
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
    scientificNotationOption: CVNumberBase10FormatScientificNotationOption.Type.Standard,
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
    scientificNotationOption: CVNumberBase10FormatScientificNotationOption.Type.Normalized,
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
    scientificNotationOption: CVNumberBase10FormatScientificNotationOption.Type.Engineering,
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
    signDisplayOption: CVNumberBase10FormatSignDisplayOption.Type.Auto,
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
    signDisplayOption: CVNumberBase10FormatSignDisplayOption.Type.Always,
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
    signDisplayOption: CVNumberBase10FormatSignDisplayOption.Type.ExceptZero,
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
    signDisplayOption: CVNumberBase10FormatSignDisplayOption.Type.Negative,
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
    signDisplayOption: CVNumberBase10FormatSignDisplayOption.Type.Never,
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
    roundingOption: CVRoundingOption.Type.Ceil,
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
    roundingOption: CVRoundingOption.Type.Floor,
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
    roundingOption: CVRoundingOption.Type.Expand,
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
    roundingOption: CVRoundingOption.Type.Trunc,
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
    roundingOption: CVRoundingOption.Type.HalfCeil,
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
    roundingOption: CVRoundingOption.Type.HalfFloor,
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
    roundingOption: CVRoundingOption.Type.HalfExpand,
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
    roundingOption: CVRoundingOption.Type.HalfTrunc,
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
    roundingOption: CVRoundingOption.Type.HalfEven,
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

const _charPadded =
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
export const zeroPadded: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = _charPadded(
  '0',
);

/**
 * Returns a copy of `self` with `integerPartPadding` set to `n` and `fillChar` set to ` `
 *
 * @category Modifiers
 */
export const spacePadded: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = _charPadded(
  ' ',
);

/**
 * `CVNumberBase10Format` instance that uses a comma as fractional separator, a space as thousand
 * separator and shows at most three fractional digits. Used in countries like France,
 * French-speaking Canada, French-speaking Belgium, Denmark, Finland, Sweden...
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
  scientificNotationOption: CVNumberBase10FormatScientificNotationOption.Type.None,
  roundingOption: CVRoundingOption.Type.HalfExpand,
  signDisplayOption: CVNumberBase10FormatSignDisplayOption.Type.Negative,
  integerPartPadding: Option.none(),
});

/**
 * `CVNumberBase10Format` instance that uses a comma as fractional separator, no thousand separator
 * and shows at most three fractional digits. Used in countries like France, French-speaking Canada,
 * French-speaking Belgium, Denmark, Finland, Sweden...
 *
 * @category Instances
 */
export const frenchStyleUngroupedNumber: Type = pipe(frenchStyleNumber, withoutThousandSeparator);

/**
 * French-style integer `CVNumberBase10Format` instance. Used in countries like France,
 * French-speaking Canada, French-speaking Belgium, Denmark, Finland, Sweden...
 *
 * @category Instances
 */
export const frenchStyleInteger: Type = pipe(frenchStyleNumber, withMaxNDecimals(0));

/**
 * `CVNumberBase10Format` instance that uses a comma as fractional separator, a dot as thousand
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
 * `CVNumberBase10Format` instance that uses a comma as fractional separator, no thousand separator
 * and shows at most three fractional digits. Used in countries like Dutch-speaking Belgium, the
 * Netherlands, Germany, Italy, Norway, Croatia, Spain...
 *
 * @category Instances
 */
export const dutchStyleUngroupedNumber: Type = pipe(dutchStyleNumber, withoutThousandSeparator);

/**
 * Dutch-style integer `CVNumberBase10Format` instance. Used in countries like Dutch-speaking
 * Belgium, the Netherlands, Germany, Italy, Norway, Croatia, Spain...
 *
 * @category Instances
 */
export const dutchStyleInteger: Type = pipe(dutchStyleNumber, withMaxNDecimals(0));

/**
 * `CVNumberBase10Format` instance that uses a dot as fractional separator, a comma as thousand
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
 * `CVNumberBase10Format` instance that uses a dot as fractional separator, no thousand separator
 * and shows at most three fractional digits. Used in countries like the UK, the US,
 * English-speaking Canada, Australia, Thaïland, Bosnia...
 *
 * @category Instances
 */
export const ukStyleUngroupedNumber: Type = pipe(ukStyleNumber, withoutThousandSeparator);

/**
 * Uk-style integer `CVNumberBase10Format` instance. Used in countries like the UK, the US,
 * English-speaking Canada, Australia, Thaïland, Bosnia...
 *
 * @category Instances
 */
export const ukStyleInteger: Type = pipe(ukStyleNumber, withMaxNDecimals(0));

/**
 * Integer `CVNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const integer: Type = pipe(frenchStyleInteger, withoutThousandSeparator);

/**
 * 2-digit integer `CVNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const twoDigitInteger: Type = pipe(integer, zeroPadded(2), withSignDisplay);

/**
 * 3-digit integer `CVNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const threeDigitInteger: Type = pipe(integer, zeroPadded(3), withSignDisplay);

/**
 * 4-digit integer `CVNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const fourDigitInteger: Type = pipe(integer, zeroPadded(4), withSignDisplay);

/**
 * Unsigned integer `CVNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const unsignedInteger: Type = pipe(integer, withoutSignDisplay);

/**
 * 2-digit unsigned integer `CVNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const twoDigitUnsignedInteger: Type = pipe(integer, zeroPadded(2), withoutSignDisplay);

/**
 * 3-digit unsigned integer `CVNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const threeDigitUnsignedInteger: Type = pipe(integer, zeroPadded(3), withoutSignDisplay);

/**
 * 4-digit unsigned integer `CVNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const fourDigitUnsignedInteger: Type = pipe(integer, zeroPadded(4), withoutSignDisplay);
