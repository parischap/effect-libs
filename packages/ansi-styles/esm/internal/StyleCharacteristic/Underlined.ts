/** Module that implements the Underlined style characteristic */

import { MDataEquivalenceBasedEquality, MTypes } from '@parischap/effect-lib';
import { Option, Predicate } from 'effect';
import * as ASSequence from '../../Sequence.js';
import * as ASStyleCharacteristicOnOffOrMissing from './OnOffOrMissing.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/internal/StyleCharacteristic/Underlined/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents an ASStyleCharacteristicUnderlined
 *
 * @category Models
 */
export class Type extends ASStyleCharacteristicOnOffOrMissing.Type {
  /** Class constructor */
  private constructor(params: MTypes.Data<Type>) {
    super(params);
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Getter that returns the id to show when the style characteristic is on */
  get [ASStyleCharacteristicOnOffOrMissing.onIdGetterSymbol](): string {
    return 'Underlined';
  }

  /** Getter that returns the id to show when the style characteristic is off */
  get [ASStyleCharacteristicOnOffOrMissing.offIdGetterSymbol](): string {
    return 'NotUnderlined';
  }

  /** Getter that returns the sequence corresponding to the active style characteristic */
  get [ASStyleCharacteristicOnOffOrMissing.onSequenceGetterSymbol](): ASSequence.NonEmptyType {
    return ASSequence.underlined;
  }

  /** Getter that returns the sequence corresponding to the inactive style characteristic */
  get [ASStyleCharacteristicOnOffOrMissing.offSequenceGetterSymbol](): ASSequence.NonEmptyType {
    return ASSequence.notUnderlined;
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  protected [MDataEquivalenceBasedEquality.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
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
