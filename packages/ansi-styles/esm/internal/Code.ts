/** This modules implements an ansi code that produces an ANSI style, e.g. `\x1b[1m` for bold */

import { MFunction, MString, MTypes } from '@parischap/effect-lib';
import { Array, flow, Option } from 'effect';
import * as ASSequence from './Sequence.js';

/**
 * Type of an ANSI string
 *
 * @category Models
 */
export type Type = string;

/**
 * Builds an Code from a ASSequence.OverOne
 *
 * @category Constructors
 */
export const fromNonEmptySequence: MTypes.OneArgFunction<ASSequence.OverOne, string> = flow(
  Array.map(MString.fromNumber(10)),
  Array.join(';'),
  MString.prepend('\x1B['),
  MString.append('m'),
);

/**
 * Builds an Code from a ASSequence.Type
 *
 * @category Constructors
 */
export const fromSequence: MTypes.OneArgFunction<ASSequence.Type, string> = flow(
  Option.liftPredicate(MTypes.isReadonlyOverOne),
  Option.map(fromNonEmptySequence),
  Option.getOrElse(MFunction.constEmptyString),
);

/**
 * Empty Code instance
 *
 * @category Instances
 */
export const empty: Type = '';

/**
 * Reset Code instance
 *
 * @category Instances
 */
export const reset: Type = fromNonEmptySequence(ASSequence.reset);

/**
 * Bold Code instance
 *
 * @category Instances
 */
export const bold: Type = fromNonEmptySequence(ASSequence.bold);

/**
 * Dim Code instance
 *
 * @category Instances
 */
export const dim: Type = fromNonEmptySequence(ASSequence.dim);

/**
 * Italic Code instance
 *
 * @category Instances
 */
export const italic: Type = fromNonEmptySequence(ASSequence.italic);

/**
 * Underline Code instance
 *
 * @category Instances
 */
export const underlined: Type = fromNonEmptySequence(ASSequence.underlined);

/**
 * Blinking Code instance
 *
 * @category Instances
 */
export const blinking: Type = fromNonEmptySequence(ASSequence.blinking);

/**
 * Inversed Code instance
 *
 * @category Instances
 */
export const inversed: Type = fromNonEmptySequence(ASSequence.inversed);

/**
 * Hidden Code instance
 *
 * @category Instances
 */
export const hidden: Type = fromNonEmptySequence(ASSequence.hidden);

/**
 * Strikethrough Code instance
 *
 * @category Instances
 */
export const struckThrough: Type = fromNonEmptySequence(ASSequence.struckThrough);

/**
 * Not bold nor dim Code instance
 *
 * @category Instances
 */
export const notBoldNotDim: Type = fromNonEmptySequence(ASSequence.notBoldNotDim);

/**
 * Not italic Code instance
 *
 * @category Instances
 */
export const notItalic: Type = fromNonEmptySequence(ASSequence.notItalic);

/**
 * Not underlined Code instance
 *
 * @category Instances
 */
export const notUnderlined: Type = fromNonEmptySequence(ASSequence.notUnderlined);

/**
 * Not blinking Code instance
 *
 * @category Instances
 */
export const notBlinking: Type = fromNonEmptySequence(ASSequence.notBlinking);

/**
 * Not inversed Code instance
 *
 * @category Instances
 */
export const notInversed: Type = fromNonEmptySequence(ASSequence.notInversed);

/**
 * Not hidden Code instance
 *
 * @category Instances
 */
export const notHidden: Type = fromNonEmptySequence(ASSequence.notHidden);

/**
 * Not strikethrough Code instance
 *
 * @category Instances
 */
export const notStruckThrough: Type = fromNonEmptySequence(ASSequence.notStruckThrough);

/**
 * Default foreground color Code instance
 *
 * @category Instances
 */
export const defaultForegroundColor: Type = fromNonEmptySequence(ASSequence.defaultForegroundColor);

/**
 * Default background color Code instance
 *
 * @category Instances
 */
export const defaultBackgroundColor: Type = fromNonEmptySequence(ASSequence.defaultBackgroundColor);

/**
 * Overlined Code instance
 *
 * @category Instances
 */
export const overlined: Type = fromNonEmptySequence(ASSequence.overlined);

/**
 * Not overlined Code instance
 *
 * @category Instances
 */
export const notOverlined: Type = fromNonEmptySequence(ASSequence.notOverlined);
