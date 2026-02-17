/** This module defines ThreeBit colors */

import * as MDataEquivalenceBasedEquality from '@parischap/effect-lib/MDataEquivalenceBasedEquality'
import * as MTypes from '@parischap/effect-lib/MTypes'
import * as Array from 'effect/Array'
import * as Equivalence from 'effect/Equivalence'
import * as Hash from 'effect/Hash'
import * as Predicate from 'effect/Predicate'
import * as Struct from 'effect/Struct'
import * as ASThreeBitColorOffset from '../internal/Color/ThreeBitColorOffset.js';
import * as ASColor from './index.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/Color/ThreeBitColor/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * ASThreeBitColor Type
 *
 * @category Models
 */
export class Type extends ASColor.Type {
  /** Offset of this color */
  readonly offset: ASThreeBitColorOffset.Type;

  /** Indicates whether the color is bright */
  readonly isBright: boolean;

  /** Class constructor */
  private constructor({
    offset,
    isBright,
  }: {
    readonly offset: ASThreeBitColorOffset.Type;
    readonly isBright: boolean;
  }) {
    super({
      foregroundId: `${isBright ? 'Bright' : ''}${ASThreeBitColorOffset.toString(offset)}`,
      foregroundSequence: Array.of((isBright ? 90 : 30) + offset),
    });
    this.offset = offset;
    this.isBright = isBright;
  }

  /** Static constructor */
  static make(params: {
    readonly offset: ASThreeBitColorOffset.Type;
    readonly isBright: boolean;
  }): Type {
    return new Type(params);
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
  }

  /** Function that implements the equivalence of `this` and `that` */
  [MDataEquivalenceBasedEquality.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
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
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  self.offset === that.offset && self.isBright === that.isBright;

/**
 * Gets the `offset` property of `self`
 *
 * @category Destructors
 */
export const offset: MTypes.OneArgFunction<Type, ASThreeBitColorOffset.Type> = Struct.get('offset');

/**
 * Gets the `isBright` property of `self`
 *
 * @category Destructors
 */
export const isBright: MTypes.OneArgFunction<Type, boolean> = Struct.get('isBright');

/**
 * Constructor of normal colors
 *
 * @category Constructors
 */
export const make = (offset: ASThreeBitColorOffset.Type): Type =>
  Type.make({ offset, isBright: false });

/**
 * Constructor of bright colors
 *
 * @category Original instances
 */
export const makeBright = (offset: ASThreeBitColorOffset.Type) =>
  Type.make({ offset, isBright: true });
/**
 * Original Black color instance
 *
 * @category Original instances
 */
export const black: Type = make(ASThreeBitColorOffset.Type.Black);
/**
 * Original Red color instance
 *
 * @category Original instances
 */
export const red: Type = make(ASThreeBitColorOffset.Type.Red);
/**
 * Original Green color instance
 *
 * @category Original instances
 */
export const green: Type = make(ASThreeBitColorOffset.Type.Green);
/**
 * Original Yellow color instance
 *
 * @category Original instances
 */
export const yellow: Type = make(ASThreeBitColorOffset.Type.Yellow);
/**
 * Original Blue color instance
 *
 * @category Original instances
 */
export const blue: Type = make(ASThreeBitColorOffset.Type.Blue);
/**
 * Original Magenta color instance
 *
 * @category Original instances
 */
export const magenta: Type = make(ASThreeBitColorOffset.Type.Magenta);
/**
 * Original Cyan color instance
 *
 * @category Original instances
 */
export const cyan: Type = make(ASThreeBitColorOffset.Type.Cyan);
/**
 * Original White color instance
 *
 * @category Original instances
 */
export const white: Type = make(ASThreeBitColorOffset.Type.White);

/**
 * Original Bright Black color instance
 *
 * @category Original instances
 */
export const brightBlack: Type = makeBright(ASThreeBitColorOffset.Type.Black);
/**
 * Original Bright Red color instance
 *
 * @category Original instances
 */
export const brightRed: Type = makeBright(ASThreeBitColorOffset.Type.Red);
/**
 * Original Bright Green color instance
 *
 * @category Original instances
 */
export const brightGreen: Type = makeBright(ASThreeBitColorOffset.Type.Green);
/**
 * Original Bright Yellow color instance
 *
 * @category Original instances
 */
export const brightYellow: Type = makeBright(ASThreeBitColorOffset.Type.Yellow);
/**
 * Original Bright Blue color instance
 *
 * @category Original instances
 */
export const brightBlue: Type = makeBright(ASThreeBitColorOffset.Type.Blue);
/**
 * Original Bright Magenta color instance
 *
 * @category Original instances
 */
export const brightMagenta: Type = makeBright(ASThreeBitColorOffset.Type.Magenta);
/**
 * Original Bright Cyan color instance
 *
 * @category Original instances
 */
export const brightCyan: Type = makeBright(ASThreeBitColorOffset.Type.Cyan);
/**
 * Original Bright White color instance
 *
 * @category Original instances
 */
export const brightWhite: Type = makeBright(ASThreeBitColorOffset.Type.White);
