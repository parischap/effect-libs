import { MTypes } from '@parischap/effect-lib';
import { Array, Function, Option, pipe } from 'effect';
import * as FormattedString from './FormattedString.js';

/**
 * Representation of a function that applies a color to a string
 * @category Models
 */
export interface Colorer extends MTypes.OneArgFunction<string, string> {}

/**
 * Type that represents a stringified value. Each element of the array is a line of the result
 * @category Models
 */
export type ValueLines = ReadonlyArray<FormattedString.Type>;

/**
 * Type that represents an array of colors to choose from. When the last color is reached, the first color is used again...
 */
export type ColorWheel = ReadonlyArray<Colorer>;

/**
 * Object that represents a set of colors
 */
export interface ColorSet {
	readonly stringColorer: Colorer;
	readonly valueColorer: Colorer;
	readonly symbolColorer: Colorer;
	readonly bigIntMarkColorer: Colorer;
	readonly toStringedObjectColorer: Colorer;
	readonly functionPropertyKeyColorer: Colorer;
	readonly symbolPropertyKeyColorer: Colorer;
	readonly otherPropertyKeyColorer: Colorer;
	readonly recordSeparatorColorer: Colorer;
	readonly recordDelimitersColorerWheel: ColorWheel;
	readonly objectPropertySeparatorColorer: Colorer;
	readonly prototypeMarkColorer: Colorer;
	readonly multiLineIndentColorer: Colorer;
}

/**
 * Object that represents an indent mode
 */
export interface IndentMode {
	/**
	 * Filler added at the beginning of the first line of each constituent of a complex value except the last
	 */
	readonly initPropFirstLine: string;
	/**
	 * Filler added at the beginning of the first line of the last constituent of a complex value
	 */
	readonly lastPropFirstLine: string;
	/**
	 * Filler added at the beginning of all lines except the first of all constituents but the last of a complex value
	 */
	readonly initPropInBetween: string;
	/**
	 * Filler added at the beginning of all lines except the first of the last constituent of a complex value
	 */
	readonly lastPropInBetween: string;
}

export const colorFromColorWheel = (colorWheel: ColorWheel, index: number): Colorer =>
	pipe(
		colorWheel,
		Array.get(index % colorWheel.length),
		Option.getOrElse(() => Function.identity)
	);
