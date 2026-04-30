/**
 * This module implements an object that contains the data relative to the parts of a zone offset
 *
 * Note that ZoneOffsetParts with hour=-0, minute=10, second=0 is different from hour=0, minute=10,
 * second=0. The first corresponds to the string 'GMT-00:10', a negative 10-minute offset, the
 * second one to the string 'GMT+00:10', a positive 10-minute offset
 */

import { pipe } from 'effect';
import * as Function from 'effect/Function';
import * as Result from 'effect/Result';
import * as Struct from 'effect/Struct';

import * as MData from '@parischap/effect-lib/MData';
import * as MInputError from '@parischap/effect-lib/MInputError';
import * as MNumber from '@parischap/effect-lib/MNumber';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import * as CVNumberBase10Format from '../../formatting/NumberBase10Format/NumberBase10Format.js';
import * as CVTemplateFormatter from '../../formatting/template/TemplateFormatter.js';
import * as CVTemplatePlaceholder from '../../formatting/template/TemplatePart/TemplatePlaceholder/TemplatePlaceholder.js';
import * as CVTemplateSeparator from '../../formatting/template/TemplatePart/TemplateSeparator/TemplateSeparator.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/internal/DateTime/ZoneOffsetParts/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

const sep = CVTemplateSeparator;

const formatter = pipe(
  CVTemplateFormatter.fromTemplateParts(
    CVTemplatePlaceholder.number({
      name: 'zoneHour',
      numberBase10Format: CVNumberBase10Format.twoDigitSignedInteger,
    }),
    sep.colon,
    CVTemplatePlaceholder.number({
      name: 'zoneMinute',
      numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
    }),
  ),
  CVTemplateFormatter.format,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * Type that represents a CVZoneOffsetPart
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Hour part, range: [-12,14] */
  readonly zoneHour: number;

  /** Minute part, range: [0, 59] */
  readonly zoneMinute: number;

  /** Second part, range: [0, 59] */
  readonly zoneSecond: number;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return moduleTag;
  }

  /** Class constructor */
  constructor({ zoneHour, zoneMinute, zoneSecond }: MTypes.Data<Type>) {
    super();
    this.zoneHour = zoneHour;
    this.zoneMinute = zoneMinute;
    this.zoneSecond = zoneSecond;
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Builds a ZoneOffsetParts from `zoneOffset`
 *
 * @category Constructors
 */
export const fromZoneOffset = (zoneOffset: number): Type => {
  const zoneHour = Math.trunc(zoneOffset);
  const minutesSeconds = Math.abs(zoneOffset - zoneHour) * 60;
  const zoneMinute = Math.trunc(minutesSeconds);
  const zoneSecond = Math.trunc((minutesSeconds - zoneMinute) * 60);

  return new Type({ zoneHour, zoneMinute, zoneSecond });
};

/**
 * Tries to build a ZoneOffsetParts from `zoneHour`, `zoneMinute`, `zoneSecond`. Returns a `some` if
 * successful. A `none` otherwise.
 *
 * - `zoneHour` must be greater than or equal to -12 and less than or equal to 14.
 * - `zoneMinute` must be greater than or equal to 0 and less than or equal to 59.
 * - `zoneSecond` must be greater than or equal to 0 and less than or equal to 59.
 *
 * @category Constructors
 */
export const fromParts = ({
  zoneHour,
  zoneMinute,
  zoneSecond,
}: {
  readonly zoneHour: number;
  readonly zoneMinute: number;
  readonly zoneSecond: number;
}): Result.Result<Type, MInputError.Type> =>
  Result.gen(function* () {
    const validatedHour = yield* pipe(
      zoneHour,
      MInputError.assertInRange({
        min: -12,
        max: 14,
        minIncluded: true,
        maxIncluded: true,
        offset: 0,
        name: "'zoneHour'",
      }),
    );

    const validatedMinute = yield* pipe(
      zoneMinute,
      MInputError.assertInRange({
        min: 0,
        max: 59,
        minIncluded: true,
        maxIncluded: true,
        offset: 0,
        name: "'zoneMinute'",
      }),
    );
    const validatedSecond = yield* pipe(
      zoneSecond,
      MInputError.assertInRange({
        min: 0,
        max: 59,
        minIncluded: true,
        maxIncluded: true,
        offset: 0,
        name: "'zoneSecond'",
      }),
    );

    return new Type({
      zoneHour: validatedHour,
      zoneMinute: validatedMinute,
      zoneSecond: validatedSecond,
    });
  });

/**
 * Returns the `zoneHour` property of `self`
 *
 * @category Getters
 */
export const zoneHour: MTypes.OneArgFunction<Type, number> = Struct.get('zoneHour');

/**
 * Returns the `zoneMinute` property of `self`
 *
 * @category Getters
 */
export const zoneMinute: MTypes.OneArgFunction<Type, number> = Struct.get('zoneMinute');
/**
 * Returns the `zoneSecond` property of `self`
 *
 * @category Getters
 */
export const zoneSecond: MTypes.OneArgFunction<Type, number> = Struct.get('zoneSecond');

/**
 * Returns the ISO representation of this Gregorian Date
 *
 * @category Destructors
 */
export const getIsoString: MTypes.OneArgFunction<Type, string> = formatter;

/**
 * Returns the value of `self` expressed in hours
 *
 * @category Destructors
 */
export const toHour = (self: Type): number => {
  const hour = self.zoneHour;
  const sign = MNumber.sign2(hour);
  return hour + sign * (self.zoneMinute / 60 + self.zoneSecond / 3600);
};
