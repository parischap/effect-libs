/** Module that implements an optional style characteristic */

import { MDataBase, MDataEquivalenceBasedEquality, MFunction, MTypes } from '@parischap/effect-lib';
import { Function, Option, pipe } from 'effect';
import * as ASSequence from '../../Sequence.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/internal/StyleCharacteristic/PresentOrMissing/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Symbol used to name the getIdWhenPresent function
 *
 * @category Model symbols
 */
export const getIdWhenPresentSymbol: unique symbol = Symbol.for(
  `${moduleTag}getIdWhenPresent/`,
) as getIdWhenPresentSymbol;
type getIdWhenPresentSymbol = typeof getIdWhenPresentSymbol;

/**
 * Symbol used to name the sequencePresentGetter function
 *
 * @category Model symbols
 */
export const getSequenceWhenPresentSymbol: unique symbol = Symbol.for(
  `${moduleTag}getSequenceWhenPresent/`,
) as getSequenceWhenPresentSymbol;
type getSequenceWhenPresentSymbol = typeof getSequenceWhenPresentSymbol;

/**
 * Type that represents an ASStyleCharacteristicOnOfforMissing
 *
 * @category Models
 */
export abstract class Type<A> extends MDataEquivalenceBasedEquality.Type {
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
  abstract [getIdWhenPresentSymbol](presentValue: A): string;

  /** Returns the `id` of `this` */
  protected [MDataBase.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type<A>) {
      return Option.match(this.value, {
        onNone: MFunction.constEmptyString,
        onSome: this[getIdWhenPresentSymbol],
      });
    };
  }

  /** Function that returns the sequence when the style characteristic is present */
  abstract [getSequenceWhenPresentSymbol](presentValue: A): ASSequence.NonEmptyType;

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
export const getSequence = <A>(self: Type<symbol, A>): ASSequence.Type =>
  Option.match(self.value, {
    onNone: Function.constant(ASSequence.empty),
    onSome: self[getSequenceWhenPresentSymbol],
  });

/**
 * Returns `self` if `self` contains a `some`. Otherwise, returns `that`.
 *
 * @category Utils
 */
export const orElse =
  <S extends symbol, A>(that: Type<S, A>) =>
  (self: Type<S, A>): Type<S, A> =>
    pipe(self.value, Option.as(self), Option.getOrElse(Function.constant(that)));

/**
 * Returns `whenEqual` if `self` is equal to 'that'. Otherwise, returns `self`.
 *
 * @category Utils
 */
export const orWhenEquals =
  <S extends symbol, A>(that: Type<S, A>, whenEqual: Type<S, A>) =>
  (self: Type<S, A>): Type<S, A> =>
    self[MDataEquivalenceBasedEquality.isEquivalentToSymbol](that) ? whenEqual : self;
