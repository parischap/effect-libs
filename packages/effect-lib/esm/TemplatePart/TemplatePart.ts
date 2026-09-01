/**
 * This module implements a `MTemplatePart` which is the constituent of `MTemplate` (see
 * Template.ts).
 *
 * There are two kinds of `MTemplatePart`'s: `MTemplateSeparator`'s (see TemplateSeparator.ts) and
 * `MTemplatePlaceholder`'s (see TemplatePlaceholder.ts)
 */

import * as MTemplatePlaceholder from './TemplatePlaceholder.js';
import * as MTemplateSeparator from './TemplateSeparator.js';

/**
 * Type of a TemplatePart
 *
 * @category Models
 */
export type Type<N extends string, T> = MTemplateSeparator.Type | MTemplatePlaceholder.Type<N, T>;

/**
 * Type guard
 *
 * @category Guards
 */
export const isPlaceholder = <const N extends string, T>(
  u: Type<N, T>,
): u is MTemplatePlaceholder.Type<N, T> => u instanceof MTemplatePlaceholder.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const isSeparator = <const N extends string, T>(
  u: Type<N, T>,
): u is MTemplateSeparator.Type => u instanceof MTemplateSeparator.Type;
