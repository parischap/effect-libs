/**
 * Module that implements an optional foreground color style characteristic. A `none` represents a
 * missing characteristic, a `some(some(color))` represents a color, a `some(none())` represents the
 * default color
 */

import { MDataEquivalenceBasedEquality, MTypes } from '@parischap/effect-lib';
import { Equivalence, Hash, Option } from 'effect';
import * as AsColor from '../../../../Color/index.js';
import * as ASOptionalStyleCharacteristic from '../index.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/ansi-styles/internal/style-characteristic/OptionalStyleCharacteristic/ColorOptionalStyleCharacteristic/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents an ASColorOptionalStyleCharacteristic
 *
 * @category Models
 */
export abstract class Type extends ASOptionalStyleCharacteristic.Type<Option.Option<AsColor.Type>> {
  /** Class constructor */
  protected constructor(params: MTypes.Data<Type>) {
    super(params);
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
  }

  /** Function that implements the equivalence of `this` and `that` */
  [MDataEquivalenceBasedEquality.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

const _equivalence: Equivalence.Equivalence<Option.Option<Option.Option<AsColor.Type>>> =
  Option.getEquivalence(Option.getEquivalence(AsColor.equivalence));

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  _equivalence(self.value, that.value);
