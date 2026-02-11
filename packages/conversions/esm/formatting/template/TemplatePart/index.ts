/**
 * This module implements a `CVTemplatePart` which is the constituent of `CVTemplate` (see
 * Template.ts).
 *
 * There are two kinds of `CVTemplatePart`'s: `CVTemplateSeparator`'s (see TemplateSeparator.ts) and
 * `CVTemplatePlaceholder`'s (see TemplatePlaceholder.ts)
 */

import * as CVTemplatePlaceholder from './template-placeholder/index.js';
import * as CVTemplateSeparator from './template-separator/index.js';

/**
 * Type of a TemplatePart
 *
 * @category Models
 */
export type Type<N extends string, T> = CVTemplateSeparator.Type | CVTemplatePlaceholder.Type<N, T>;

/**
 * Type guard
 *
 * @category Guards
 */
export const isPlaceholder = <const N extends string, T>(
  u: Type<N, T>,
): u is CVTemplatePlaceholder.Type<N, T> => u instanceof CVTemplatePlaceholder.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const isSeparator = <const N extends string, T>(
  u: Type<N, T>,
): u is CVTemplateSeparator.Type => u instanceof CVTemplateSeparator.Type;
