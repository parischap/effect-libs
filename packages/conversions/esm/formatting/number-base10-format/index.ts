/**
 * This module implements a `CVNumberBase10Format` which describes the possible options to
 * format/parse a base-10 number or `BigDecimal` and implements the formatting/parsing algortithms
 */

import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal'
import * as MBigInt from '@parischap/effect-lib/MBigInt'
import * as MData from '@parischap/effect-lib/MData'
import * as MFunction from '@parischap/effect-lib/MFunction'
import * as MMatch from '@parischap/effect-lib/MMatch'
import * as MPredicate from '@parischap/effect-lib/MPredicate'
import * as MRegExpString from '@parischap/effect-lib/MRegExpString'
import * as MString from '@parischap/effect-lib/MString'
import * as MStruct from '@parischap/effect-lib/MStruct'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {flow, pipe} from 'effect'
import * as Array from 'effect/Array'
import * as BigDecimal from 'effect/BigDecimal'
import * as Either from 'effect/Either'
import * as Function from 'effect/Function'
import * as Option from 'effect/Option'
import * as Predicate from 'effect/Predicate'
import * as String from 'effect/String'
import * as Struct from 'effect/Struct'
import * as Tuple from 'effect/Tuple'
import * as CVScientificNotationMantissaAdjuster from '../../internal/formatting/number-base10-format/number-base10-format-scientific-notation-option/ScientificNotationMantissaAdjuster.js';
import * as CVSignFormatter from '../../internal/formatting/number-base10-format/number-base10-format-sign-display-option/SignFormatter.js';
import * as CVReal from '../../primitive/Real.js';
import * as CVRounder from '../../rounding/Rounder.js';
import * as CVRounderParams from '../../rounding/RounderParams.js';
import * as CVRoundingOption from '../../rounding/rounding-option/index.js';
import * as CVNumberBase10FormatScientificNotationOption from './number-base10-format-scientific-notation-option/index.js';
import * as CVNumberBase10FormatSignDisplayOption from './number-base10-format-sign-display-option/index.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/formatting/number-base10-format/';
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
   * Minimim number of characters forming the integer part of a number. Must be a positive integer
   * (>=0). Will not throw otherwise but unexpected results might occur.
   *
   * Formatting: the integer part will be left-padded with `fillChar`'s if necessary to respect the
   * condition. The padding takes place between the sign and the number (or to the left of the
   * number if there is no sign)
   *
   * Parsing: the size of the padding must be equal to max(0, minimumIntegerPartLength -
   * integerPartLength)
   */
  readonly minimumIntegerPartLength: number;

  /**
   * Character that can be used to left-pad a number. Must be a one-character string. Will not throw
   * otherwise but unexpected results might occur.
   */
  readonly fillChar: string;

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

  /** Rounding mode options. See CVRoundingOption.ts */
  readonly roundingOption: CVRoundingOption.Type;

  /** Sign display options. See CVNumberBase10FormatSignDisplayOption.ts */
  readonly signDisplayOption: CVNumberBase10FormatSignDisplayOption.Type;

  /** Class constructor */
  private constructor({
    thousandSeparator,
    fractionalSeparator,
    showNullIntegerPart,
    minimumIntegerPartLength,
    fillChar,
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
    this.minimumIntegerPartLength = minimumIntegerPartLength;
    this.fillChar = fillChar;
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
 * Returns the `minimumIntegerPartLength`property of `self`
 *
 * @category Destructors
 */
export const minimumIntegerPartLength: MTypes.OneArgFunction<Type, number> = Struct.get(
  'minimumIntegerPartLength',
);

/**
 * Returns the `fillChar` property of `self`
 *
 * @category Destructors
 */
export const fillChar: MTypes.OneArgFunction<Type, string> = Struct.get('fillChar');

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
 * Returns a short description of `self`, e.g. 'signed integer'
 *
 * @category Destructors
 */
export const toDescription = (self: Type): string => {
  const {
    minimumIntegerPartLength,
    fillChar,
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
    (minimumIntegerPartLength > 0 ? `${fillChar}-left-padded` : '')
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
 * Returns a function that tries to format a `number` respecting the options represented by `self`.
 * If successful, that function returns a `Some` of the formatted number. Otherwise, it returns a
 * `None`. `number` can be of type number or `BigDecimal` for better accuracy. There is a difference
 * between number and `BigDecimal` (and bigint) regarding the sign of 0. In Javascript,
 * Object.is(0,-0) is false whereas Object.is(0n,-0n) is true. So if the sign of zero is important
 * to you, prefer passing a number to the function. `0` as a BigDecimal will always be interpreted
 * as a positive `0` as we have no means of knowing if it is negative or positive
 *
 * @category Formatting
 */
export const toNumberFormatter = (
  self: Type,
): MTypes.OneArgFunction<BigDecimal.BigDecimal | CVReal.Type, string> => {
  const rounder =
    self.maximumFractionalDigits === Infinity ?
      Function.identity
    : pipe(
        {
          precision: self.maximumFractionalDigits,
          roundingOption: self.roundingOption,
        },
        CVRounderParams.make,
        CVRounder.bigDecimal,
      );
  const signFormatter = CVSignFormatter.fromSignDisplayOption(self.signDisplayOption);
  const mantissaAdjuster = CVScientificNotationMantissaAdjuster.fromScientificNotationOption(
    self.scientificNotationOption,
  );
  const hasThousandSeparator = self.thousandSeparator !== '';
  const eNotationChar = pipe(
    self.eNotationChars,
    Array.get(0),
    Option.getOrElse(MFunction.constEmptyString),
  );

  const padder = String.padStart(self.minimumIntegerPartLength, self.fillChar);

  return (number) => {
    const [sign, selfAsBigDecimal] =
      MTypes.isNumber(number) ?
        Tuple.make(
          number < 0 || Object.is(-0, number) ? (-1 as const) : (1 as const),
          BigDecimal.unsafeFromNumber(number),
        )
      : Tuple.make(number.value < 0 ? (-1 as const) : (1 as const), number);

    const [adjusted, exponent] = mantissaAdjuster(selfAsBigDecimal);
    const absRounded = pipe(adjusted, rounder, BigDecimal.abs);
    const [integerPart, fractionalPart] = pipe(
      absRounded,
      MBigDecimal.truncatedAndFollowingParts(),
    );

    const signString = signFormatter({ sign, isZero: BigDecimal.isZero(absRounded) });

    const normalizedFractionalPart = BigDecimal.normalize(fractionalPart);

    const fractionalPartString = pipe(
      normalizedFractionalPart.value,
      Option.liftPredicate(Predicate.not(MBigInt.isZero)),
      Option.map(MString.fromNonNullablePrimitive),
      Option.getOrElse(MFunction.constEmptyString),
      String.padStart(normalizedFractionalPart.scale, '0'),
      String.padEnd(self.minimumFractionalDigits, '0'),
      Option.liftPredicate(String.isNonEmpty),
      Option.map(MString.prepend(self.fractionalSeparator)),
      Option.getOrElse(MFunction.constEmptyString),
    );

    const integerPartString = pipe(
      integerPart.value.toString(),
      MFunction.fIfTrue({
        condition: hasThousandSeparator,
        f: flow(
          MString.splitEquallyRestAtStart(MRegExpString.DIGIT_GROUP_SIZE),
          Array.intersperse(self.thousandSeparator),
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
      Option.map(flow(MString.fromNumber(10), MString.prepend(eNotationChar))),
      Option.getOrElse(MFunction.constEmptyString),
    );

    return `${signString}${padder(integerPartString)}${fractionalPartString}${exponentString}`;
  };
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
