/**
 * This module defines all available ANSI colors
 *
 * You can use the RGB.make function to build more RGB colors
 */

import { MDataBase, MDataEquivalenceBasedEquality, MTypes } from '@parischap/effect-lib';
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

/**
 * ColorBase Type
 *
 * @category Models
 */
export abstract class Type
  extends MDataEquivalenceBasedEquality.Class
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
  [MDataBase.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.foregroundId;
    };
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
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
  self[MDataEquivalenceBasedEquality.isEquivalentToSymbol](that);

/**
 * Gets the id of `self`
 *
 * @category Destructors
 */
export const toString: MTypes.OneArgFunction<Type, string> = foregroundId;
