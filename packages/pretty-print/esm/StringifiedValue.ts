/**
 * Type that represents the output of the stringification process of a value. It is in fact an alias
 * for an array of ASText's (see Text.ts in @parischap/ansi-styles). Each elament of the array
 * represents a line of the stringified value. A value may be stringified in zero, one or more lines
 * depending on the options you passed to the stringification function. For instance,
 * stringification may result in 0- line result if the value is an empty object or if it is an
 * object whose keys are all filtered out by the options passed to the stringification function or
 * if Option.byPasser returns an empty array.
 *
 * @since 0.0.1
 */

import { ASText } from '@parischap/ansi-styles';
import { MTypes } from '@parischap/effect-lib';
import { Array, flow, Function, Option, pipe } from 'effect';
import type * as PPRecordExtremityMarks from './RecordExtremityMarks.js';

/**
 * Type that represents a Stringified
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends ReadonlyArray<ASText.Type> {}

/**
 * Returns a single-line version of `self`
 *
 * @since 0.0.1
 * @category Utils
 */
export const toSingleLine: MTypes.OneArgFunction<Type> = flow(ASText.join(ASText.empty), Array.of);

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
			onSome: (start) => Array.prepend(pipe(start, PPString.makeWith(formatter)))<PPString.Type>
		}),
		Option.match(extremityMarks.end, {
			onNone: () => Function.identity<Type>,
			onSome: (end) => Array.append(pipe(end, PPString.makeWith(formatter)))<PPString.Type>
		})
	);
