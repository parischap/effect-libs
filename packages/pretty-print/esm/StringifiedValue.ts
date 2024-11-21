/**
 * In this module, the term `record` refers to a non-null object, an array or a function.
 *
 * Type that is an alias for an array of FormattedString's (see FormattedString.ts). It represents
 * the output of the stringification process of a value. A value may be stringified in zero, one or
 * more FormattedString's depending on the options you passed to the stringification function. For
 * instance, a stringified value may result in an empty StringifiedValue array if the value is an
 * empty object or if it is an object whose keys are all filtered out by the options passed to the
 * stringification function or if Option.byPasser returns an empty array, for instance for nullable
 * values.
 *
 * @since 0.0.1
 */

import { ASFormatter } from '@parischap/ansi-styles';
import { MTypes } from '@parischap/effect-lib';
import { Array, flow, Function, Option, pipe } from 'effect';
import * as PPFormattedString from './FormattedString.js';
import type * as PPRecordExtremityMarks from './RecordExtremityMarks.js';
/**
 * Type that represents a StringifiedValue
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends ReadonlyArray<PPFormattedString.Type> {}

/**
 * Returns a single-line version of `self`
 *
 * @since 0.0.1
 * @category Utils
 */
export const toSingleLine: MTypes.OneArgFunction<Type> = flow(
	PPFormattedString.join(PPFormattedString.empty),
	Array.of
);

/**
 * Add extremity marks at the start and end of `self`
 *
 * @since 0.0.1
 * @category Utils
 */
export const addExtremityMarks = (
	extremityMarks: PPRecordExtremityMarks.Type,
	formatter: ASFormatter.Type
): MTypes.OneArgFunction<Type> =>
	flow(
		Option.match(extremityMarks.start, {
			onNone: () => Function.identity<Type>,
			onSome: (start) =>
				Array.prepend(pipe(start, PPFormattedString.makeWith(formatter)))<PPFormattedString.Type>
		}),
		Option.match(extremityMarks.end, {
			onNone: () => Function.identity<Type>,
			onSome: (end) =>
				Array.append(pipe(end, PPFormattedString.makeWith(formatter)))<PPFormattedString.Type>
		})
	);
