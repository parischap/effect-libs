/**
 * This module implements an array of numbers that represents the sequence of numbers to output
 * between `\x1b[` and `m` to produce an ansi-style. For instance [31] is the Sequence for the
 * Original red color and [38,5,9] the sequence for the EightBitRed color.
 *
 * @since 0.0.1
 */

import { MMatch, MTypes } from '@parischap/effect-lib';
import { Array, flow, Number } from 'effect';
import * as ASCharacteristicIndex from './CharacteristicIndex.js';

/**
 * Type that represents a Sequence
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Array<number> {}

/**
 * Type that represents a non empty Sequence
 *
 * @since 0.0.1
 * @category Models
 */
export interface NonEmptyType extends Array.NonEmptyArray<number> {}

/**
 * Empty Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const empty: Type = Array.empty();

/**
 * Reset Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const reset: NonEmptyType = Array.of(0);

/**
 * Bold Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const bold: NonEmptyType = Array.of(1);

/**
 * Dim Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const dim: NonEmptyType = Array.of(2);

/**
 * Intensity reset Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const intensityReset: NonEmptyType = Array.of(22);

/**
 * Italic Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const italic: NonEmptyType = Array.of(3);

/**
 * Italic reset Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const italicReset: NonEmptyType = Array.of(23);

/**
 * Underlined Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const underlined: NonEmptyType = Array.of(4);

/**
 * Underlined reset Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const underlinedReset: NonEmptyType = Array.of(24);

/**
 * Struck-through Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const struckThrough: NonEmptyType = Array.of(9);

/**
 * Struck-through reset Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const struckThroughReset: NonEmptyType = Array.of(29);

/**
 * Overlined Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const overlined: NonEmptyType = Array.of(53);

/**
 * Overlined reset Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const overlinedReset: NonEmptyType = Array.of(55);

/**
 * Inversed Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const inversed: NonEmptyType = Array.of(7);

/**
 * Inversed reset Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const inversedReset: NonEmptyType = Array.of(27);

/**
 * Hidden Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const hidden: NonEmptyType = Array.of(8);

/**
 * Hidden reset Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const hiddenReset: NonEmptyType = Array.of(28);

/**
 * Slow blink Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const slowBlink: NonEmptyType = Array.of(5);

/**
 * Fast blink Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const fastBlink: NonEmptyType = Array.of(6);

/**
 * Blink reset Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const blinkReset: NonEmptyType = Array.of(25);

/**
 * Standard foreground color Sequence instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const standardFgColor: MTypes.OneArgFunction<number, NonEmptyType> = flow(
	Number.sum(30),
	Array.of
);

/**
 * Bright foreground color Sequence instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const brightFgColor: MTypes.OneArgFunction<number, NonEmptyType> = flow(
	Number.sum(90),
	Array.of
);

/**
 * EightBit foreground color Sequence instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const eightBitFgColor: MTypes.OneArgFunction<number, NonEmptyType> = flow(
	Array.of,
	Array.prependAll([38, 5])
);

/**
 * RGB foreground color Sequence instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const RgbFgColor = ({
	redCode,
	greenCode,
	blueCode
}: {
	readonly redCode: number;
	readonly greenCode: number;
	readonly blueCode: number;
}): NonEmptyType => Array.make(38, 2, redCode, greenCode, blueCode);

/**
 * Foreground color reset Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const fgColorReset: NonEmptyType = Array.of(39);

/**
 * Standard background color Sequence instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const standardBgColor: MTypes.OneArgFunction<number, NonEmptyType> = flow(
	Number.sum(40),
	Array.of
);

/**
 * Bright background color Sequence instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const brightBgColor: MTypes.OneArgFunction<number, NonEmptyType> = flow(
	Number.sum(100),
	Array.of
);

/**
 * EightBit background color Sequence instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const eightBitBgColor: MTypes.OneArgFunction<number, NonEmptyType> = flow(
	Array.of,
	Array.prependAll([48, 5])
);

/**
 * RGB background color Sequence instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const RgbBgColor = ({
	redCode,
	greenCode,
	blueCode
}: {
	readonly redCode: number;
	readonly greenCode: number;
	readonly blueCode: number;
}): NonEmptyType => Array.make(48, 2, redCode, greenCode, blueCode);

/**
 * Background color reset Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const bgColorReset: NonEmptyType = Array.of(49);

/**
 * Builds the reset Sequence of a Characteristic from its index
 *
 * @since 0.0.1
 * @category Constructors
 */
export const resetFromCharacteristicIndex: MTypes.OneArgFunction<ASCharacteristicIndex.Type, Type> =
	flow(
		flow(
			MMatch.make,
			MMatch.whenIs(ASCharacteristicIndex.Type.Intensity, () => intensityReset),
			MMatch.whenIs(ASCharacteristicIndex.Type.Italic, () => italicReset),
			MMatch.whenIs(ASCharacteristicIndex.Type.Underlined, () => underlinedReset),
			MMatch.whenIs(ASCharacteristicIndex.Type.StruckThrough, () => struckThroughReset),
			MMatch.whenIs(ASCharacteristicIndex.Type.Overlined, () => overlinedReset),
			MMatch.whenIs(ASCharacteristicIndex.Type.Inversed, () => inversedReset),
			MMatch.whenIs(ASCharacteristicIndex.Type.Hidden, () => hiddenReset),
			MMatch.whenIs(ASCharacteristicIndex.Type.Blink, () => blinkReset)
		),
		flow(
			MMatch.whenIs(ASCharacteristicIndex.Type.FgColor, () => fgColorReset),
			MMatch.whenIs(ASCharacteristicIndex.Type.BgColor, () => bgColorReset),
			MMatch.exhaustive
		)
	);
