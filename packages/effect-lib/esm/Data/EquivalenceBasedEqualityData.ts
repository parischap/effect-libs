/**
 * Base class for value objects that derive `Equal.Equal` from a user-defined equivalence.
 *
 * ## Mental model
 *
 * - **`Class`** extends {@link "./Data.js" | `MData.Class`} and implements `Equal.Equal`.
 * - Subclasses provide three pieces of behavior:
 *   - `[isEquivalentToSymbol]` — the semantic equivalence between two same-type instances.
 *   - `[hasSameTypeMarkerAsSymbol]` — a runtime check that two values share the same type marker.
 *     Used as a guard before calling `[isEquivalentToSymbol]`. It is intentionally not declared
 *     as a TypeScript type guard because two instances of the same generic class may share a
 *     marker yet have different type parameters.
 *   - `[Hash.symbol]` — a hash consistent with the equivalence; return `0` to disable hashing
 *     when the equivalence is cheaper than computing a hash.
 *
 * ## Quickstart
 *
 * **Example** (Equality by a single field)
 *
 * ```ts
 * import { Equal, Hash } from 'effect';
 * import * as MData from '@parischap/effect-lib/MData';
 * import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/Data/EquivalenceBasedEqualityData';
 *
 * class UserId extends MEquivalenceBasedEqualityData.Class {
 *   constructor(readonly value: number) { super(); }
 *   [MData.idSymbol]() { return '@example/UserId/'; }
 *   [MEquivalenceBasedEqualityData.hasSameTypeMarkerAsSymbol](that: unknown) {
 *     return that instanceof UserId;
 *   }
 *   [MEquivalenceBasedEqualityData.isEquivalentToSymbol](that: this) {
 *     return this.value === that.value;
 *   }
 *   [Hash.symbol]() { return Hash.number(this.value); }
 * }
 *
 * console.log(Equal.equals(new UserId(1), new UserId(1))); // true
 * console.log(Equal.equals(new UserId(1), new UserId(2))); // false
 * ```
 */

import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';

import * as MData from './Data.js';

/**
 * Module tag.
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Data/EquivalenceBasedEqualityData/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Symbol naming the runtime same-type-marker predicate. Subclasses implement it to gate the
 * equivalence check and to keep generic instances from comparing equal across distinct type
 * parameters.
 *
 * @category Model symbols
 */
export const hasSameTypeMarkerAsSymbol: unique symbol = Symbol.for(
  `${moduleTag}hasSameTypeMarkerAs/`,
) as hasSameTypeMarkerAsSymbol;
type hasSameTypeMarkerAsSymbol = typeof hasSameTypeMarkerAsSymbol;

/**
 * Symbol naming the user-defined equivalence between two same-type-marker instances.
 *
 * @category Model symbols
 */
export const isEquivalentToSymbol: unique symbol = Symbol.for(
  `${moduleTag}isEquivalentTo/`,
) as isEquivalentToSymbol;
type isEquivalentToSymbol = typeof isEquivalentToSymbol;

/**
 * Type of objects produced by this module.
 *
 * @category Models
 */
export type Type = MData.Type &
  Equal.Equal & {
    [isEquivalentToSymbol](this: Type, that: Type): boolean;
    [hasSameTypeMarkerAsSymbol](that: unknown): boolean;
  };

/**
 * Abstract base class adding `Equal.Equal` to {@link "./Data.js" | `MData.Class`}.
 *
 * @category Models
 */
export abstract class Class extends MData.Class implements Type {
  /**
   * Implements the equivalence between `this` and `that`. Called only after
   * `[hasSameTypeMarkerAsSymbol]` confirmed that both share the same type marker.
   */
  abstract [isEquivalentToSymbol](this: this, that: this): boolean;

  /**
   * Returns `true` when `that` has the same type marker as `this`. Not declared as a TypeScript
   * type guard because two instances of the same generic class may share a marker yet differ in
   * their type parameters.
   */
  abstract [hasSameTypeMarkerAsSymbol](that: unknown): boolean;

  /**
   * Returns the hash of `this`. Return `0` to disable hashing when computing a real hash would be
   * more expensive than evaluating the equivalence directly.
   */
  abstract [Hash.symbol](): number;

  /** Implements `Equal.Equal` by combining the same-type-marker guard and the equivalence. */
  [Equal.symbol](this: this, that: Equal.Equal): boolean {
    return this[hasSameTypeMarkerAsSymbol](that) && this[isEquivalentToSymbol](that as this);
  }
}
