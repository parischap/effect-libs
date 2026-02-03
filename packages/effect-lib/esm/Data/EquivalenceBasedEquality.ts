/**
 * Module that implements a class that derives from Data.Reference equality and implements the
 * Effect Equal.Equal interface. The class defines an abstract isEquivalentTo function that must
 * implement the the equivalence of two instances. This kind of equality can only be used in three
 * cases:
 *
 * - for non generic classes
 * - for generic classes where the Equal.equals operator is uses es equivalence
 * - for generic classes where the equivalence bears on fields not dependant on the generic type
 */

import { Equal, Hash } from 'effect';
import * as MDataBase from './Base.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Data/EquivalenceBasedEquality/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Symbol used to name the hasSameTypeMarkerAs function
 *
 * @category Model symbols
 */
export const hasSameTypeMarkerAsSymbol: unique symbol = Symbol.for(
  `${moduleTag}hasSameTypeMarkerAs/`,
) as hasSameTypeMarkerAsSymbol;
type hasSameTypeMarkerAsSymbol = typeof hasSameTypeMarkerAsSymbol;

/**
 * Symbol used to name the isEquivalentTo function
 *
 * @category Model symbols
 */
export const isEquivalentToSymbol: unique symbol = Symbol.for(
  `${moduleTag}isEquivalentTo/`,
) as isEquivalentToSymbol;
type isEquivalentToSymbol = typeof isEquivalentToSymbol;

/**
 * Type of an MDataEquivalenceBasedEquality
 *
 * @category Models
 */
export type Type = MDataBase.Type
  & Equal.Equal & {
    [isEquivalentToSymbol](this: Type, that: Type): boolean;
    [hasSameTypeMarkerAsSymbol](that: unknown): boolean;
  };

/**
 * Type of a DataEquivalenceBasedEquality
 *
 * @category Models
 */
export abstract class Class extends MDataBase.Class implements Type {
  /**
   * Function that implements the equivalence of `this` and `that`. Must be defined at the same
   * level as [hasSameTypeMarkerAsSymbol]()
   */
  abstract [isEquivalentToSymbol](this: this, that: this): boolean;

  /**
   * Predicate that returns true if `that` has the same type marker as `this`. It would be tempting
   * to make it a type guard. But two instances of the same generic class that have the same type
   * marker do not necessaraly have the same type
   */
  abstract [hasSameTypeMarkerAsSymbol](that: unknown): boolean;

  /**
   * Calculates the hash value of `this`. For classes with few fields, calculating a hash will be
   * more costly than carring out an equivalence. In that case, deactivate hashing by simply
   * returning 0
   */
  abstract [Hash.symbol](): number;

  /** Implements the Effect Equal.Equal interface */
  [Equal.symbol](this: this, that: Equal.Equal): boolean {
    return this[hasSameTypeMarkerAsSymbol](that) && this[isEquivalentToSymbol](that as this);
  }
}
