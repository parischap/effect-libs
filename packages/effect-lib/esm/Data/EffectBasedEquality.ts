/**
 * Module that implements a class that derives from Data.Reference equality and implements the
 * Effect Equal.Equal interface. Two instances are equal when each of their own enumerable string
 * properties are equal using the Effect `Equal.equals` operator.
 */

import { Equal, Hash } from 'effect';
import * as MDataReferenceEquality from './ReferenceEquality.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Data/EffectBasedEquality/';

export abstract class Type<S extends symbol>
  extends MDataReferenceEquality.Type<S>
  implements Equal.Equal
{
  /** Calculates the hash value of `this` */
  [Hash.symbol](this: Hash.Hash) {
    return Hash.cached(this, Hash.structure(this));
  }

  /** Implements the Effect Equal.Equal interface */
  [Equal.symbol](this: this, that: Equal.Equal): boolean {
    if (!this[MDataReferenceEquality.hasSameTypeMarkerAsSymbol](that)) return false;

    const selfEntries = Object.entries(this);
    if (selfEntries.length !== Object.keys(that).length) {
      return false;
    }
    for (const [key, value] of selfEntries) {
      if (!(key in that && Equal.equals((this as any)[key], (that as any)[key]))) {
        return false;
      }
    }
    return true;
  }
}
