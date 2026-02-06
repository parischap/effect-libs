/** Module that implements an optional style characteristic */

import { MDataBase, MDataEquivalenceBasedEquality, MFunction, MTypes } from '@parischap/effect-lib';
import { Function, Option, pipe } from 'effect';
import * as ASSequence from '../Sequence.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/internal/StyleCharacteristic/PresentOrMissing/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Symbol used to name the toPresentId function
 *
 * @category Model symbols
 */
export const toPresentIdSymbol: unique symbol = Symbol.for(
  `${moduleTag}toPresentId/`,
) as toPresentIdSymbol;
type toPresentIdSymbol = typeof toPresentIdSymbol;

/**
 * Symbol used to name the toPresentSequence function
 *
 * @category Model symbols
 */
export const toPresentSequenceSymbol: unique symbol = Symbol.for(
  `${moduleTag}toPresentSequence/`,
) as toPresentSequenceSymbol;
type toPresentSequenceSymbol = typeof toPresentSequenceSymbol;

/**
 * Type that represents an ASStyleCharacteristicOnOfforMissing
 *
 * @category Models
 */
export abstract class Type<out A> extends MDataEquivalenceBasedEquality.Class {
  /**
   * The value of the style characteristic:
   *
   * - none: it is missing
   * - some: it's present
   */
  readonly value: Option.Option<A>;

  /** Class constructor */
  protected constructor({ value }: MTypes.Data<Type<A>>) {
    super();
    this.value = value;
  }

  /** Function that returns the id to show when the style characteristic is present */
  abstract [toPresentIdSymbol](presentValue: A): string;

  /** Returns the `id` of `this` */
  [MDataBase.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type<A>) {
      return Option.match(this.value, {
        onNone: MFunction.constEmptyString,
        onSome: (value) => this[toPresentIdSymbol](value),
      });
    };
  }

  /** Function that returns the sequence when the style characteristic is present */
  abstract [toPresentSequenceSymbol](presentValue: A): ASSequence.OverOne;

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Returns the sequence of `self`
 *
 * @category Destructors
 */
export const toSequence = <A>(self: Type<A>): ASSequence.Type =>
  Option.match(self.value, {
    onNone: Function.constant(ASSequence.empty),
    onSome: (value) => self[toPresentSequenceSymbol](value),
  });

/**
 * Returns `self` if `self` contains a `some`. Otherwise, returns `that`.
 *
 * @category Utils
 */
export const PresentOrElse = <T extends Type<unknown>>(self: T, that: T): T =>
  pipe(self.value, Option.as(self), Option.getOrElse(Function.constant(that)));

/**
 * Returns `whenEqual` if `self` is equal to 'that'. Otherwise, returns `self`.
 *
 * @category Utils
 */
export const orWhenEquals = <T extends Type<unknown>>(self: T, that: T, whenEqual: T): T =>
  self[MDataEquivalenceBasedEquality.isEquivalentToSymbol](that) ? whenEqual : self;
