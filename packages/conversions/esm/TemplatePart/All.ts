/**
 * This module implements `CVTemplatePart`'s which are the constituents of `CVTemplate`'s (see
 * Template.ts).
 *
 * There are two kinds of `CVTemplatePart`'s: `CVTemplatePartSeparator`'s (see
 * TemplatePartSeparator.ts) and `CVTemplatePartPlaceholder`'s (see TemplatePartPlaceholder.ts)
 */

import * as CVTemplatePartPlaceholder from './Placeholder.js';
import * as CVTemplatePartSeparator from './Separator.js';

/**
 * Type of a TemplatePart
 *
 * @category Models
 */
export type Type<N extends string, T> =
  | CVTemplatePartSeparator.Type
  | CVTemplatePartPlaceholder.Type<N, T>;

/**
 * Type guard
 *
 * @category Guards
 */
export const isPlaceholder = <const N extends string, T>(
  u: Type<N, T>,
): u is CVTemplatePartPlaceholder.Type<N, T> => u instanceof CVTemplatePartPlaceholder.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const isSeparator = <const N extends string, T>(
  u: Type<N, T>,
): u is CVTemplatePartSeparator.Type => u instanceof CVTemplatePartSeparator.Type;
