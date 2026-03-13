/** Module that implements an optional foreground color style characteristic */

import { MEquivalenceBasedEqualityData } from '@parischap/effect-lib';
import * as MTypes from '@parischap/effect-lib/MTypes';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as AsColor from '../../../../Color/Color.js';
import * as ASSequence from '../../../Sequence.js';
import * as ASColorOptionalStyleCharacteristic from './ColorOptionalStyleCharacteristic.js';
/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/ansi-styles/internal/StyleCharacteristic/OptionalStyleCharacteristic/ColorOptionalStyleCharacteristic/ForegroundColorStyleCharacteristic/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents an ASForegroundColorStyleCharacteristic
 *
 * @category Models
 */
export class Type extends ASColorOptionalStyleCharacteristic.Type {
  /** Class constructor */
  protected constructor(params: MTypes.Data<Type>) {
    super(params);
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Function that returns the id to show when the style characteristic is present */
  _toPresentId(value: Option.Option<AsColor.Type>): string {
    return Option.match(value, {
      onNone: Function.constant('DefaultColor'),
      onSome: AsColor.foregroundId,
    });
  }

  /** Function that returns the sequence when the style characteristic is present */
  _toPresentSequence(value: Option.Option<AsColor.Type>): ASSequence.OverOne {
    return Option.match(value, {
      onNone: Function.constant(ASSequence.defaultForegroundColor),
      onSome: AsColor.foregroundSequence,
    });
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
 * Missing BackgroundColor instance
 *
 * @category Instances
 */
export const missing: Type = Type.make({ value: Option.none() });

/**
 * Default ForegroundColor instance
 *
 * @category Instances
 */
export const defaultColor: Type = Type.make({ value: Option.some(Option.none()) });

/**
 * Constructor from color
 *
 * @category Constructors
 */
export const fromColor = (color: AsColor.Type): Type =>
  Type.make({ value: Option.some(Option.some(color)) });
