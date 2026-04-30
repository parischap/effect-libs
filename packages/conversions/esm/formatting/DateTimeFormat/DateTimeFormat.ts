/**
 * This module implements a `CVDateTimeFormat`, i.e. a `CVTemplate` (see Template.ts) dedicated to
 * parsing and formatting dates. It supports many of the available Unicode tokens (see
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).
 *
 * A `CVDateTimeFormat` is context-independent: it describes the structure of a date string but
 * carries no locale information. To parse or format a date string, you must combine a
 * `CVDateTimeFormat` with a `CVDateTimeFormatContext` by constructing a `CVDateTimeParser` or a
 * `CVDateTimeFormatter`.
 */

import { pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Struct from 'effect/Struct';

import * as MData from '@parischap/effect-lib/MData';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import type * as CVDateTimeFormatParts from '../../internal/formatting/DateTimeFormat/DateTimeFormatParts.js';

import * as CVDateTimeFormatPartPlaceholder from './DateTimeFormatPart/DateTimeFormatPlaceholder.js';
import * as CVDateTimeFormatPartSeparator from './DateTimeFormatPart/DateTimeFormatSeparator.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/formatting/DateTimeFormat/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a CVDateTimeFormat
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Name of this CVDateTimeFormat, built by concatenating the string representations of its parts */
  readonly name: string;

  /** The CVDateTimeFormatPart's that make up this CVDateTimeFormat */
  readonly parts: CVDateTimeFormatParts.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.name;
    };
  }

  /** Class constructor */
  private constructor({ name, parts }: MTypes.Data<Type>) {
    super();
    this.name = name;
    this.parts = parts;
  }

  /** Static constructor */
  static make(parts: CVDateTimeFormatParts.Type): Type {
    return new Type({
      name: pipe(
        parts,
        Array.map((p) => p.toString()),
        Array.join(''),
      ),
      parts,
    });
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Constructs a `CVDateTimeFormat` from the given `CVDateTimeFormatPart`'s.
 *
 * @category Constructors
 */
export const make = (...parts: CVDateTimeFormatParts.Type): Type => Type.make(parts);

/**
 * Returns the `name` property of `self`.
 *
 * @category Getters
 */
export const name: MTypes.OneArgFunction<Type, string> = Struct.get('name');

/**
 * Returns the `parts` property of `self`.
 *
 * @category Getters
 */
export const parts: MTypes.OneArgFunction<Type, CVDateTimeFormatParts.Type> = Struct.get('parts');

/**
 * `CVDateTimeFormat` instance for the basic ISO 8601 date format (YYYYMMDD, e.g. `20050605`).
 *
 * @category Instances
 */
export const basicIso8601 = make(
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
  CVDateTimeFormatPartPlaceholder.make('MM'),
  CVDateTimeFormatPartPlaceholder.make('dd'),
);

/**
 * `CVDateTimeFormat` instance for the ISO 8601 date format (YYYY-MM-DD, e.g. `2005-06-05`).
 *
 * @category Instances
 */
export const iso8601 = make(
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
  CVDateTimeFormatPartSeparator.hyphen,
  CVDateTimeFormatPartPlaceholder.make('MM'),
  CVDateTimeFormatPartSeparator.hyphen,
  CVDateTimeFormatPartPlaceholder.make('dd'),
);

/**
 * `CVDateTimeFormat` instance for the US date format (MM/DD/YYYY, e.g. `06/05/2005`).
 *
 * @category Instances
 */
export const usDate = make(
  CVDateTimeFormatPartPlaceholder.make('MM'),
  CVDateTimeFormatPartSeparator.slash,
  CVDateTimeFormatPartPlaceholder.make('dd'),
  CVDateTimeFormatPartSeparator.slash,
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
);

/**
 * `CVDateTimeFormat` instance for the European date format with slashes (DD/MM/YYYY, e.g.
 * `05/06/2005`).
 *
 * @category Instances
 */
export const euDate = make(
  CVDateTimeFormatPartPlaceholder.make('dd'),
  CVDateTimeFormatPartSeparator.slash,
  CVDateTimeFormatPartPlaceholder.make('MM'),
  CVDateTimeFormatPartSeparator.slash,
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
);

/**
 * `CVDateTimeFormat` instance for the European date format with dots (DD.MM.YYYY, e.g.
 * `05.06.2005`).
 *
 * @category Instances
 */
export const euDotDate = make(
  CVDateTimeFormatPartPlaceholder.make('dd'),
  CVDateTimeFormatPartSeparator.dot,
  CVDateTimeFormatPartPlaceholder.make('MM'),
  CVDateTimeFormatPartSeparator.dot,
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
);

/**
 * `CVDateTimeFormat` instance for the ISO 8601 date-time format without milliseconds (YYYY-MM-
 * DDTHH:mm:ss, e.g. `2005-06-05T14:05:05`).
 *
 * @category Instances
 */
export const isoDateTime = make(
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
  CVDateTimeFormatPartSeparator.hyphen,
  CVDateTimeFormatPartPlaceholder.make('MM'),
  CVDateTimeFormatPartSeparator.hyphen,
  CVDateTimeFormatPartPlaceholder.make('dd'),
  CVDateTimeFormatPartSeparator.make('T'),
  CVDateTimeFormatPartPlaceholder.make('HH'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('mm'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('ss'),
);

/**
 * `CVDateTimeFormat` instance for the ISO 8601 date-time format with milliseconds (YYYY-MM-
 * DDTHH:mm:ss.SSS, e.g. `2005-06-05T14:05:05.007`).
 *
 * @category Instances
 */
export const isoDateTimeMs = make(
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
  CVDateTimeFormatPartSeparator.hyphen,
  CVDateTimeFormatPartPlaceholder.make('MM'),
  CVDateTimeFormatPartSeparator.hyphen,
  CVDateTimeFormatPartPlaceholder.make('dd'),
  CVDateTimeFormatPartSeparator.make('T'),
  CVDateTimeFormatPartPlaceholder.make('HH'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('mm'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('ss'),
  CVDateTimeFormatPartSeparator.dot,
  CVDateTimeFormatPartPlaceholder.make('SSS'),
);

/**
 * `CVDateTimeFormat` instance for the 24-hour time format without seconds (HH:mm, e.g. `14:05`).
 *
 * @category Instances
 */
export const time24h = make(
  CVDateTimeFormatPartPlaceholder.make('HH'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('mm'),
);

/**
 * `CVDateTimeFormat` instance for the 24-hour time format with seconds (HH:mm:ss, e.g. `14:05:05`).
 *
 * @category Instances
 */
export const time24hWithSeconds = make(
  CVDateTimeFormatPartPlaceholder.make('HH'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('mm'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('ss'),
);

/**
 * `CVDateTimeFormat` instance for the 12-hour time format without seconds (KK:mm a, e.g. `02:05
 * PM`).
 *
 * @category Instances
 */
export const time12h = make(
  CVDateTimeFormatPartPlaceholder.make('KK'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('mm'),
  CVDateTimeFormatPartSeparator.space,
  CVDateTimeFormatPartPlaceholder.make('a'),
);

/**
 * `CVDateTimeFormat` instance for the 12-hour time format with seconds (KK:mm:ss a, e.g. `02:05:05
 * PM`).
 *
 * @category Instances
 */
export const time12hWithSeconds = make(
  CVDateTimeFormatPartPlaceholder.make('KK'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('mm'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('ss'),
  CVDateTimeFormatPartSeparator.space,
  CVDateTimeFormatPartPlaceholder.make('a'),
);

/**
 * `CVDateTimeFormat` instance for a long date format (MMMM d, yyyy, e.g. `June 5, 2005`). The month
 * name is locale-dependent and requires an appropriate `CVDateTimeFormatContext`.
 *
 * @category Instances
 */
export const longDate = make(
  CVDateTimeFormatPartPlaceholder.make('MMMM'),
  CVDateTimeFormatPartSeparator.space,
  CVDateTimeFormatPartPlaceholder.make('d'),
  CVDateTimeFormatPartSeparator.comma,
  CVDateTimeFormatPartSeparator.space,
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
);

/**
 * `CVDateTimeFormat` instance for a short date format (MMM d, yyyy, e.g. `Jun 5, 2005`). The
 * abbreviated month name is locale-dependent and requires an appropriate
 * `CVDateTimeFormatContext`.
 *
 * @category Instances
 */
export const shortDate = make(
  CVDateTimeFormatPartPlaceholder.make('MMM'),
  CVDateTimeFormatPartSeparator.space,
  CVDateTimeFormatPartPlaceholder.make('d'),
  CVDateTimeFormatPartSeparator.comma,
  CVDateTimeFormatPartSeparator.space,
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
);
