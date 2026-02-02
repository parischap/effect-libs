/**
 * This module defines all available ANSI colors
 *
 * You can use the RGB.make function to build more RGB colors
 */

import { MDataEquivalenceBasedEquality } from '@parischap/effect-lib';
import { Array, Equal, Equivalence, Hash, Inspectable, Number, Pipeable } from 'effect';
import type * as ASSequence from '../internal/Sequence.js';

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

/**
 * Gets the id of `self`
 *
 * @category Destructors
 */
export const toString = (self: Type): string => self.toString();

/**
 * Gets the foreground id of `self`
 *
 * @category Destructors
 */
export const toForegroundId = (self: Type): string => self.toString();

/**
 * Gets the background id of `self`
 *
 * @category Destructors
 */
export const toBackgroundId = (self: Type): string => `In${self.toString()}`;

/**
 * Gets the foreground sequence of `self`
 *
 * @category Destructors
 */
export const toForegroundSequence = (self: Type): ASSequence.NonEmptyType =>
  self[toForegroundSequenceSymbol]();

/**
 * Gets the background sequence of `self`
 *
 * @category Destructors
 */
export const toBackgroundSequence = (self: Type): ASSequence.NonEmptyType =>
  Array.modifyNonEmptyHead(self[toForegroundSequenceSymbol](), Number.sum(10));

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  self[MDataEquivalenceBasedEquality.isEquivalentToSymbol](that);
