/** This module defines ThreeBit colors */

import { MDataBase, MDataEquivalenceBasedEquality, MMatch, MTypes } from '@parischap/effect-lib';
import { Array, Equivalence, flow, Function, Hash, Predicate, Struct } from 'effect';
import * as ASSequence from '../Sequence.js';
import * as ASColorBase from './Base.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/Color/ThreeBit/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Possible three-bit color offsets
 *
 * @category Models
 */
export enum Offset {
  Black = 0,
  Red = 1,
  Green = 2,
  Yellow = 3,
  Blue = 4,
  Magenta = 5,
  Cyan = 6,
  White = 7,
}

/**
 * Namespace for three-bit color offsets
 *
 * @category Models
 */
export namespace Offset {
  /**
   * Builds the id of a color from its offset
   *
   * @category Destructors
   */
  export const toString: MTypes.OneArgFunction<Offset, string> = flow(
    MMatch.make,
    flow(
      MMatch.whenIs(Offset.Black, Function.constant('Black')),
      MMatch.whenIs(Offset.Red, Function.constant('Red')),
      MMatch.whenIs(Offset.Green, Function.constant('Green')),
      MMatch.whenIs(Offset.Yellow, Function.constant('Yellow')),
      MMatch.whenIs(Offset.Blue, Function.constant('Blue')),
      MMatch.whenIs(Offset.Magenta, Function.constant('Magenta')),
      MMatch.whenIs(Offset.Cyan, Function.constant('Cyan')),
      MMatch.whenIs(Offset.White, Function.constant('White')),
    ),
    MMatch.exhaustive,
  );
}

/**
 * ColorThreeBit Type
 *
 * @category Models
 */
export class Type extends ASColorBase.Type {
  /** Offset of this color */
  readonly offset: Offset;

  /** Indicates whether the color is bright */
  readonly isBright: boolean;

  /** Gets the foreground sequence of `this` */
  [ASColorBase.toForegroundSequenceSymbol](): ASSequence.NonEmptyType {
    return Array.of((this.isBright ? 90 : 30) + this.offset);
  }

  /** Class constructor */
  private constructor({ offset, isBright }: MTypes.Data<Type>) {
    super();
    this.offset = offset;
    this.isBright = isBright;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the `id` of `this` */
  protected [MDataBase.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return (this.isBright ? 'Bright' : '') + Offset.toString(this.offset);
    };
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
  }

  /** Function that implements the equivalence of `this` and `that` */
  protected [MDataEquivalenceBasedEquality.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
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
export const offset: MTypes.OneArgFunction<Type, Offset> = Struct.get('offset');

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
export const make = (offset: Offset): Type => Type.make({ offset, isBright: false });

/**
 * Constructor of bright colors
 *
 * @category Original instances
 */
export const makeBright = (offset: Offset) => Type.make({ offset, isBright: true });

/**
 * Original Black color instance
 *
 * @category Original instances
 */
export const Black: Type = make(Offset.Black);
/**
 * Original Red color instance
 *
 * @category Original instances
 */
export const Red: Type = make(Offset.Red);
/**
 * Original Green color instance
 *
 * @category Original instances
 */
export const Green: Type = make(Offset.Green);
/**
 * Original Yellow color instance
 *
 * @category Original instances
 */
export const Yellow: Type = make(Offset.Yellow);
/**
 * Original Blue color instance
 *
 * @category Original instances
 */
export const Blue: Type = make(Offset.Blue);
/**
 * Original Magenta color instance
 *
 * @category Original instances
 */
export const Magenta: Type = make(Offset.Magenta);
/**
 * Original Cyan color instance
 *
 * @category Original instances
 */
export const Cyan: Type = make(Offset.Cyan);
/**
 * Original White color instance
 *
 * @category Original instances
 */
export const White: Type = make(Offset.White);

/**
 * Original Bright Black color instance
 *
 * @category Original instances
 */
export const BrightBlack: Type = makeBright(Offset.Black);
/**
 * Original Bright Red color instance
 *
 * @category Original instances
 */
export const BrightRed: Type = makeBright(Offset.Red);
/**
 * Original Bright Green color instance
 *
 * @category Original instances
 */
export const BrightGreen: Type = makeBright(Offset.Green);
/**
 * Original Bright Yellow color instance
 *
 * @category Original instances
 */
export const BrightYellow: Type = makeBright(Offset.Yellow);
/**
 * Original Bright Blue color instance
 *
 * @category Original instances
 */
export const BrightBlue: Type = makeBright(Offset.Blue);
/**
 * Original Bright Magenta color instance
 *
 * @category Original instances
 */
export const BrightMagenta: Type = makeBright(Offset.Magenta);
/**
 * Original Bright Cyan color instance
 *
 * @category Original instances
 */
export const BrightCyan: Type = makeBright(Offset.Cyan);
/**
 * Original Bright White color instance
 *
 * @category Original instances
 */
export const BrightWhite: Type = makeBright(Offset.White);
