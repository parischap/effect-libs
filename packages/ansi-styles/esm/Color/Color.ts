/**
 * This module defines the abstract Color type, which is the base for all ANSI color kinds
 * (ThreeBit, EightBit, and RGB)
 */

import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MTypes from '@parischap/effect-lib/MTypes';
import * as Array from 'effect/Array';
import * as Equal from 'effect/Equal';
import * as Equivalence from 'effect/Equivalence';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import * as Number from 'effect/Number';
import * as Pipeable from 'effect/Pipeable';
import type * as ASSequence from '../internal/Sequence.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/Color/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Color Type
 *
 * @category Models
 */
export abstract class Type
  extends MEquivalenceBasedEqualityData.Class
  implements Pipeable.Pipeable, Inspectable.Inspectable, Equal.Equal, Hash.Hash
{
  /** Id of the this color used as foreground color */
  readonly foregroundId: string;

  /** Id of the this color used as background color */
  readonly backgroundId: string;

  /** Sequence of this color used as foreground color */
  readonly foregroundSequence: ASSequence.OverOne;

  /** Sequence of this color used as background color */
  readonly backgroundSequence: ASSequence.OverOne;

  constructor({
    foregroundId,
    foregroundSequence,
  }: {
    readonly foregroundId: string;
    readonly foregroundSequence: ASSequence.OverOne;
  }) {
    super();
    this.foregroundId = foregroundId;
    this.backgroundId = `In${foregroundId}`;
    this.foregroundSequence = foregroundSequence;
    this.backgroundSequence = Array.modifyNonEmptyHead(foregroundSequence, Number.sum(10));
  }

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.foregroundId;
    };
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Gets the foreground id of `self`
 *
 * @category Destructors
 */
export const foregroundId = (self: Type): string => self.foregroundId;

/**
 * Gets the background id of `self`
 *
 * @category Destructors
 */
export const backgroundId = (self: Type): string => self.backgroundId;

/**
 * Gets the foreground sequence of `self`
 *
 * @category Destructors
 */
export const foregroundSequence = (self: Type): ASSequence.OverOne => self.foregroundSequence;

/**
 * Gets the background sequence of `self`
 *
 * @category Destructors
 */
export const backgroundSequence = (self: Type): ASSequence.OverOne => self.backgroundSequence;
/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  self[MEquivalenceBasedEqualityData.isEquivalentToSymbol](that);

/**
 * Gets the id of `self`
 *
 * @category Destructors
 */
export const toString: MTypes.OneArgFunction<Type, string> = foregroundId;
