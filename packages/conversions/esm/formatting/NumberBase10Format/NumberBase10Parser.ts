/**
 * This module implements a CVNumberBase10Parser, i.e. an object that can convert a string into a
 * number according to the CVNumberBase10Format that was used to construct it
 */

import { MFunction, MStruct } from '@parischap/effect-lib';
import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
import * as MData from '@parischap/effect-lib/MData';
import * as MNumber from '@parischap/effect-lib/MNumber';
import * as MPredicate from '@parischap/effect-lib/MPredicate';
import * as MRegExpString from '@parischap/effect-lib/MRegExpString';
import * as MString from '@parischap/effect-lib/MString';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { flow, pipe } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';
import * as Function from 'effect/Function';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as String from 'effect/String';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';
import * as CVScientificNotationMantissaValidator from '../../internal/Formatting/NumberBase10Format/NumberBase10FormatScientificNotationOption/ScientificNotationMantissaValidator.js';
import * as CVScientificNotationParser from '../../internal/Formatting/NumberBase10Format/NumberBase10FormatScientificNotationOption/ScientificNotationParser.js';
import * as CVSignParser from '../../internal/Formatting/NumberBase10Format/NumberBase10FormatSignDisplayOption/SignParser.js';
import type * as CVSignString from '../../internal/Formatting/NumberBase10Format/NumberBase10FormatSignDisplayOption/SignString.js';
import * as CVNumberBase10Format from './NumberBase10Format.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/Formatting/NumberBase10Format/NumberBase10Parser/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a CVNumberBase10Parser
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Description of this parser, e.g. 'signed integer parser' */
  readonly description: string;
  /**
   * Function that split a string that represents a number into the different numeric constituents
   * of that number
   */
  readonly getParts: MTypes.OneArgFunction<
    string,
    Option.Option<{
      match: string;
      groups: {
        exponentPart: string;
        padding: string;
        mantissaFractionalPart: string;
        mantissaIntegerPart: string;
        signPart: string;
      };
    }>
  >;
  /** Function that strips a string that represents a base-10 number of its thousand separators */
  readonly removeThousandSeparator: MTypes.StringTransformer;

  /** Function that parses a sign */
  readonly signParser: CVSignParser.Type;

  /** Function that parses an exponent */
  readonly exponentParser: CVScientificNotationParser.Type;

  /**
   * Function that checks the validity of the value of the mantissa regarding the scientific
   * notation option
   */
  readonly scientificNotationMantissaValidator: CVScientificNotationMantissaValidator.Type;

  /** Function that validates the length of the fractional part of the mantissa */
  readonly mantissaFractionalPartLengthValidator: MTypes.OneArgFunction<
    number,
    Option.Option<number>
  >;

  /** Function that validates the length of the integer part (padding included) of the mantissa */
  readonly mantissaIntegerPartAndPaddingLengthValidator: MTypes.OneArgFunction<
    [number, number],
    Option.Option<[number, number]>
  >;

  /**
   * `true` if the CVNumberBase10Format from which `self` is constructed has a padding and the
   * `fillChar` of this padding is the digit `0`. `false` otherwise
   */
  readonly fillCharIsZero: boolean;

  /** Same as CVNumberBase10.showNullIntegerPart */
  readonly showNullIntegerPart: boolean;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return moduleTag;
  }

  /** Class constructor */
  private constructor({
    description,
    getParts,
    removeThousandSeparator,
    signParser,
    exponentParser,
    scientificNotationMantissaValidator,
    mantissaFractionalPartLengthValidator,
    mantissaIntegerPartAndPaddingLengthValidator,
    fillCharIsZero,
    showNullIntegerPart,
  }: MTypes.Data<Type>) {
    super();
    this.description = description;
    this.getParts = getParts;
    this.removeThousandSeparator = removeThousandSeparator;
    this.signParser = signParser;
    this.exponentParser = exponentParser;
    this.scientificNotationMantissaValidator = scientificNotationMantissaValidator;
    this.mantissaFractionalPartLengthValidator = mantissaFractionalPartLengthValidator;
    this.mantissaIntegerPartAndPaddingLengthValidator =
      mantissaIntegerPartAndPaddingLengthValidator;
    this.fillCharIsZero = fillCharIsZero;
    this.showNullIntegerPart = showNullIntegerPart;
  }

  /** Static constructor */
  static fromFormat(format: CVNumberBase10Format.Type): Type {
    return new Type({
      description: `${CVNumberBase10Format.toDescription(format)} parser`,
      getParts: MString.matchWithCapturingGroups(
        pipe(
          format,
          MStruct.append({
            fillChar: Option.match(format.integerPartPadding, {
              onNone: MFunction.constEmptyString,
              onSome: Struct.get('fillChar'),
            }),
          }),
          MRegExpString.base10Number,
          MRegExpString.atStart,
          RegExp,
        ),
        ['signPart', 'padding', 'mantissaIntegerPart', 'mantissaFractionalPart', 'exponentPart'],
      ),
      removeThousandSeparator: MString.removeNCharsEveryMCharsFromRight({
        m: MRegExpString.DIGIT_GROUP_SIZE,
        n: format.thousandSeparator.length,
      }),
      signParser: CVSignParser.fromSignDiplayOption(format.signDisplayOption),
      exponentParser: CVScientificNotationParser.fromScientificNotationOption(
        format.scientificNotationOption,
      ),
      scientificNotationMantissaValidator:
        CVScientificNotationMantissaValidator.fromScientificNotationOption(
          format.scientificNotationOption,
        ),
      mantissaFractionalPartLengthValidator: Option.liftPredicate(
        Number.between({
          minimum: format.minimumFractionalDigits,
          maximum: format.maximumFractionalDigits,
        }),
      ),
      mantissaIntegerPartAndPaddingLengthValidator: Option.match(format.integerPartPadding, {
        onNone: () => Option.some,
        onSome: ({ length }) =>
          Option.liftPredicate(flow(Number.sumAll, MPredicate.strictEquals(length))),
      }),
      fillCharIsZero: Option.match(format.integerPartPadding, {
        onNone: Function.constFalse,
        onSome: ({ fillChar }) => fillChar === '0',
      }),
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
 * The sign is kept apart from the value because for numbers -0 is different from 0 which is not the
 * case for BigDecimal's. So if we multiply the value by the sign, we lose that informations
 */
const _bigDecimalExtractor =
  (self: Type) =>
  (
    input: string,
  ): Option.Option<{ value: BigDecimal.BigDecimal; match: string; sign: -1 | 1; input: string }> =>
    Option.gen(function* () {
      const {
        match,
        groups: { signPart, padding, mantissaIntegerPart, mantissaFractionalPart, exponentPart },
      } = yield* self.getParts(input);

      const validatedMantissaFractionalPartLength =
        yield* self.mantissaFractionalPartLengthValidator(mantissaFractionalPart.length);

      const [validatedMantissaIntegerPartLength, validatedPaddingLength] =
        yield* self.mantissaIntegerPartAndPaddingLengthValidator(
          Tuple.make(mantissaIntegerPart.length, padding.length),
        );

      const isInteger = validatedMantissaFractionalPartLength === 0;

      const mantissa = yield* pipe(
        validatedMantissaIntegerPartLength,
        Option.liftPredicate(Number.greaterThan(0)),
        Option.as(mantissaIntegerPart),
        Option.match({
          // No integer part
          onNone: () =>
            (
              (!self.showNullIntegerPart && !isInteger)
              || (self.fillCharIsZero && validatedPaddingLength > 0)
            ) ?
              Option.some(MBigDecimal.zero)
            : Option.none(),
          // With integer part
          onSome: flow(
            self.showNullIntegerPart || isInteger ?
              Option.some
            : Option.liftPredicate(Predicate.not(MPredicate.strictEquals('0'))),
            Option.map(flow(self.removeThousandSeparator, MBigDecimal.fromPrimitiveOrThrow(0))),
          ),
        }),
        Option.map(
          BigDecimal.sum(
            pipe(
              mantissaFractionalPart,
              Option.liftPredicate(String.isNonEmpty),
              Option.map(MBigDecimal.fromPrimitiveOrThrow(validatedMantissaFractionalPartLength)),
              Option.getOrElse(Function.constant(MBigDecimal.zero)),
            ),
          ),
        ),
      );
      const validatedMantissa = yield* self.scientificNotationMantissaValidator(mantissa);
      const sign = yield* self.signParser({
        isZero: BigDecimal.isZero(validatedMantissa),
        sign: signPart as CVSignString.Type,
      });
      const exponent = yield* self.exponentParser(exponentPart);

      return {
        value: BigDecimal.make(validatedMantissa.value, validatedMantissa.scale - exponent),
        match,
        sign,
        input,
      };
    });

const _numberExtractor: (
  self: Type,
) => (input: string) => Option.Option<{ value: number; match: string; input: string }> = flow(
  _bigDecimalExtractor,
  Function.compose(
    Option.flatMap(({ value, match, sign, input }) =>
      Option.gen(function* () {
        const valueAsNumber = sign * (yield* MNumber.fromBigDecimalOption(value));
        return { value: valueAsNumber, match, input };
      }),
    ),
  ),
);

/**
 * Tries to extract, from the start of a string `text`, a number respecting the options represented
 * by the CVNumberBase10Format from which `self` was constructed. If successful, returns a `some`
 * containing the extracted `value` (`parsedText` converted to a BigDecimal value) and `parsedText`
 * (the part of `text` that could be analyzed as representing a number). Otherwise, it returns a
 * `none`. As `BigDecimal`'s provide no possibility to distinguish `-0n` and `0n`, parsing '-0',
 * '0', '+0' will yield the same result
 *
 * @category Parsing
 */

export const extractAsBigDecimal: MTypes.OneArgFunction<
  Type,
  MTypes.OneArgFunction<string, Option.Option<MTypes.Pair<BigDecimal.BigDecimal, string>>>
> = flow(
  _bigDecimalExtractor,
  Function.compose(
    Option.map(({ value, match, sign }) =>
      Tuple.make(BigDecimal.multiply(value, BigDecimal.unsafeFromNumber(sign)), match),
    ),
  ),
);

/**
 * Same as `extractAsBigDecimal` but throws in case of failure
 *
 * @category Parsing
 */

export const extractAsBigDecimalOrThrow = (
  self: Type,
): MTypes.OneArgFunction<string, MTypes.Pair<BigDecimal.BigDecimal, string>> => {
  const extractor = extractAsBigDecimal(self);
  return (text) =>
    pipe(
      text,
      extractor,
      Option.getOrThrowWith(
        () => new Error(`A BigDecimal could not be parsed from the start of '${text}'`),
      ),
    );
};

/**
 * Same as `extractAsBigDecimal` but returns a number. This is the most usual use case. Furthermore,
 * this function will return `-0` if your parse '-0' and `0` if you parse '0' or '+0'.
 *
 * @category Parsing
 */
export const extractAsNumber: MTypes.OneArgFunction<
  Type,
  MTypes.OneArgFunction<string, Option.Option<MTypes.Pair<number, string>>>
> = flow(
  _numberExtractor,
  Function.compose(Option.map(({ value, match }) => Tuple.make(value, match))),
);

/**
 * Same as `extractAsNumber` but throws in case of failure
 *
 * @category Parsing
 */

export const extractAsNumberOrThrow =
  (self: Type) =>
  (text: string): MTypes.Pair<number, string> => {
    const extractor = extractAsNumber(self);
    return pipe(
      text,
      extractor,
      Option.getOrThrowWith(
        () => new Error(`A Real could not be parsed from the start of '${text}'`),
      ),
    );
  };

/**
 * Same as `extractAsBigDecimal` but the whole of the input text must represent a number, not just
 * its start. `parsedText` does not need to be returned since it is equal to the input text
 *
 * @category Parsing
 */
export const parseAsBigDecimal: MTypes.OneArgFunction<
  Type,
  MTypes.OneArgFunction<string, Option.Option<BigDecimal.BigDecimal>>
> = flow(
  _bigDecimalExtractor,
  Function.compose(
    flow(
      Option.filter(({ match, input }) => match.length === input.length),
      Option.map(Struct.get('value')),
    ),
  ),
);

/**
 * Same as `parseAsBigDecimal` but the returned parser throws in case of failure
 *
 * @category Parsing
 */

export const parseAsBigDecimalOrThrow =
  (self: Type) =>
  (text: string): BigDecimal.BigDecimal => {
    const parser = parseAsBigDecimal(self);
    return pipe(
      text,
      parser,
      Option.getOrThrowWith(() => new Error(`A BigDecimal could not be parsed from '${text}'`)),
    );
  };

/**
 * Same as `extractAsNumber` but the whole of the input text must represent a number, not just its
 * start. `parsedText` does not need to be returned since it is equal to the input text
 *
 * @category Parsing
 */
export const parseAsNumber: MTypes.OneArgFunction<
  Type,
  MTypes.OneArgFunction<string, Option.Option<number>>
> = flow(
  _numberExtractor,
  Function.compose(
    flow(
      Option.filter(({ match, input }) => match.length === input.length),
      Option.map(Struct.get('value')),
    ),
  ),
);

/**
 * Same as `parseAsNumber` but throws in case of failure
 *
 * @category Parsing
 */

export const parseAsNumberOrThrow =
  (self: Type) =>
  (text: string): number => {
    const parser = parseAsNumber(self);
    return pipe(
      text,
      parser,
      Option.getOrThrowWith(() => new Error(`A Real could not be parsed from '${text}'`)),
    );
  };
