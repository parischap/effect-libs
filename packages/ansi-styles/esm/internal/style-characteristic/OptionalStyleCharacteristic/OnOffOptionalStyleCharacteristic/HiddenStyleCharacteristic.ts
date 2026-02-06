/** Module that implements the Hidden style characteristic */

import { MDataEquivalenceBasedEquality, MTypes } from '@parischap/effect-lib';
import { Option, Predicate } from 'effect';
import * as ASSequence from '../../../Sequence.js';
import * as ASOnOffOptionalStyleCharacteristic from './index.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/ansi-styles/internal/style-characteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/HiddenStyleCharacteristic/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents an ASHiddenStyleCharacteristic
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
    return 'Hidden';
  }

  /** Getter that returns the id to show when the style characteristic is off */
  get [ASOnOffOptionalStyleCharacteristic.offIdGetterSymbol](): string {
    return 'NotHidden';
  }

  /** Getter that returns the sequence corresponding to the active style characteristic */
  get [ASOnOffOptionalStyleCharacteristic.onSequenceGetterSymbol](): ASSequence.OverOne {
    return ASSequence.hidden;
  }

  /** Getter that returns the sequence corresponding to the inactive style characteristic */
  get [ASOnOffOptionalStyleCharacteristic.offSequenceGetterSymbol](): ASSequence.OverOne {
    return ASSequence.notHidden;
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
 * Missing Hidden instance
 *
 * @category Instances
 */
export const missing = Type.make({ value: Option.none() });

/**
 * On Hidden instance
 *
 * @category Instances
 */
export const on = Type.make({ value: Option.some(true) });

/**
 * Off Hidden instance
 *
 * @category Instances
 */
export const off = Type.make({ value: Option.some(false) });
