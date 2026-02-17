/** Module that implements the Underlined style characteristic */

import * as MDataEquivalenceBasedEquality from '@parischap/effect-lib/MDataEquivalenceBasedEquality'
import * as MTypes from '@parischap/effect-lib/MTypes'
import * as Option from 'effect/Option'
import * as Predicate from 'effect/Predicate'
import * as ASSequence from '../../../Sequence.js';
import * as ASOnOffOptionalStyleCharacteristic from './index.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/ansi-styles/internal/style-characteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/UnderlinedStyleCharacteristic/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents an ASUnderlinedStyleCharacteristic
 *
 * @category Models
 */
export class Type extends ASOnOffOptionalStyleCharacteristic.Type {
  /** Class constructor */
  private constructor(params: MTypes.Data<Type>) {
    super(params);
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Getter that returns the id to show when the style characteristic is on */
  get [ASOnOffOptionalStyleCharacteristic.onIdGetterSymbol](): string {
    return 'Underlined';
  }

  /** Getter that returns the id to show when the style characteristic is off */
  get [ASOnOffOptionalStyleCharacteristic.offIdGetterSymbol](): string {
    return 'NotUnderlined';
  }

  /** Getter that returns the sequence corresponding to the active style characteristic */
  get [ASOnOffOptionalStyleCharacteristic.onSequenceGetterSymbol](): ASSequence.OverOne {
    return ASSequence.underlined;
  }

  /** Getter that returns the sequence corresponding to the inactive style characteristic */
  get [ASOnOffOptionalStyleCharacteristic.offSequenceGetterSymbol](): ASSequence.OverOne {
    return ASSequence.notUnderlined;
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  [MDataEquivalenceBasedEquality.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
    return Predicate.hasProperty(that, _TypeId);
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Missing Underlined instance
 *
 * @category Instances
 */
export const missing = Type.make({ value: Option.none() });

/**
 * On Underlined instance
 *
 * @category Instances
 */
export const on = Type.make({ value: Option.some(true) });

/**
 * Off Underlined instance
 *
 * @category Instances
 */
export const off = Type.make({ value: Option.some(false) });
