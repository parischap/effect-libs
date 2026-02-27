/**
 * This module implements a `CVDateTimeFormatter`, i.e. an object that can convert a `CVDateTime`
 * into a string according to the passed `CVDateTimeFormat` and `CVDateTimeFormatContext`.
 */

import { MMatch } from '@parischap/effect-lib';
import * as MData from '@parischap/effect-lib/MData';
import * as MInputError from '@parischap/effect-lib/MInputError';
import * as MString from '@parischap/effect-lib/MString';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { Array, flow, Option, pipe, Struct, Tuple } from 'effect';
import * as Either from 'effect/Either';
import * as Function from 'effect/Function';
import * as Record from 'effect/Record';
import * as CVDateTime from '../../DateTime/DateTime.js';
import * as CVDateTimeFormatParts from '../../internal/Formatting/DateTimeFormat/DateTimeFormatParts.js';
import * as CVDateTimePartName from '../../internal/Formatting/DateTimeFormat/DateTimePartName.js';
import * as CVTemplateFormatter from '../Template/TemplateFormatter.js';
import * as CVTemplatePart from '../Template/TemplatePart/TemplatePart.js';
import * as CVTemplatePlaceholder from '../Template/TemplatePart/TemplatePlaceholder/TemplatePlaceholder.js';
import * as CVDateTimeFormat from './DateTimeFormat.js';
import * as CVDateTimeFormatContext from './DateTimeFormatContext/DateTimeFormatContext.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/Formatting/DateTimeFormat/DateTimeFormatter/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a CVDateTimeFormatter
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Name of this CVDateTimeFormatter */
  readonly name: string;

  /** Function that will be used to format a CVDateTime into a string */
  readonly formatter: MTypes.OneArgFunction<
    CVDateTime.Type,
    Either.Either<string, MInputError.Type>
  >;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.name;
    };
  }

  /** Class constructor */
  private constructor({ name, formatter }: MTypes.Data<Type>) {
    super();
    this.name = name;
    this.formatter = formatter;
  }

  /** Static constructor */
  static make({
    dateTimeFormat,
    context,
  }: {
    readonly dateTimeFormat: CVDateTimeFormat.Type;
    readonly context: CVDateTimeFormatContext.Type;
  }): Type {
    const DateTimePartReader = (
      f: MTypes.OneArgFunction<CVDateTime.Type, number>,
    ): MTypes.OneArgFunction<
      CVDateTimePartName.Type,
      Option.Option<
        MTypes.Pair<CVDateTimePartName.Type, MTypes.OneArgFunction<CVDateTime.Type, number>>
      >
    > => flow(Tuple.make, Tuple.appendElement(f), Option.some);

    const templateParts = pipe(
      dateTimeFormat.parts,
      CVDateTimeFormatParts.toTemplateParts(context),
    );

    const toParts = pipe(
      templateParts,
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
                MMatch.whenIs('year', DateTimePartReader(CVDateTime.getYear)),
                MMatch.whenIs('ordinalDay', DateTimePartReader(CVDateTime.getOrdinalDay)),
                MMatch.whenIs('month', DateTimePartReader(CVDateTime.getMonth)),
                MMatch.whenIs('monthDay', DateTimePartReader(CVDateTime.getMonthDay)),
                MMatch.whenIs('isoYear', DateTimePartReader(CVDateTime.getIsoYear)),
                MMatch.whenIs('isoWeek', DateTimePartReader(CVDateTime.getIsoWeek)),
                MMatch.whenIs('weekday', DateTimePartReader(CVDateTime.getWeekday)),
                MMatch.whenIs('hour23', DateTimePartReader(CVDateTime.getHour23)),
                MMatch.whenIs('hour11', DateTimePartReader(CVDateTime.getHour11)),
              ),
              flow(
                MMatch.whenIs('meridiem', DateTimePartReader(CVDateTime.getMeridiem)),
                MMatch.whenIs('minute', DateTimePartReader(CVDateTime.getMinute)),
                MMatch.whenIs('second', DateTimePartReader(CVDateTime.getSecond)),
                MMatch.whenIs('millisecond', DateTimePartReader(CVDateTime.getMillisecond)),
                MMatch.whenIs('zoneHour', DateTimePartReader(CVDateTime.getZoneHour)),
                MMatch.whenIs('zoneMinute', DateTimePartReader(CVDateTime.getZoneMinute)),
                MMatch.whenIs('zoneSecond', DateTimePartReader(CVDateTime.getZoneSecond)),
              ),
              MMatch.orElse(() => Option.none()),
            ),
          ),
          MMatch.exhaustive,
        ),
      ),
      Record.fromEntries,
    );

    return new Type({
      name: pipe(
        dateTimeFormat.name,
        MString.prepend("'"),
        MString.append(`' formatter in '${context.name}' context`),
      ),
      formatter: (d) =>
        pipe(
          toParts,
          Record.map(Function.apply(d)),
          pipe(
            templateParts,
            Function.tupled(CVTemplateFormatter.fromTemplateParts),
            CVTemplateFormatter.format,
          ),
        ),
    });
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

type Formatter = Type['formatter'];

/**
 * Builds a `CVDateTimeFormatter` from a `CVDateTimeFormat` and a `CVDateTimeFormatContext`.
 *
 * @category Constructors
 */
export const make = (params: {
  readonly dateTimeFormat: CVDateTimeFormat.Type;
  readonly context: CVDateTimeFormatContext.Type;
}): Type => Type.make(params);

/**
 * Returns the `name` property of `self`.
 *
 * @category Getters
 */
export const name: MTypes.OneArgFunction<Type, string> = Struct.get('name');

/**
 * Returns the `formatter` property of `self`.
 *
 * @category Getters
 */
export const formatter: MTypes.OneArgFunction<Type, Formatter> = Struct.get('formatter');

/**
 * Formats a `CVDateTime` into a string.
 *
 * @category Formatting
 */
export const format: MTypes.OneArgFunction<Type, Formatter> = Struct.get('formatter');

/**
 * Same as `format` but throws instead of returning a `Left` in case of failure.
 *
 * @category Formatting
 */
export const formatOrThrow: MTypes.OneArgFunction<
  Type,
  MTypes.OneArgFunction<CVDateTime.Type, string>
> = flow(format, Function.compose(Either.getOrThrowWith(Function.identity)));
