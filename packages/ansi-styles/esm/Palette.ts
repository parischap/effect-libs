/**
 * A Palette is a type that groups several styles under an id. It is mainly used to build
 * ContextStylers (see ContextStyler.ts).
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { MData, MString, MTypes } from '@parischap/effect-lib';
import {
  Array,
  Equal,
  Equivalence,
  Function,
  Hash,
  Inspectable,
  pipe,
  Pipeable,
  Struct,
} from 'effect';
import * as ASStyle from './Style.js';
import * as ASStyles from './Styles.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/Palette/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a Palette.
 *
 * @category Models
 */
export class Type
  extends MData.Class({ id: moduleTag, uniqueSymbol: _TypeId })
  implements Pipeable.Pipeable, Inspectable.Inspectable, Equal.Equal, Hash.Hash
{
  /** Array of styles contained by this Palette */
  readonly styles: ASStyles.Type;

  /** Equivalence - Override default equivalence as this class contains objects */
  override isEquivalentTo(this: this, that: this): boolean {
    return Array.getEquivalence(ASStyle.equivalence)(this.styles, that.styles);
  }

  /** Returns a printable version of this */
  override toString(this: this): string {
    return pipe(this.styles, ASStyles.toString, MString.append('Palette'));
  }

  /** Class constructor */
  private constructor({ styles }: MTypes.Data<Type>) {
    super();
    this.styles = styles;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }
}

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => self.isEquivalentTo(that);

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (...styles: ASStyles.Type): Type => Type.make({ styles });
const _tupledMake = Function.tupled<ASStyles.Type, Type>(make);

/**
 * Gets the id of `self`
 *
 * @category Destructors
 */
export const toString = (self: Type): string => self.toString();

/**
 * Gets the underlying styles of `self`
 *
 * @category Destructors
 */
export const styles: MTypes.OneArgFunction<Type, ASStyles.Type> = Struct.get('styles');

/**
 * Appends `that` to `self`
 *
 * @category Utils
 */
export const append =
  (that: Type) =>
  (self: Type): Type =>
    pipe(self.styles, ASStyles.append(that.styles), _tupledMake);

/**
 * Palette instance which contains all standard original colors
 *
 * @category Instances
 */

export const allStandardOriginalColors: Type = make(
  ASStyle.black,
  ASStyle.red,
  ASStyle.green,
  ASStyle.yellow,
  ASStyle.blue,
  ASStyle.magenta,
  ASStyle.cyan,
  ASStyle.white,
);

/**
 * Palette instance which contains all bright original colors
 *
 * @category Instances
 */

export const allBrightOriginalColors: Type = make(
  ASStyle.Bright.black,
  ASStyle.Bright.red,
  ASStyle.Bright.green,
  ASStyle.Bright.yellow,
  ASStyle.Bright.blue,
  ASStyle.Bright.magenta,
  ASStyle.Bright.cyan,
  ASStyle.Bright.white,
);

/**
 * Palette instance which contains all original colors
 *
 * @category Instances
 */

export const allOriginalColors: Type = pipe(
  allStandardOriginalColors,
  append(allBrightOriginalColors),
);
