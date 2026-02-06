/** Module that implements an optional foreground color style characteristic */

import { MDataEquivalenceBasedEquality, MTypes } from '@parischap/effect-lib';
import { Function, Option, Predicate } from 'effect';
import * as AsColor from '../../../../Color/index.js';
import * as ASSequence from '../../../Sequence.js';
import * as ASOptionalStyleCharacteristic from '../index.js';
import * as ASColorOptionalStyleCharacteristic from './index.js';
/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/ansi-styles/internal/style-characteristic/OptionalStyleCharacteristic/ColorOptionalStyleCharacteristic/ForegroundColorStyleCharacteristic/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

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
  [ASOptionalStyleCharacteristic.toPresentIdSymbol](value: Option.Option<AsColor.Type>): string {
    return Option.match(value, {
      onNone: Function.constant('DefaultColor'),
      onSome: AsColor.foregroundId,
    });
  }

  /** Function that returns the sequence when the style characteristic is present */
  [ASOptionalStyleCharacteristic.toPresentSequenceSymbol](
    value: Option.Option<AsColor.Type>,
  ): ASSequence.OverOne {
    return Option.match(value, {
      onNone: Function.constant(ASSequence.defaultForegroundColor),
      onSome: AsColor.foregroundSequence,
    });
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
