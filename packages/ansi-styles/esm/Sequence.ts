/**
 * Module that represents the sequence of an ansi code (the numbers separated by a semicolon between
 * `\x1b[` and `m`, e.g. [1,31] for bold red)
 */

import { MTypes } from '@parischap/effect-lib';
import { Array } from 'effect';

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
export interface NonEmptyType extends MTypes.ReadonlyOverOne<number> {}

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
export const reset: NonEmptyType = [0];

/**
 * Bold Sequence instance
 *
 * @category Instances
 */
export const bold: NonEmptyType = [1];

/**
 * Dim Sequence instance
 *
 * @category Instances
 */
export const dim: NonEmptyType = [2];

/**
 * Italic Sequence instance
 *
 * @category Instances
 */
export const italic: NonEmptyType = [3];

/**
 * Underline Sequence instance
 *
 * @category Instances
 */
export const underlined: NonEmptyType = [4];

/**
 * Blinking Sequence instance
 *
 * @category Instances
 */
export const blinking: NonEmptyType = [5];

/**
 * Inversed Sequence instance
 *
 * @category Instances
 */
export const inversed: NonEmptyType = [7];

/**
 * Hidden Sequence instance
 *
 * @category Instances
 */
export const hidden: NonEmptyType = [8];

/**
 * Strikethrough Sequence instance
 *
 * @category Instances
 */
export const struckThrough: NonEmptyType = [9];

/**
 * Not Bold nor Dim Sequence instance
 *
 * @category Instances
 */
export const notBoldNotDim: NonEmptyType = [22];

/**
 * Not Italic Sequence instance
 *
 * @category Instances
 */
export const notItalic: NonEmptyType = [23];

/**
 * Not Underline Sequence instance
 *
 * @category Instances
 */
export const notUnderlined: NonEmptyType = [24];

/**
 * Not Blinking Sequence instance
 *
 * @category Instances
 */
export const notBlinking: NonEmptyType = [25];

/**
 * Not Inversed Sequence instance
 *
 * @category Instances
 */
export const notInversed: NonEmptyType = [27];

/**
 * Not Hidden Sequence instance
 *
 * @category Instances
 */
export const notHidden: NonEmptyType = [28];

/**
 * Not Strikethrough Sequence instance
 *
 * @category Instances
 */
export const notStruckThrough: NonEmptyType = [29];

/**
 * Default foreground color Sequence instance
 *
 * @category Instances
 */
export const defaultForegroundColor: NonEmptyType = [39];

/**
 * Default background color Sequence instance
 *
 * @category Instances
 */
export const defaultBackgroundColor: NonEmptyType = [49];

/**
 * Overlined Sequence instance
 *
 * @category Instances
 */
export const overlined: NonEmptyType = [53];

/**
 * Not Overlined Sequence instance
 *
 * @category Instances
 */
export const notOverlined: NonEmptyType = [55];
