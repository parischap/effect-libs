/**
 * This module defines all available ANSI colors
 *
 * You can use the RGB.make function to build more RGB colors
 */

import { MDataEquivalenceBasedEquality } from '@parischap/effect-lib';
import { Equal, Hash, Inspectable, Pipeable } from 'effect';
import type * as ASSequence from '../Sequence.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/Color/Base/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/** Symbol used to name the toForegroundSequence function */
export const toForegroundSequenceSymbol: unique symbol = Symbol.for(
  `${moduleTag}toForegroundSequence/`,
) as toForegroundSequenceSymbol;
type toForegroundSequenceSymbol = typeof toForegroundSequenceSymbol;

/**
 * ColorBase Type
 *
 * @category Models
 */
export abstract class Type
  extends MDataEquivalenceBasedEquality.Type
  implements Pipeable.Pipeable, Inspectable.Inspectable, Equal.Equal, Hash.Hash
{
  /** Gets the foreground sequence of `this` */
  abstract [toForegroundSequenceSymbol](): ASSequence.NonEmptyType;

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}
