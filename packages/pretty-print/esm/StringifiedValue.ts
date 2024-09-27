/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * Type that is an alias for an array of FormattedString's (see FormattedString.ts). It represents
 * the output of the stringification process of a value. A value may be stringified in zero, one or
 * more FormattedString's depending on the options you passed to the stringification function. For
 * instance, a stringified value may result in an empty StringifiedValue array if the value is an
 * empty object or if it is an object whose keys are all filtered out by the options passed to the
 * stringification function or if Options.byPasser returns an empty array, for instance for nullable
 * values.
 *
 * @since 0.0.1
 */

import { Array, flow, Function, Option, pipe } from 'effect';
import * as ColorSet from './ColorSet.js';
import * as FormattedString from './FormattedString.js';
import type * as RecordExtremityMarks from './RecordExtremityMarks.js';
/**
 * Type that represents a StringifiedValue
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends ReadonlyArray<FormattedString.Type> {}

/**
 * Type that represents a function that transforms a StringifiedValue
 *
 * @since 0.0.1
 * @category Models
 */
export interface Transformer {
	(self: Type): Type;
}

/**
 * Returns a single-line version of `self`
 *
 * @since 0.0.1
 * @category Utils
 */
export const toSingleLine: Transformer = flow(
	FormattedString.join(FormattedString.empty),
	Array.of
);

/**
 * Add extremity marks at the start and end of `self`
 *
 * @since 0.0.1
 * @category Utils
 */
export const addExtremityMarks = (
	extremityMarks: RecordExtremityMarks.Type,
	colorer: ColorSet.Colorer
): Transformer =>
	flow(
		Option.match(extremityMarks.start, {
			onNone: () => Function.identity<Type>,
			onSome: (start) =>
				Array.prepend(pipe(start, FormattedString.makeWith(colorer)))<FormattedString.Type>
		}),
		Option.match(extremityMarks.end, {
			onNone: () => Function.identity<Type>,
			onSome: (end) =>
				Array.append(pipe(end, FormattedString.makeWith(colorer)))<FormattedString.Type>
		})
	);
