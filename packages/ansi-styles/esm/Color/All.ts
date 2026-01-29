/** This module defines all available ANSI colors */

import { Array, Equivalence, Number } from 'effect';
import type * as ASSequence from '../Sequence.js';
import * as ASColorBase from './Base.js';
import * as ASColorEightBit from './EightBit.js';
import * as ASColorRgb from './Rgb.js';
import * as ASColorThreeBit from './ThreeBit.js';

/**
 * Type of a Color
 *
 * @category Models
 */
export type Type = ASColorThreeBit.Type | ASColorEightBit.Type | ASColorRgb.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const isThreeBit = (u: Type): u is ASColorThreeBit.Type => u instanceof ASColorThreeBit.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const isEightBit = (u: Type): u is ASColorEightBit.Type => u instanceof ASColorEightBit.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const isRgb = (u: Type): u is ASColorRgb.Type => u instanceof ASColorRgb.Type;

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  isThreeBit(self) && isThreeBit(that) ? ASColorThreeBit.equivalence(self, that)
  : isEightBit(self) && isEightBit(that) ? ASColorEightBit.equivalence(self, that)
  : isRgb(self) && isRgb(that) ? ASColorRgb.equivalence(self, that)
  : false;

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
  self[ASColorBase.toForegroundSequenceSymbol]();

/**
 * Gets the background sequence of `self`
 *
 * @category Destructors
 */
export const toBackgroundSequence = (self: Type): ASSequence.NonEmptyType =>
  Array.modifyNonEmptyHead(self[ASColorBase.toForegroundSequenceSymbol](), Number.sum(10));
