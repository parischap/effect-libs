/** Module that implements an optional foreground color style characteristic */

import { MDataEquivalenceBasedEquality, MTypes } from '@parischap/effect-lib';
import { Function, Option, Predicate } from 'effect';
import * as AsColorBase from '../../Color/Base.js';
import * as ASSequence from '../Sequence.js';
import * as ASStyleCharacteristicColor from './Color.js';
import * as ASStyleCharacteristicPresentOrMissing from './PresentOrMissing.js';
/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/internal/StyleCharacteristic/ForegroundColor/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents an ASStyleCharacteristicForegroundColor
 *
 * @category Models
 */
export class Type extends ASStyleCharacteristicColor.Type {
  /** Class constructor */
  protected constructor(params: MTypes.Data<Type>) {
    super(params);
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Function that returns the id to show when the style characteristic is present */
  [ASStyleCharacteristicPresentOrMissing.toPresentIdSymbol](
    value: Option.Option<AsColorBase.Type>,
  ): string {
    return Option.match(value, {
      onNone: Function.constant('DefaultColor'),
      onSome: AsColorBase.toForegroundId,
    });
  }

  /** Function that returns the sequence when the style characteristic is present */
  [ASStyleCharacteristicPresentOrMissing.toPresentSequenceSymbol](
    value: Option.Option<AsColorBase.Type>,
  ): ASSequence.NonEmptyType {
    return Option.match(value, {
      onNone: Function.constant(ASSequence.defaultForegroundColor),
      onSome: AsColorBase.toForegroundSequence,
    });
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
export const fromColor = (color: AsColorBase.Type): Type =>
  Type.make({ value: Option.some(Option.some(color)) });
