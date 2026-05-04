/**
 * Base class for inspectable, pipeable data objects.
 *
 * ## Mental model
 *
 * - **`Class`** extends `Pipeable.Class` and implements `Inspectable.Inspectable`. It is the
 *   recommended root class for value objects in Effect-based packages.
 * - Subclasses must implement `[idSymbol]`, returning either a string identifier (used as `_id` in
 *   the JSON view) or a function producing a fully custom string representation.
 * - `Class` does **not** implement `Equal.Equal`; for value-based equality, extend
 *   {@link "./EquivalenceBasedEqualityData.js" | `MEquivalenceBasedEqualityData.Class`} instead.
 *
 * ## Common tasks
 *
 * - **Define a value object**: extend {@link Class} and implement {@link idSymbol}
 * - **Customize printing**: return a function from `[idSymbol]`
 *
 * ## Quickstart
 *
 * **Example** (Defining a value object)
 *
 * ```ts
 * import * as MData from '@parischap/effect-lib/MData';
 *
 * class Point extends MData.Class {
 *   constructor(readonly x: number, readonly y: number) {
 *     super();
 *   }
 *   [MData.idSymbol]() {
 *     return '@example/Point/';
 *   }
 * }
 *
 * console.log(new Point(1, 2).toJSON());
 * // { _id: '@example/Point/', x: 1, y: 2 }
 * ```
 */

import * as Formatter from 'effect/Formatter';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

/**
 * Module tag.
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Data/';

/**
 * Symbol naming the `id` method that subclasses implement.
 *
 * - When the method returns a string, `toString` and `toJSON` use it as the `_id` key alongside
 *   the own enumerable properties of the instance.
 * - When the method returns a function, `toString` and `toJSON` return whatever that function
 *   produces, bound to `this`.
 *
 * @category Model symbols
 */
export const idSymbol: unique symbol = Symbol.for(`${moduleTag}id/`) as idSymbol;
type idSymbol = typeof idSymbol;

/**
 * Type of objects produced by this module.
 *
 * @category Models
 */
export type Type = Pipeable.Pipeable &
  Inspectable.Inspectable & { [idSymbol](): string | (() => string) };

/**
 * Abstract base class providing `Pipeable` and `Inspectable` for value objects.
 *
 * @category Models
 */
export abstract class Class extends Pipeable.Class implements Type {
  /**
   * Returns the `id` of `this`. A string identifier is used as the `_id` field of the JSON view;
   * a function produces a fully custom representation when invoked with `this` bound.
   */
  abstract [idSymbol](): string | (() => string);

  /** Returns the JSON view of `this`. */
  toJSON(): unknown {
    const id = this[idSymbol]();
    return typeof id === 'string' ? Object.assign({ _id: id }, this) : id.call(this);
  }

  /** Hooks into Node.js `util.inspect`. */
  [Inspectable.NodeInspectSymbol](): unknown {
    return this.toJSON();
  }

  /** Returns the printable representation of `this`. */
  override toString(): string {
    const id = this[idSymbol]();
    return typeof id === 'string'
      ? Formatter.format(Object.assign({ _id: id }, this))
      : id.call(this);
  }
}
