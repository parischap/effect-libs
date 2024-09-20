/**
 * This module implements a ColorWheel, i.e an array of colors that repeat themselves indefinitely.
 *
 * @since 0.0.1
 */
import { Array, Function, Option, pipe } from 'effect';
import type * as ColorSet from './ColorSet.js';

/**
 * Type that represents a ColorWheel, i.e an array of colors that repeat themselves indefinitely. If
 * the colorWheel is an empty array, it is equivalent to the identity function (i.e no color is
 * applied)
 *
 * @since 0.0.1
 * @category Models
 */
export type Type = ReadonlyArray<ColorSet.Colorer>;

/**
 * Function that retrieves the n-th color of a color wheel, applying a modulo if n exceeds the
 * number of available colors. If the colorWheel is empty, the identity function is returned (i.e no
 * color is applied)
 *
 * @since 0.0.1
 * @category Utils
 */
export const getColor =
	(n: number) =>
	(self: Type): ColorSet.Colorer =>
		pipe(
			self,
			Array.get(n % self.length),
			Option.getOrElse(() => Function.identity)
		);
