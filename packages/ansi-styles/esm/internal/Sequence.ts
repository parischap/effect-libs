/**
 * Module that represents the sequence of an ansi code (the numbers separated by a semicolon between
 * `\x1b[` and `m`, e.g. [1,31] for bold red)
 */

import * as MTypes from '@parischap/effect-lib/MTypes'
import * as Array from 'effect/Array'

/**
 * Type of a ASSequence.Type
 *
 * @category Models
 */
export interface Type extends ReadonlyArray<number> {}

/**
 * Same as ASSequence.Type but must constain at least one number
 *
 * @category Models
 */
export interface OverOne extends MTypes.ReadonlyOverOne<number> {}

/**
 * Empty Sequence instance
 *
 * @category Instances
 */
export const empty: Type = Array.empty();

/**
 * Reset Sequence instance
 *
 * @category Instances
 */
export const reset: OverOne = [0];

/**
 * Bold Sequence instance
 *
 * @category Instances
 */
export const bold: OverOne = [1];

/**
 * Dim Sequence instance
 *
 * @category Instances
 */
export const dim: OverOne = [2];

/**
 * Italic Sequence instance
 *
 * @category Instances
 */
export const italic: OverOne = [3];

/**
 * Underline Sequence instance
 *
 * @category Instances
 */
export const underlined: OverOne = [4];

/**
 * Blinking Sequence instance
 *
 * @category Instances
 */
export const blinking: OverOne = [5];

/**
 * Inversed Sequence instance
 *
 * @category Instances
 */
export const inversed: OverOne = [7];

/**
 * Hidden Sequence instance
 *
 * @category Instances
 */
export const hidden: OverOne = [8];

/**
 * Strikethrough Sequence instance
 *
 * @category Instances
 */
export const struckThrough: OverOne = [9];

/**
 * Not Bold nor Dim Sequence instance
 *
 * @category Instances
 */
export const notBoldNotDim: OverOne = [22];

/**
 * Not Italic Sequence instance
 *
 * @category Instances
 */
export const notItalic: OverOne = [23];

/**
 * Not Underline Sequence instance
 *
 * @category Instances
 */
export const notUnderlined: OverOne = [24];

/**
 * Not Blinking Sequence instance
 *
 * @category Instances
 */
export const notBlinking: OverOne = [25];

/**
 * Not Inversed Sequence instance
 *
 * @category Instances
 */
export const notInversed: OverOne = [27];

/**
 * Not Hidden Sequence instance
 *
 * @category Instances
 */
export const notHidden: OverOne = [28];

/**
 * Not Strikethrough Sequence instance
 *
 * @category Instances
 */
export const notStruckThrough: OverOne = [29];

/**
 * Default foreground color Sequence instance
 *
 * @category Instances
 */
export const defaultForegroundColor: OverOne = [39];

/**
 * Default background color Sequence instance
 *
 * @category Instances
 */
export const defaultBackgroundColor: OverOne = [49];

/**
 * Overlined Sequence instance
 *
 * @category Instances
 */
export const overlined: OverOne = [53];

/**
 * Not Overlined Sequence instance
 *
 * @category Instances
 */
export const notOverlined: OverOne = [55];
