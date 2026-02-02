/**
 * Module that implements an optional style characteristic that can be missing, on or off. A `none`
 * represents a missing characteristic, a `some(true)` represents an on characteristic, a
 * `some(false)` represents an off characteristic
 */

import { MDataEquivalenceBasedEquality, MTypes } from '@parischap/effect-lib';
import { Boolean, Equivalence, Hash, Option } from 'effect';
import * as ASSequence from '../Sequence.js';
import * as ASStyleCharacteristicPresentOrMissing from './PresentOrMissing.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/internal/StyleCharacteristic/OnOffOrMissing/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Symbol used to name the onIdGetter
 *
 * @category Model symbols
 */
export const onIdGetterSymbol: unique symbol = Symbol.for(
  `${moduleTag}onIdGetter/`,
) as onIdGetterSymbol;
type onIdGetterSymbol = typeof onIdGetterSymbol;

/**
 * Symbol used to name the offIdGetter function
 *
 * @category Model symbols
 */
export const offIdGetterSymbol: unique symbol = Symbol.for(
  `${moduleTag}offIdGetter/`,
) as offIdGetterSymbol;
type offIdGetterSymbol = typeof offIdGetterSymbol;

/**
 * Symbol used to name the onSequenceGetter function
 *
 * @category Model symbols
 */
export const onSequenceGetterSymbol: unique symbol = Symbol.for(
  `${moduleTag}onSequenceGetter/`,
) as onSequenceGetterSymbol;
type onSequenceGetterSymbol = typeof onSequenceGetterSymbol;

/**
 * Symbol used to name the offSequenceGetter function
 *
 * @category Model symbols
 */
export const offSequenceGetterSymbol: unique symbol = Symbol.for(
  `${moduleTag}offSequenceGetter/`,
) as offSequenceGetterSymbol;
type offSequenceGetterSymbol = typeof offSequenceGetterSymbol;

/**
 * Type that represents an ASStyleCharacteristicOnOfforMissing
 *
 * @category Models
 */
export abstract class Type extends ASStyleCharacteristicPresentOrMissing.Type<boolean> {
  /** Class constructor */
  protected constructor(params: MTypes.Data<Type>) {
    super(params);
  }

  /** Getter that returns the id to show when the style characteristic is on */
  abstract get [onIdGetterSymbol](): string;

  /** Getter that returns the id to show when the style characteristic is off */
  abstract get [offIdGetterSymbol](): string;

  /** Function that returns the id to show when the style characteristic is present */
  [ASStyleCharacteristicPresentOrMissing.toPresentIdSymbol](value: boolean) {
    return Boolean.match(value, {
      onFalse: () => this[offIdGetterSymbol],
      onTrue: () => this[onIdGetterSymbol],
    });
  }

  /** Getter that returns the sequence corresponding to the active style characteristic */
  abstract get [onSequenceGetterSymbol](): ASSequence.NonEmptyType;

  /** Getter that returns the sequence corresponding to the inactive style characteristic */
  abstract get [offSequenceGetterSymbol](): ASSequence.NonEmptyType;

  /** Function that returns the sequence when the style characteristic is present */
  [ASStyleCharacteristicPresentOrMissing.toPresentSequenceSymbol](value: boolean) {
    return Boolean.match(value, {
      onFalse: () => this[offSequenceGetterSymbol],
      onTrue: () => this[onSequenceGetterSymbol],
    });
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
  }

  /** Function that implements the equivalence of `this` and `that` */
  protected [MDataEquivalenceBasedEquality.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
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
