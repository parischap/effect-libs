/**
 * This module implements a `CVTemplate` (see Template.ts) dedicated to parsing and formatting
 * dates. It supports many of the available unicode tokens (see
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).
 */

import * as MData from '@parischap/effect-lib/MData';
import * as MInputError from '@parischap/effect-lib/MInputError';
import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MString from '@parischap/effect-lib/MString';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Either from 'effect/Either';
import * as Function from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Option from 'effect/Option';
import * as Record from 'effect/Record';
import * as Tuple from 'effect/Tuple';
import * as CVDateTime from '../../DateTime/DateTime.js';
import * as CVDateTimeParts from '../../DateTime/DateTimeParts.js';
import * as CVDateTimeFormatParts from '../../internal/Formatting/DateTimeFormat/DateTimeFormatParts.js';
import * as CVDateTimePartName from '../../internal/Formatting/DateTimeFormat/DateTimePartName.js';
import * as CVTemplate from '../Template/Template.js';
import * as CVTemplatePart from '../Template/TemplatePart/TemplatePart.js';
import * as CVTemplatePlaceholder from '../Template/TemplatePart/TemplatePlaceholder/TemplatePlaceholder.js';
import * as CVTemplateSeparator from '../Template/TemplatePart/TemplateSeparator/TemplateSeparator.js';
import * as CVDateTimeFormatContext from './DateTimeFormatContext/DateTimeFormatContext.js';
import * as CVDateTimeFormatPart from './DateTimeFormatPart/DateTimeFormatPart.js';
import * as CVDateTimeFormatPartPlaceholder from './DateTimeFormatPart/DateTimeFormatPlaceholder.js';
import * as CVDateTimeFormatToken from './DateTimeFormatToken.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/Formatting/DateTimeFormat/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a CVDateTimeFormat
 *
 * @category Models
 */
export class Type extends MData.Class {
  // Name of this CVDateTimeFormat
  readonly name: string;

  // Template that will be used tp format/parse `self`
  readonly template: CVTemplate.Type<Record<CVDateTimePartName.Type, number>>;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.name;
    };
  }

  /** Class constructor */
  private constructor({ name, template }: MTypes.Data<Type>) {
    super();
    this.name = name;
    this.template = template;
  }

  /** Static constructor */
  static make({
    context,
    parts,
  }: {
    readonly context: CVDateTimeFormatContext.Type;
    readonly parts: CVDateTimeFormatParts.Type;
  }): Type {
    const getter = (
      name: CVDateTimeFormatToken.Type,
    ): CVTemplatePlaceholder.Type<CVDateTimePartName.Type, number> =>
      pipe(
        context.tokenMap,
        HashMap.get(name),
        Option.getOrThrowWith(
          () => new Error(`Abnormal error: no TemplatePart was defined with name '${name}'`),
        ),
      );

    const template: CVTemplate.Type<Record<CVDateTimePartName.Type, number>> = pipe(
      parts,
      Array.map(
        flow(
          MMatch.make,
          MMatch.when(
            CVDateTimeFormatPart.isPlaceholder,
            flow(CVDateTimeFormatPartPlaceholder.name, getter),
          ),
          MMatch.when(CVDateTimeFormatPart.isSeparator, ({ value }) =>
            CVTemplateSeparator.make(value),
          ),
          MMatch.exhaustive,
        ),
      ),
      Function.tupled(CVTemplate.make) as never,
    );

    return new Type({
      name: pipe(
        parts,
        Array.map((p) => p.toString()),
        Array.join(''),
        MString.prepend("'"),
        MString.append(`' in '${context.name}' context`),
      ),
      template: template,
    });
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Builds a DateTimeFormat from a CVDateTimeFormatContext `context` and an array of
 * CVDateTimeFormatPart's `parts`
 *
 * @category Constructors
 */
export const make = (params: {
  readonly context: CVDateTimeFormatContext.Type;
  readonly parts: CVDateTimeFormatParts.Type;
}): Type => Type.make(params);

/**
 * Returns a function that parses a text into a CVDateTime according to 'self'. See
 * CVDateTime.fromParts for more information on default values and errors.
 *
 * @category Parsing
 */

export const toParser = (
  self: Type,
): MTypes.OneArgFunction<string, Either.Either<CVDateTime.Type, MInputError.Type>> => {
  return flow(
    CVTemplate.toParser(self.template),
    Either.flatMap((o) => CVDateTime.fromParts(o as CVDateTimeParts.Type)),
  );
};

/**
 * Same as toParser but the returned parser returns directly a CVDateTime or throws in case of
 * failure
 *
 * @category Parsing
 */
export const toThrowingParser: MTypes.OneArgFunction<
  Type,
  MTypes.OneArgFunction<string, CVDateTime.Type>
> = flow(toParser, Function.compose(Either.getOrThrowWith(Function.identity)));

/**
 * Returns a function that formats a DateTime according to 'self'.
 *
 * @category Formatting
 */

export const toFormatter = (
  self: Type,
): MTypes.OneArgFunction<CVDateTime.Type, Either.Either<string, MInputError.Type>> => {
  const toParts: Record.ReadonlyRecord<
    string,
    MTypes.OneArgFunction<CVDateTime.Type, number>
  > = pipe(
    self.template.templateParts,
    Array.filterMap(
      flow(
        MMatch.make,
        MMatch.when(CVTemplatePart.isSeparator, () => Option.none()),
        MMatch.when(
          CVTemplatePart.isPlaceholder,
          flow(
            CVTemplatePlaceholder.name,
            MMatch.make,
            flow(
              MMatch.whenIs(
                'year',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getYear), Option.some),
              ),
              MMatch.whenIs(
                'ordinalDay',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getOrdinalDay), Option.some),
              ),
              MMatch.whenIs(
                'month',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getMonth), Option.some),
              ),
              MMatch.whenIs(
                'monthDay',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getMonthDay), Option.some),
              ),
              MMatch.whenIs(
                'isoYear',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getIsoYear), Option.some),
              ),
              MMatch.whenIs(
                'isoWeek',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getIsoWeek), Option.some),
              ),
              MMatch.whenIs(
                'weekday',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getWeekday), Option.some),
              ),
              MMatch.whenIs(
                'hour23',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getHour23), Option.some),
              ),
              MMatch.whenIs(
                'hour11',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getHour11), Option.some),
              ),
            ),
            flow(
              MMatch.whenIs(
                'meridiem',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getMeridiem), Option.some),
              ),
              MMatch.whenIs(
                'minute',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getMinute), Option.some),
              ),
              MMatch.whenIs(
                'second',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getSecond), Option.some),
              ),
              MMatch.whenIs(
                'millisecond',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getMillisecond), Option.some),
              ),
              MMatch.whenIs(
                'zoneHour',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getZoneHour), Option.some),
              ),
              MMatch.whenIs(
                'zoneMinute',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getZoneMinute), Option.some),
              ),
              MMatch.whenIs(
                'zoneSecond',
                flow(Tuple.make, Tuple.appendElement(CVDateTime.getZoneSecond), Option.some),
              ),
            ),
            MMatch.orElse(() => Option.none()),
          ),
        ),
        MMatch.exhaustive,
      ) as MTypes.OneArgFunction<
        CVTemplatePart.Type<string, number>,
        Option.Option<readonly [string, MTypes.OneArgFunction<CVDateTime.Type, number>]>
      >,
    ),
    Record.fromEntries,
  );
  const formatter = CVTemplate.toFormatter(self.template);

  return (d) => pipe(toParts, Record.map(Function.apply(d)), formatter);
};

/**
 * Same as toFormatter but the returned formatter returns directly a string or throws in case of
 * error
 *
 * @category Formatting
 */
export const toThrowingFormatter: MTypes.OneArgFunction<
  Type,
  MTypes.OneArgFunction<CVDateTime.Type, string>
> = flow(toFormatter, Function.compose(Either.getOrThrowWith(Function.identity)));
