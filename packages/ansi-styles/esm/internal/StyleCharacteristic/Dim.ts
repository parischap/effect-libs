/** Module that implements the Dim style characteristic */

import { MDataEquivalenceBasedEquality, MTypes } from '@parischap/effect-lib';
import { Option, Predicate } from 'effect';
import * as ASSequence from '../../Sequence.js';
import * as ASStyleCharacteristicOnOffOrMissing from './OnOffOrMissing.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/internal/StyleCharacteristic/Dim/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents an ASStyleCharacteristicDim
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
    return 'Dim';
  }

  /** Getter that returns the id to show when the style characteristic is off */
  get [ASStyleCharacteristicOnOffOrMissing.offIdGetterSymbol](): string {
    return 'NotDim';
  }

  /** Getter that returns the sequence corresponding to the active style characteristic */
  get [ASStyleCharacteristicOnOffOrMissing.onSequenceGetterSymbol](): ASSequence.NonEmptyType {
    return ASSequence.dim;
  }

  /** Getter that returns the sequence corresponding to the inactive style characteristic */
  get [ASStyleCharacteristicOnOffOrMissing.offSequenceGetterSymbol](): ASSequence.NonEmptyType {
    return ASSequence.notBoldNotDim;
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
 * Missing Dim instance
 *
 * @category Instances
 */
export const missing = Type.make({ value: Option.none() });

/**
 * On Dim instance
 *
 * @category Instances
 */
export const on = Type.make({ value: Option.some(true) });

/**
 * Off Dim instance
 *
 * @category Instances
 */
export const off = Type.make({ value: Option.some(false) });
