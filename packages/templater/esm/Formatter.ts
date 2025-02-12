/**
 * A Formatter pushes the concept of the Templater a step further: instead of reading/writing
 * strings, it will read/write the types you pass it and format them as specified.
 */

import { MTypes } from '@parischap/effect-lib';
import { Array, Tuple } from 'effect';
import * as Format from './Format.js';
import * as Templater from './Templater.js';

/** @category Models */
type TargetAndFormat = readonly [target: string, format: Format.Type];

/** @category Models */
export type Type<T extends ReadonlyArray<TargetAndFormat>> = readonly [
	templater: Templater.Type<MTypes.MapToReadonlyTarget<T, string>>,
	targetsAndFormats: T
];

/**
 * Builds a formatter
 *
 * @category Constructor
 * @param template A template in which targets will be searched.
 * @param targetsAndFormats An array of tuples containing the target in first position and the
 *   format in second position.
 */
export const make = <const T extends ReadonlyArray<TargetAndFormat>>(
	template: string,
	targetsAndFormats: T
): Type<T> =>
	Tuple.make(
		Templater.make(template, Array.map(targetsAndFormats, Tuple.getFirst)) as Templater.Type<
			MTypes.MapToReadonlyTarget<T, string>
		>,
		targetsAndFormats
	);

export const write =
	<const T extends ReadonlyArray<TargetAndFormat>>(self: Type<T>) =>
	(targetValues: {
		readonly [key in keyof T]: Format.FormatToType<T[key][1]>;
	}): string =>
		1 as never;
