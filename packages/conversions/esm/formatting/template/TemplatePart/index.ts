/**
 * This module implements a `CVTemplatePart` which is the constituent of `CVTemplate` (see
 * Template.ts).
 *
 * There are two kinds of `CVTemplatePart`'s: `CVTemplatePartSeparator`'s (see
 * TemplatePartSeparator.ts) and `CVTemplatePartPlaceholder`'s (see TemplatePartPlaceholder.ts)
 */

import * as CVTemplatePartPlaceholder from './template-part-placeholder/index.js';
import * as CVTemplatePartSeparator from './template-part-separator/index.js';

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
