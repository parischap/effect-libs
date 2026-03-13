/**
 * Module that implements an optional style characteristic that can be missing, on or off. A `none`
 * represents a missing characteristic, a `some(true)` represents an on characteristic, a
 * `some(false)` represents an off characteristic
 */

import { MEquivalenceBasedEqualityData } from '@parischap/effect-lib';
import * as MTypes from '@parischap/effect-lib/MTypes';
import * as Boolean from 'effect/Boolean';
import * as Equivalence from 'effect/Equivalence';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import * as ASSequence from '../../../Sequence.js';
import * as ASOptionalStyleCharacteristic from '../OptionalStyleCharacteristic.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/ansi-styles/internal/StyleCharacteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents an ASOnOffOptionalStyleCharacteristic
 *
 * @category Models
 */
export abstract class Type extends ASOptionalStyleCharacteristic.Type<boolean> {
  /** Class constructor */
  protected constructor(params: MTypes.Data<Type>) {
    super(params);
  }

  /** Getter that returns the id to show when the style characteristic is on */
  abstract get _onIdGetter(): string;

  /** Getter that returns the id to show when the style characteristic is off */
  abstract get _offIdGetter(): string;

  /** Function that returns the id to show when the style characteristic is present */
  _toPresentId(value: boolean) {
    return Boolean.match(value, {
      onFalse: () => this._offIdGetter,
      onTrue: () => this._onIdGetter,
    });
  }

  /** Getter that returns the sequence corresponding to the active style characteristic */
  abstract get _onSequenceGetter(): ASSequence.OverOne;

  /** Getter that returns the sequence corresponding to the inactive style characteristic */
  abstract get _offSequenceGetter(): ASSequence.OverOne;

  /** Function that returns the sequence when the style characteristic is present */
  _toPresentSequence(value: boolean) {
    return Boolean.match(value, {
      onFalse: () => this._offSequenceGetter,
      onTrue: () => this._onSequenceGetter,
    });
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
  }

  /** Function that implements the equivalence of `this` and `that` */
  [MEquivalenceBasedEqualityData.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

const _equivalence: Equivalence.Equivalence<Option.Option<boolean>> = Option.getEquivalence(
  Boolean.Equivalence,
);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence = <T extends Type>(self: T, that: T) =>
  _equivalence(self.value, that.value);
