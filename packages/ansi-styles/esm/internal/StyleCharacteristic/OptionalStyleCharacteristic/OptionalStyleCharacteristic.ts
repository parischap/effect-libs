/** Module that implements an optional style characteristic */

import { MData } from '@parischap/effect-lib';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MFunction from '@parischap/effect-lib/MFunction';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { pipe } from 'effect';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as ASSequence from '../../Sequence.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/ansi-styles/internal/StyleCharacteristic/OptionalStyleCharacteristic/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents an ASOnOffOptionalStyleCharacteristic
 *
 * @category Models
 */
export abstract class Type<out A> extends MEquivalenceBasedEqualityData.Class {
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
  abstract _toPresentId(presentValue: A): string;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type<A>) {
      return Option.match(this.value, {
        onNone: MFunction.constEmptyString,
        onSome: (value) => this._toPresentId(value),
      });
    };
  }

  /** Function that returns the sequence when the style characteristic is present */
  abstract _toPresentSequence(presentValue: A): ASSequence.OverOne;

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
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
    onSome: (value) => self._toPresentSequence(value),
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
  self[MEquivalenceBasedEqualityData.isEquivalentToSymbol](that) ? whenEqual : self;
