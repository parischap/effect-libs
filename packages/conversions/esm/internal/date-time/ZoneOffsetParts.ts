/**
 * This module implements an object that contains the data relative to the parts of a zone offset
 *
 * Note that ZoneOffsetParts with hour=-0, minute=10, second=0 is different from hour=0, minute=10,
 * second=0. The first corresponds to the string 'GMT-00:10', a negative 10-minute offset, the
 * second one to the string 'GMT+00:10', a positive 10-minute offset
 */

import * as MData from '@parischap/effect-lib/MData'
import * as MInputError from '@parischap/effect-lib/MInputError'
import * as MNumber from '@parischap/effect-lib/MNumber'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {flow, pipe} from 'effect'
import * as Either from 'effect/Either'
import * as Function from 'effect/Function'
import * as Struct from 'effect/Struct'
import * as CVNumberBase10Format from '../../formatting/number-base10-format/index.js';
import * as CVTemplate from '../../formatting/template/index.js';
import * as CVTemplatePlaceholder from '../../formatting/template/TemplatePart/template-placeholder/index.js';
import * as CVTemplateSeparator from '../../formatting/template/TemplatePart/template-separator/index.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/internal/date-time/ZoneOffsetParts/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

const _fixedLengthToReal = CVTemplatePlaceholder.fixedLengthToReal;
const _sep = CVTemplateSeparator;
const _integer = CVNumberBase10Format.integer;
const _params = {
  fillChar: '0',
  numberBase10Format: _integer,
};

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
  private constructor({ zoneHour, zoneMinute, zoneSecond }: MTypes.Data<Type>) {
    super();
    this.zoneHour = zoneHour;
    this.zoneMinute = zoneMinute;
    this.zoneSecond = zoneSecond;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
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

  return Type.make({ zoneHour, zoneMinute, zoneSecond });
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
}): Either.Either<Type, MInputError.Type> =>
  Either.gen(function* () {
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

    return Type.make({
      zoneHour: validatedHour,
      zoneMinute: validatedMinute,
      zoneSecond: validatedSecond,
    });
  });

/**
 * Returns the `zoneHour` property of `self`
 *
 * @category Destructors
 */
export const zoneHour: MTypes.OneArgFunction<Type, number> = Struct.get('zoneHour');

/**
 * Returns the `zoneMinute` property of `self`
 *
 * @category Destructors
 */
export const zoneMinute: MTypes.OneArgFunction<Type, number> = Struct.get('zoneMinute');
/**
 * Returns the `zoneSecond` property of `self`
 *
 * @category Destructors
 */
export const zoneSecond: MTypes.OneArgFunction<Type, number> = Struct.get('zoneSecond');

const _formatter = flow(
  CVTemplate.toFormatter(
    CVTemplate.make(
      _fixedLengthToReal({
        ..._params,
        name: 'zoneHour',
        length: 3,
        numberBase10Format: pipe(_integer, CVNumberBase10Format.withSignDisplay),
      }),
      _sep.colon,
      _fixedLengthToReal({ ..._params, name: 'zoneMinute', length: 2 }),
    ),
  ),
  Either.getOrThrowWith(Function.identity),
) as MTypes.OneArgFunction<{ readonly zoneHour: number; readonly zoneMinute: number }, string>;

/**
 * Returns the ISO representation of this Gregorian Date
 *
 * @category Destructors
 */
export const getIsoString: MTypes.OneArgFunction<Type, string> = _formatter;

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
