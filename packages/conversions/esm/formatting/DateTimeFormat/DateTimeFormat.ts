/**
 * This module implements a `CVTemplate` (see Template.ts) dedicated to parsing and formatting
 * dates. It supports many of the available unicode tokens (see
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).
 */

import * as MData from '@parischap/effect-lib/MData';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { Array, pipe } from 'effect';
import * as CVDateTimeFormatParts from '../../internal/Formatting/DateTimeFormat/DateTimeFormatParts.js';
import * as CVDateTimeFormatPartPlaceholder from './DateTimeFormatPart/DateTimeFormatPlaceholder.js';
import * as CVDateTimeFormatPartSeparator from './DateTimeFormatPart/DateTimeFormatSeparator.js';

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
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (...parts: CVDateTimeFormatParts.Type): Type => Type.make(parts);

/** basicIso8601 CVDateTimeFormat instance */
export const basicIso8601 = make(
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
  CVDateTimeFormatPartPlaceholder.make('MM'),
  CVDateTimeFormatPartPlaceholder.make('dd'),
);

/** iso8601 CVDateTimeFormat instance */
export const iso8601 = make(
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
  CVDateTimeFormatPartSeparator.hyphen,
  CVDateTimeFormatPartPlaceholder.make('MM'),
  CVDateTimeFormatPartSeparator.hyphen,
  CVDateTimeFormatPartPlaceholder.make('dd'),
);

/** usDate CVDateTimeFormat instance (e.g. 06/05/2005) */
export const usDate = make(
  CVDateTimeFormatPartPlaceholder.make('MM'),
  CVDateTimeFormatPartSeparator.slash,
  CVDateTimeFormatPartPlaceholder.make('dd'),
  CVDateTimeFormatPartSeparator.slash,
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
);

/** euDate CVDateTimeFormat instance (e.g. 05/06/2005) */
export const euDate = make(
  CVDateTimeFormatPartPlaceholder.make('dd'),
  CVDateTimeFormatPartSeparator.slash,
  CVDateTimeFormatPartPlaceholder.make('MM'),
  CVDateTimeFormatPartSeparator.slash,
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
);

/** euDotDate CVDateTimeFormat instance (e.g. 05.06.2005) */
export const euDotDate = make(
  CVDateTimeFormatPartPlaceholder.make('dd'),
  CVDateTimeFormatPartSeparator.dot,
  CVDateTimeFormatPartPlaceholder.make('MM'),
  CVDateTimeFormatPartSeparator.dot,
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
);

/** isoDateTime CVDateTimeFormat instance (e.g. 2005-06-05T14:05:05) */
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

/** isoDateTimeMs CVDateTimeFormat instance (e.g. 2005-06-05T14:05:05.007) */
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

/** time24h CVDateTimeFormat instance (e.g. 14:05) */
export const time24h = make(
  CVDateTimeFormatPartPlaceholder.make('HH'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('mm'),
);

/** time24hWithSeconds CVDateTimeFormat instance (e.g. 14:05:05) */
export const time24hWithSeconds = make(
  CVDateTimeFormatPartPlaceholder.make('HH'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('mm'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('ss'),
);

/** time12h CVDateTimeFormat instance (e.g. 02:05 PM) */
export const time12h = make(
  CVDateTimeFormatPartPlaceholder.make('KK'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('mm'),
  CVDateTimeFormatPartSeparator.space,
  CVDateTimeFormatPartPlaceholder.make('a'),
);

/** time12hWithSeconds CVDateTimeFormat instance (e.g. 02:05:05 PM) */
export const time12hWithSeconds = make(
  CVDateTimeFormatPartPlaceholder.make('KK'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('mm'),
  CVDateTimeFormatPartSeparator.colon,
  CVDateTimeFormatPartPlaceholder.make('ss'),
  CVDateTimeFormatPartSeparator.space,
  CVDateTimeFormatPartPlaceholder.make('a'),
);

/** longDate CVDateTimeFormat instance (e.g. June 5, 2005) */
export const longDate = make(
  CVDateTimeFormatPartPlaceholder.make('MMMM'),
  CVDateTimeFormatPartSeparator.space,
  CVDateTimeFormatPartPlaceholder.make('d'),
  CVDateTimeFormatPartSeparator.comma,
  CVDateTimeFormatPartSeparator.space,
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
);

/** shortDate CVDateTimeFormat instance (e.g. Jun 5, 2005) */
export const shortDate = make(
  CVDateTimeFormatPartPlaceholder.make('MMM'),
  CVDateTimeFormatPartSeparator.space,
  CVDateTimeFormatPartPlaceholder.make('d'),
  CVDateTimeFormatPartSeparator.comma,
  CVDateTimeFormatPartSeparator.space,
  CVDateTimeFormatPartPlaceholder.make('yyyy'),
);
