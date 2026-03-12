/** Module that implements the Blinking style characteristic */

import * as MTypes from '@parischap/effect-lib/MTypes';
import * as Equivalence from 'effect/Equivalence';
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
  '@parischap/ansi-styles/internal/StyleCharacteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/BlinkingStyleCharacteristic/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents an ASBlinkingStyleCharacteristic
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
    return 'Blinking';
  }

  /** Getter that returns the id to show when the style characteristic is off */
  get _offIdGetter(): string {
    return 'NotBlinking';
  }

  /** Getter that returns the sequence corresponding to the active style characteristic */
  get _onSequenceGetter(): ASSequence.OverOne {
    return ASSequence.blinking;
  }

  /** Getter that returns the sequence corresponding to the inactive style characteristic */
  get _offSequenceGetter(): ASSequence.OverOne {
    return ASSequence.notBlinking;
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
 * Missing Blinking instance
 *
 * @category Instances
 */
export const missing = Type.make({ value: Option.none() });

/**
 * On Blinking instance
 *
 * @category Instances
 */
export const on = Type.make({ value: Option.some(true) });

/**
 * Off Blinking instance
 *
 * @category Instances
 */
export const off = Type.make({ value: Option.some(false) });

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  self[MEquivalenceBasedEqualityData.isEquivalentToSymbol](that);
