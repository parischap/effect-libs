/**
 * This module implements a CVNumberBase10Parser, i.e. an object that can convert a string into a
 * number according to the CVNumberBase10Format that was used to construct it
 */

import { flow, pipe } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';
import * as BigInt from 'effect/BigInt';
import * as Function from 'effect/Function';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as String from 'effect/String';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';

import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
import * as MData from '@parischap/effect-lib/MData';
import * as MFunction from '@parischap/effect-lib/MFunction';
import * as MNumber from '@parischap/effect-lib/MNumber';
import * as MPredicate from '@parischap/effect-lib/MPredicate';
import * as MRegExpString from '@parischap/effect-lib/MRegExpString';
import * as MString from '@parischap/effect-lib/MString';
import * as MStruct from '@parischap/effect-lib/MStruct';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import type * as CVSignString from '../../internal/formatting/NumberBase10Format/NumberBase10FormatSignDisplayOption/SignString.js';

import * as CVScientificNotationMantissaValidator from '../../internal/formatting/NumberBase10Format/NumberBase10FormatScientificNotationOption/ScientificNotationMantissaValidator.js';
import * as CVScientificNotationParser from '../../internal/formatting/NumberBase10Format/NumberBase10FormatScientificNotationOption/ScientificNotationParser.js';
import * as CVSignParser from '../../internal/formatting/NumberBase10Format/NumberBase10FormatSignDisplayOption/SignParser.js';
import * as CVNumberBase10Format from './NumberBase10Format.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/formatting/NumberBase10Format/NumberBase10Parser/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a CVNumberBase10Parser
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Description of this parser, e.g. 'signed integer parser */
  readonly description: string;

  private readonly bigDecimalExtractor: (
    input: string,
  ) => Option.Option<{ value: BigDecimal.BigDecimal; match: string; sign: -1 | 1; input: string }>;
  private readonly numberExtractor: (
    input: string,
  ) => Option.Option<{ value: number; match: string; input: string }>;

  /**
   * Function that tries to extract, from the start of a string `text`, a number respecting the
   * options represented by the CVNumberBase10Format from which `this` was constructed. If
   * successful, returns a `some` containing the extracted `value` (`parsedText` converted to a
   * BigDecimal value) and `parsedText` (the part of `text` that could be analyzed as representing a
   * number). Otherwise, it returns a `none`. As `BigDecimal`'s provide no possibility to
   * distinguish `-0n` and `0n`, parsing '-0', '0', '+0' will yield the same result
   */
  private extractAsBigDecimal: Option.Option<Type['_extractAsBigDecimal']>;

  /** Same as `extractAsBigDecimal` but throws in case of failure */
  private extractAsBigDecimalOrThrow: Option.Option<Type['_extractAsBigDecimalOrThrow']>;

  /**
   * Same as `extractAsBigDecimal` but returns a number. This is the most usual use case.
   * Furthermore, this function will return `-0` if your parse '-0' and `0` if you parse '0' or
   * '+0'.
   */
  private extractAsNumber: Option.Option<Type['_extractAsNumber']>;

  /** Same as `extractAsNumber` but throws in case of failure */
  private extractAsNumberOrThrow: Option.Option<Type['_extractAsNumberOrThrow']>;

  /**
   * Same as `extractAsBigDecimal` but the whole of the input text must represent a number, not just
   * its start. `parsedText` does not need to be returned since it is equal to the input text
   */
  private parseAsBigDecimal: Option.Option<Type['_parseAsBigDecimal']>;

  /** Same as `parseAsBigDecimal` but the returned parser throws in case of failure */
  private parseAsBigDecimalOrThrow: Option.Option<Type['_parseAsBigDecimalOrThrow']>;

  /**
   * Same as `extractAsNumber` but the whole of the input text must represent a number, not just its
   * start. `parsedText` does not need to be returned since it is equal to the input text
   */
  private parseAsNumber: Option.Option<Type['_parseAsNumber']>;

  /** Same as `parseAsNumber` but throws in case of failure */
  private parseAsNumberOrThrow: Option.Option<Type['_parseAsNumberOrThrow']>;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.description;
    };
  }

  /** Class constructor */
  constructor(numberFormat: CVNumberBase10Format.Type) {
    super();
    this.description = `${CVNumberBase10Format.toDescription(numberFormat)} parser`;

    const getParts = MString.matchWithCapturingGroups(
      pipe(
        numberFormat,
        MStruct.append({
          fillChar: Option.match(numberFormat.integerPartPadding, {
            onNone: MFunction.constEmptyString,
            onSome: Struct.get('fillChar'),
          }),
        }),
        MRegExpString.base10Number,
        MRegExpString.atStart,
        RegExp,
      ),
      ['signPart', 'padding', 'mantissaIntegerPart', 'mantissaFractionalPart', 'exponentPart'],
    );
    const removeThousandSeparator = MString.removeNCharsEveryMCharsFromRight({
      m: MRegExpString.DIGIT_GROUP_SIZE,
      n: numberFormat.thousandSeparator.length,
    });
    const signParser = CVSignParser.fromSignDisplayOption(numberFormat.signDisplayOption);
    const exponentParser = CVScientificNotationParser.fromScientificNotationOption(
      numberFormat.scientificNotationOption,
    );
    const scientificNotationMantissaValidator =
      CVScientificNotationMantissaValidator.fromScientificNotationOption(
        numberFormat.scientificNotationOption,
      );
    const mantissaFractionalPartLengthValidator = Option.liftPredicate(
      Number.between({
        minimum: numberFormat.minimumFractionalDigits,
        maximum: numberFormat.maximumFractionalDigits,
      }),
    );
    const mantissaIntegerPartAndPaddingLengthValidator: MTypes.OneArgFunction<
      [mantissaIntegerPartLength: number, paddingLength: number],
      Option.Option<[mantissaIntegerPartLength: number, paddingLength: number]>
    > = Option.match(numberFormat.integerPartPadding, {
      onNone: () => Option.some,
      onSome: ({ length }) =>
        Option.liftPredicate(flow(Number.sumAll, MPredicate.strictEquals(length))),
    });
    const fillCharIsZero = Option.match(numberFormat.integerPartPadding, {
      onNone: Function.constFalse,
      onSome: ({ fillChar }) => fillChar === '0',
    });
    const { showNullIntegerPart } = numberFormat;

    /* The sign is kept apart from the value because for numbers -0 is different from 0 which is not the case for BigDecimal's. So if we multiply the value by the sign, we lose that informations */
    this.bigDecimalExtractor = (
      input: string,
    ): Option.Option<{
      value: BigDecimal.BigDecimal;
      match: string;
      sign: -1 | 1;
      input: string;
    }> =>
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
                Option.liftPredicate(String.isNonEmpty),
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
          sign: signPart as CVSignString.Type,
        });
        const exponent = yield* exponentParser(exponentPart);

        return {
          value: BigDecimal.make(validatedMantissa.value, validatedMantissa.scale - exponent),
          match,
          sign,
          input,
        };
      });

    this.numberExtractor = Function.compose(
      this.bigDecimalExtractor,
      Option.flatMap(({ value, match, sign, input }) =>
        Option.gen(function* () {
          const valueAsNumber = sign * (yield* MNumber.fromBigDecimalOption(value));
          return { value: valueAsNumber, match, input };
        }),
      ),
    );

    this.extractAsBigDecimal = Option.none();
    this.extractAsBigDecimalOrThrow = Option.none();
    this.extractAsNumber = Option.none();
    this.extractAsNumberOrThrow = Option.none();
    this.parseAsBigDecimal = Option.none();
    this.parseAsBigDecimalOrThrow = Option.none();
    this.parseAsNumber = Option.none();
    this.parseAsNumberOrThrow = Option.none();
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }

  get _extractAsBigDecimal(): MTypes.OneArgFunction<
    string,
    Option.Option<MTypes.Pair<BigDecimal.BigDecimal, string>>
  > {
    return Option.getOrElse(this.extractAsBigDecimal, () =>
      Function.compose(
        this.bigDecimalExtractor,
        Option.map(({ value, match, sign }) =>
          Tuple.make(BigDecimal.multiply(value, BigDecimal.fromNumberUnsafe(sign)), match),
        ),
      ),
    );
  }

  get _extractAsBigDecimalOrThrow(): MTypes.OneArgFunction<
    string,
    MTypes.Pair<BigDecimal.BigDecimal, string>
  > {
    return Option.getOrElse(
      this.extractAsBigDecimalOrThrow,
      () => (text: string) =>
        pipe(
          text,
          this._extractAsBigDecimal,
          Option.getOrThrowWith(
            () => new Error(`A BigDecimal could not be parsed from the start of '${text}'`),
          ),
        ),
    );
  }

  get _extractAsNumber(): MTypes.OneArgFunction<
    string,
    Option.Option<MTypes.Pair<number, string>>
  > {
    return Option.getOrElse(this.extractAsNumber, () =>
      Function.compose(
        this.numberExtractor,
        Option.map(({ value, match }) => Tuple.make(value, match)),
      ),
    );
  }

  get _extractAsNumberOrThrow(): MTypes.OneArgFunction<string, MTypes.Pair<number, string>> {
    return Option.getOrElse(
      this.extractAsNumberOrThrow,
      () => (text: string) =>
        pipe(
          text,
          this._extractAsNumber,
          Option.getOrThrowWith(
            () => new Error(`A Real could not be parsed from the start of '${text}'`),
          ),
        ),
    );
  }

  get _parseAsBigDecimal(): MTypes.OneArgFunction<string, Option.Option<BigDecimal.BigDecimal>> {
    return Option.getOrElse(this.parseAsBigDecimal, () =>
      Function.compose(
        this.bigDecimalExtractor,
        flow(
          Option.filter(({ match, input }) => match.length === input.length),
          Option.map(Struct.get('value')),
        ),
      ),
    );
  }

  get _parseAsBigDecimalOrThrow(): MTypes.OneArgFunction<string, BigDecimal.BigDecimal> {
    return Option.getOrElse(
      this.parseAsBigDecimalOrThrow,
      () => (text: string) =>
        pipe(
          text,
          this._parseAsBigDecimal,
          Option.getOrThrowWith(() => new Error(`A BigDecimal could not be parsed from '${text}'`)),
        ),
    );
  }

  get _parseAsNumber(): MTypes.OneArgFunction<string, Option.Option<number>> {
    return Option.getOrElse(this.parseAsNumber, () =>
      Function.compose(
        this.numberExtractor,
        flow(
          Option.filter(({ match, input }) => match.length === input.length),
          Option.map(Struct.get('value')),
        ),
      ),
    );
  }

  get _parseAsNumberOrThrow(): MTypes.OneArgFunction<string, number> {
    return Option.getOrElse(
      this.parseAsNumberOrThrow,
      () => (text: string) =>
        pipe(
          text,
          this._parseAsNumber,
          Option.getOrThrowWith(() => new Error(`A Real could not be parsed from '${text}'`)),
        ),
    );
  }
}

/**
 * Constructor of a CVNumberBase10Parser from a CVNumberBase10Format
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
 * Returns the `extractAsBigDecimal` property of `self`.
 *
 * @category Getters
 */
export const extractAsBigDecimal: MTypes.OneArgFunction<Type, Type['_extractAsBigDecimal']> =
  Struct.get('_extractAsBigDecimal');

/**
 * Returns the `extractAsBigDecimalOrThrow` property of `self`.
 *
 * @category Getters
 */
export const extractAsBigDecimalOrThrow: MTypes.OneArgFunction<
  Type,
  Type['_extractAsBigDecimalOrThrow']
> = Struct.get('_extractAsBigDecimalOrThrow');

/**
 * Returns the `extractAsNumber` property of `self`.
 *
 * @category Getters
 */
export const extractAsNumber: MTypes.OneArgFunction<Type, Type['_extractAsNumber']> =
  Struct.get('_extractAsNumber');

/**
 * Returns the `extractAsNumberOrThrow` property of `self`.
 *
 * @category Getters
 */
export const extractAsNumberOrThrow: MTypes.OneArgFunction<Type, Type['_extractAsNumberOrThrow']> =
  Struct.get('_extractAsNumberOrThrow');

/**
 * Returns the `parseAsBigDecimal` property of `self`.
 *
 * @category Getters
 */
export const parseAsBigDecimal: MTypes.OneArgFunction<Type, Type['_parseAsBigDecimal']> =
  Struct.get('_parseAsBigDecimal');

/**
 * Returns the `parseAsBigDecimalOrThrow` property of `self`.
 *
 * @category Getters
 */
export const parseAsBigDecimalOrThrow: MTypes.OneArgFunction<
  Type,
  Type['_parseAsBigDecimalOrThrow']
> = Struct.get('_parseAsBigDecimalOrThrow');

/**
 * Returns the `parseAsNumber` property of `self`.
 *
 * @category Getters
 */
export const parseAsNumber: MTypes.OneArgFunction<Type, Type['_parseAsNumber']> =
  Struct.get('_parseAsNumber');

/**
 * Returns the `parseAsNumberOrThrow` property of `self`.
 *
 * @category Getters
 */
export const parseAsNumberOrThrow: MTypes.OneArgFunction<Type, Type['_parseAsNumberOrThrow']> =
  Struct.get('_parseAsNumberOrThrow');
