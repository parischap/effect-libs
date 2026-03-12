/** Module that implements the Inversed style characteristic */

import * as MTypes from '@parischap/effect-lib/MTypes';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as ASSequence from '../../../Sequence.js';
import * as ASOnOffOptionalStyleCharacteristic from './OnOffOptionalStyleCharacteristic.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/ansi-styles/internal/StyleCharacteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/InversedStyleCharacteristic/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents an ASInversedStyleCharacteristic
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
  get _onIdGetter(): string {
    return 'Inversed';
  }

  /** Getter that returns the id to show when the style characteristic is off */
  get _offIdGetter(): string {
    return 'NotInversed';
  }

  /** Getter that returns the sequence corresponding to the active style characteristic */
  get _onSequenceGetter(): ASSequence.OverOne {
    return ASSequence.inversed;
  }

  /** Getter that returns the sequence corresponding to the inactive style characteristic */
  get _offSequenceGetter(): ASSequence.OverOne {
    return ASSequence.notInversed;
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  [MEquivalenceBasedEqualityData.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
    return Predicate.hasProperty(that, TypeId);
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Missing Inversed instance
 *
 * @category Instances
 */
export const missing = Type.make({ value: Option.none() });

/**
 * On Inversed instance
 *
 * @category Instances
 */
export const on = Type.make({ value: Option.some(true) });

/**
 * Off Inversed instance
 *
 * @category Instances
 */
export const off = Type.make({ value: Option.some(false) });
