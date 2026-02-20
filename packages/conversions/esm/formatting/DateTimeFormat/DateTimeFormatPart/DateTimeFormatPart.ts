/**
 * This module implements a `CVDateTimeFormatPart`, which can be either a
 * `CVDateTimeFormatPlaceholder` or a `CVDateTimeFormatSeparator`. These `CVDateTimeFormatPart`'s
 * are used to describe the string representation of a DateTime. They are converted to
 * `CVTemplatePart`'s to parse and format a `CVDateTime`
 */
import * as CVDateTimeFormatPlaceholder from './DateTimeFormatPlaceholder.js';
import * as CVDateTimeFormatSeparator from './DateTimeFormatSeparator.js';

/**
 * Type of a TemplatePart
 *
 * @category Models
 */
export type Type = CVDateTimeFormatPlaceholder.Type | CVDateTimeFormatSeparator.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const isPlaceholder = (u: Type): u is CVDateTimeFormatPlaceholder.Type =>
  u instanceof CVDateTimeFormatPlaceholder.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const isSeparator = (u: Type): u is CVDateTimeFormatSeparator.Type =>
  u instanceof CVDateTimeFormatSeparator.Type;
