/**
 * This module implements a string that represents the ANSI command string corresponding to a
 * Sequence (see Sequence.ts). For instance, `\x1b[1m` is the SequenceString for the ANSI bold
 * command.
 *
 * @since 0.0.1
 */

import { MMatch, MString, MTypes } from '@parischap/effect-lib';
import { Array, flow, Option, String } from 'effect';
import * as ASCharacteristicIndex from './CharacteristicIndex.js';
import * as ASSequence from './Sequence.js';

/**
 * Type that represents a SequenceString
 *
 * @since 0.0.1
 * @category Models
 */
export type Type = string;

/**
 * Builds a SequenceString from a NonEmptySequence
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromNonEmptySequence: MTypes.OneArgFunction<ASSequence.NonEmptyType, Type> = flow(
	flow(
		Array.map(MString.fromNumber(10)),
		Array.join(';'),
		MString.prepend('\x1b['),
		MString.append('m')
	)
);

/**
 * Builds a SequenceString from a Sequence
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromSequence: MTypes.OneArgFunction<ASSequence.Type, Type> = flow(
	Option.liftPredicate(Array.isNonEmptyArray),
	Option.map(fromNonEmptySequence),
	Option.getOrElse(() => '')
);

/**
 * Empty SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const empty: Type = String.empty;

/**
 * Reset SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const reset: Type = fromNonEmptySequence(ASSequence.reset);

/**
 * Bold SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const bold: Type = fromNonEmptySequence(ASSequence.bold);

/**
 * Dim SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const dim: Type = fromNonEmptySequence(ASSequence.dim);

/**
 * Intensity reset SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const intensityReset: Type = fromNonEmptySequence(ASSequence.intensityReset);

/**
 * Italic SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const italic: Type = fromNonEmptySequence(ASSequence.italic);

/**
 * Italic reset SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const italicReset: Type = fromNonEmptySequence(ASSequence.italicReset);

/**
 * Underlined SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const underlined: Type = fromNonEmptySequence(ASSequence.underlined);

/**
 * Underlined reset SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const underlinedReset: Type = fromNonEmptySequence(ASSequence.underlinedReset);

/**
 * Struck-through SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const struckThrough: Type = fromNonEmptySequence(ASSequence.struckThrough);

/**
 * Struck-through reset SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const struckThroughReset: Type = fromNonEmptySequence(ASSequence.struckThroughReset);

/**
 * Overlined SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const overlined: Type = fromNonEmptySequence(ASSequence.overlined);

/**
 * Overlined reset SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const overlinedReset: Type = fromNonEmptySequence(ASSequence.overlinedReset);

/**
 * Inversed SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const inversed: Type = fromNonEmptySequence(ASSequence.inversed);

/**
 * Inversed reset SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const inversedReset: Type = fromNonEmptySequence(ASSequence.inversedReset);

/**
 * Hidden SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const hidden: Type = fromNonEmptySequence(ASSequence.hidden);

/**
 * Hidden reset SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const hiddenReset: Type = fromNonEmptySequence(ASSequence.hiddenReset);

/**
 * Slow blink SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const slowBlink: Type = fromNonEmptySequence(ASSequence.slowBlink);

/**
 * Fast blink SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const fastBlink: Type = fromNonEmptySequence(ASSequence.fastBlink);

/**
 * Blink reset SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const blinkReset: Type = fromNonEmptySequence(ASSequence.blinkReset);

/**
 * Standard foreground color SequenceString instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const standardFgColor: MTypes.OneArgFunction<number, Type> = flow(
	ASSequence.standardFgColor,
	fromNonEmptySequence
);

/**
 * Bright foreground color SequenceString instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const brightFgColor: MTypes.OneArgFunction<number, Type> = flow(
	ASSequence.brightFgColor,
	fromNonEmptySequence
);

/**
 * EightBit foreground color SequenceString instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const eightBitFgColor: MTypes.OneArgFunction<number, Type> = flow(
	ASSequence.eightBitFgColor,
	fromNonEmptySequence
);

/**
 * RGB foreground color SequenceString instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const RgbFgColor: MTypes.OneArgFunction<
	{
		readonly redCode: number;
		readonly greenCode: number;
		readonly blueCode: number;
	},
	Type
> = flow(ASSequence.RgbFgColor, fromNonEmptySequence);

/**
 * Standard background color SequenceString instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const standardBgColor: MTypes.OneArgFunction<number, Type> = flow(
	ASSequence.standardBgColor,
	fromNonEmptySequence
);

/**
 * Bright background color SequenceString instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const brightBgColor: MTypes.OneArgFunction<number, Type> = flow(
	ASSequence.brightBgColor,
	fromNonEmptySequence
);

/**
 * EightBit background color SequenceString instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const eightBitBgColor: MTypes.OneArgFunction<number, Type> = flow(
	ASSequence.eightBitBgColor,
	fromNonEmptySequence
);

/**
 * RGB background color SequenceString instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const RgbBgColor: MTypes.OneArgFunction<
	{
		readonly redCode: number;
		readonly greenCode: number;
		readonly blueCode: number;
	},
	Type
> = flow(ASSequence.RgbBgColor, fromNonEmptySequence);

/**
 * Foreground color reset SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const fgColorReset: Type = fromNonEmptySequence(ASSequence.fgColorReset);

/**
 * Background color reset SequenceString instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const bgColorReset: Type = fromNonEmptySequence(ASSequence.bgColorReset);

/**
 * Builds the reset SequenceString of a Characteristic from its index
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
