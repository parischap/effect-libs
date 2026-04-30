/**
 * This module implements a `CVDateTimeFormatter`, i.e. an object that can convert a `CVDateTime`
 * into a string according to the passed `CVDateTimeFormat` and `CVDateTimeFormatContext`.
 */

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Record from 'effect/Record';
import * as Result from 'effect/Result';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';

import * as MData from '@parischap/effect-lib/MData';
import * as MFunction from '@parischap/effect-lib/MFunction';
import type * as MInputError from '@parischap/effect-lib/MInputError';
import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MString from '@parischap/effect-lib/MString';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import type * as CVDateTimePartName from '../../internal/formatting/DateTimeFormat/DateTimePartName.js';
import type * as CVDateTimeFormat from './DateTimeFormat.js';
import type * as CVDateTimeFormatContext from './DateTimeFormatContext/DateTimeFormatContext.js';

import * as CVDateTime from '../../DateTime/DateTime.js';
import * as CVDateTimeFormatParts from '../../internal/formatting/DateTimeFormat/DateTimeFormatParts.js';
import * as CVTemplateFormatter from '../template/TemplateFormatter.js';
import * as CVTemplatePart from '../template/TemplatePart/TemplatePart.js';
import * as CVTemplatePlaceholder from '../template/TemplatePart/TemplatePlaceholder/TemplatePlaceholder.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/formatting/DateTimeFormat/DateTimeFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a CVDateTimeFormatter
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Name of this CVDateTimeFormatter */
  readonly name: string;

  /** Function that tries to format a CVDateTime into a string */
  readonly format: MTypes.OneArgFunction<CVDateTime.Type, Result.Result<string, MInputError.Type>>;

  /** Same as `format` but throws instead of returning a `Failure` in case of failure. */
  readonly formatOrThrow: MTypes.OneArgFunction<CVDateTime.Type, string>;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.name;
    };
  }

  /** Class constructor */
  private constructor({ name, format, formatOrThrow }: MTypes.Data<Type>) {
    super();
    this.name = name;
    this.format = format;
    this.formatOrThrow = formatOrThrow;
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
          Result.fromOption(MFunction.constFailVoid),
        ),
      ),
      Record.fromEntries,
    );

    const format = (d: CVDateTime.Type) =>
      pipe(
        toParts,
        Record.map(Function.apply(d)),
        pipe(
          templateParts,
          Function.tupled(CVTemplateFormatter.fromTemplateParts),
          CVTemplateFormatter.format,
        ),
      );
    return new Type({
      name: pipe(
        dateTimeFormat.name,
        MString.prepend("'"),
        MString.append(`' formatter in '${context.name}' context`),
      ),
      format,
      formatOrThrow: Function.compose(format, Result.getOrThrowWith(Function.identity)),
    });
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Builds a `CVDateTimeFormatter` from a `CVDateTimeFormat` and a `CVDateTimeFormatContext`.
 *
 * @category Constructors
 */
export const make = Type.make.bind(Type);

/**
 * Returns the `name` property of `self`.
 *
 * @category Getters
 */
export const name: MTypes.OneArgFunction<Type, string> = Struct.get('name');

/**
 * Returns the `format` property of `self`.
 *
 * @category Getters
 */
export const format: MTypes.OneArgFunction<Type, Type['format']> = Struct.get('format');

/**
 * Returns the `formatOrThrow` property of `self`.
 *
 * @category Getters
 */
export const formatOrThrow: MTypes.OneArgFunction<Type, Type['formatOrThrow']> =
  Struct.get('formatOrThrow');
