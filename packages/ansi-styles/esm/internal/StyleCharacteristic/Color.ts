/**
 * Module that implements an optional foreground color style characteristic. A `none` represents a
 * missing characteristic, a `some(some(color))` represents a color, a `some(none())` represents the
 * default color
 */

import { MDataEquivalenceBasedEquality, MTypes } from '@parischap/effect-lib';
import { Equivalence, Hash, Option } from 'effect';
import * as AsColorBase from '../../Color/Base.js';
import * as ASStyleCharacteristicPresentOrMissing from './PresentOrMissing.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/internal/StyleCharacteristic/Color/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents an ASStyleCharacteristicColor
 *
 * @category Models
 */
export abstract class Type extends ASStyleCharacteristicPresentOrMissing.Type<
  Option.Option<AsColorBase.Type>
> {
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

const _equivalence: Equivalence.Equivalence<Option.Option<Option.Option<AsColorBase.Type>>> =
  Option.getEquivalence(Option.getEquivalence(AsColorBase.equivalence));

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  _equivalence(self.value, that.value);
