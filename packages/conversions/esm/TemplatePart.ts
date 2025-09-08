/**
 * This module implements `CVTemplatePart`'s which are the constituents of `CVTemplate`'s (see
 * Template.ts).
 *
 * There are two kinds of `CVTemplatePart`'s: `CVTemplateSeparator`'s (see TemplateSeparator.ts) and
 * `CVTemplatePlaceholder`'s (see TemplatePlaceholder.ts)
 */

import * as CVTemplatePlaceholder from './TemplatePlaceholder.js';
import * as CVTemplateSeparator from './TemplateSeparator.js';

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
	u: Type<N, T>
): u is CVTemplatePlaceholder.Type<N, T> => CVTemplatePlaceholder.has(u);

/**
 * Type guard
 *
 * @category Guards
 */
export const isSeparator = <const N extends string, T>(
	u: Type<N, T>
): u is CVTemplateSeparator.Type => CVTemplateSeparator.has(u);
