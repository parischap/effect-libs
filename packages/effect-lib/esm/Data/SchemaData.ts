/**
 * Base class for value objects that combine `Schema.Class` with a user-defined equivalence.
 *
 * ## Mental model
 *
 * - **`Class`** is {@link "./EquivalenceBasedEqualityData.js" | `MEqData.Class`} built on
 *   `Schema.Class` instead of {@link "./Data.js" | `MData.Class`}. Like it, it implements
 *   `Inspectable.Inspectable`, `Pipeable.Pipeable` and `Equal.Equal`, and its subclasses provide
 *   `[MData.idSymbol]`, `[isEquivalentToSymbol]`, `[hasSameTypeMarkerAsSymbol]` and
 *   `[Hash.symbol]`.
 * - A subclass is defined with `Class.extend<Self>(identifier)(fields)`. `fields` are `Schema`'s, so
 *   the class is itself a `Schema` that can be decoded, encoded and fed to `Arbitrary.schema`
 *   (property-based testing). No need to write a constructor: it takes the fields as an object.
 *
 * ## Common tasks
 *
 * - **Define a value object**: extend `Class.extend<Self>(identifier)(fields)` and implement the four
 *   methods above. Identify the type with a `TypeId` symbol checked by `Predicate.hasProperty` in
 *   `[hasSameTypeMarkerAsSymbol]`
 * - **Decode/encode**: `Schema.decodeUnknownSync(Point)`, `Schema.encodeSync(Point)`
 * - **Generate instances for property-based testing**: `Arbitrary.schema(Point)`
 *
 * ## Gotchas
 *
 * - The identifier passed to `extend` must be unique in the program (it identifies the class in
 *   `Schema` representations).
 * - `[isEquivalentToSymbol]` and `[Hash.symbol]` must be consistent with each other: instances that
 *   are equivalent must have the same hash. Return `0` as hash to disable hashing when the
 *   equivalence is cheaper than computing a hash.
 *
 * ## Quickstart
 *
 * **Example** (Defining, decoding and testing a value object)
 *
 * ```ts
 * import type { Equivalence } from 'effect';
 * import { Arbitrary, Effect, Equal, Hash, Predicate, Schema } from 'effect';
 * import { MData, MEqData, MSchemaData } from '@parischap/effect-lib';
 *
 * const moduleTag = '@parischap/my-app/Person/';
 * const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
 * type TypeId = typeof TypeId;
 *
 * class Type extends MSchemaData.Class.extend<Type>(moduleTag)({
 *   id: Schema.Finite,
 *   name: Schema.String,
 * }) {
 *   [MData.idSymbol](): MData.idSymbolResult {
 *     return moduleTag;
 *   }
 *
 *   [Hash.symbol](): number {
 *     return 0;
 *   }
 *
 *   [MEqData.isEquivalentToSymbol](this: this, that: this): boolean {
 *     return equivalence(this, that);
 *   }
 *
 *   [MEqData.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
 *     return Predicate.hasProperty(that, TypeId);
 *   }
 *
 *   protected get [TypeId](): TypeId {
 *     return TypeId;
 *   }
 * }
 *
 * // Two persons are equivalent if they have the same id
 * const equivalence: Equivalence.Equivalence<Type> = (self, that) => self.id === that.id;
 *
 * const person = Schema.decodeUnknownSync(Type)({ id: 1, name: 'Alice' });
 * console.log(person.toJSON()); // { _id: '@example/Person/', id: 1, name: 'Alice' }
 * console.log(Equal.equals(person, new Type({ id: 1, name: 'Bob' }))); // true
 * console.log(Schema.encodeSync(Type)(person)); // { id: 1, name: 'Alice' }
 *
 * // Property-based test: a person is equal to any person with the same id
 * const result = await Effect.runPromise(
 *   Arbitrary.checkEffect(Arbitrary.schema(Type), (p) =>
 *     Equal.equals(p, new Type({ id: p.id, name: 'other' })),
 *   ),
 * );
 * console.log(result._tag); // 'Passed'
 * ```
 *
 * @see {@link "./EquivalenceBasedEqualityData.js" | `MEqData`} — same without `Schema`
 * @see {@link "./Data.js" | `MData`} — base class without equality
 */

import * as Equal from 'effect/Equal';
import type * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import * as Schema from 'effect/Schema';

import * as MData from './Data.js';
import * as MEqData from './EqData.js';

/**
 * Module tag.
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Data/SchemaData/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Abstract base class adding `Equal.Equal` to `Schema.Class`. Extend it with `Class.extend`.
 *
 * @category Models
 */
export abstract class Class extends Schema.Class<Class>(moduleTag)({}) {
  /**
   * Returns the `id` of `this`. A string identifier is used as the `_id` field of the JSON view; a
   * function produces a fully custom representation when invoked with `this` bound.
   */
  abstract [MData.idSymbol](): MData.idSymbolResult;

  /**
   * Returns the JSON view of `this`, or its redacted representation if `this` implements
   * `Redactable`
   */
  toJSON(): unknown {
    return MData.toJSON(this);
  }

  /** Hooks into Node.js `util.inspect`. */
  [Inspectable.NodeInspectSymbol](): unknown {
    return MData.toJSON(this);
  }

  /**
   * Returns the printable representation of `this`, or its redacted representation if `this`
   * implements `Redactable`
   */
  override toString(): string {
    return MData.toString(this);
  }

  /**
   * Implements the equivalence between `this` and `that`. Called only after
   * `[hasSameTypeMarkerAsSymbol]` confirmed that both share the same type marker.
   */
  abstract [MEqData.isEquivalentToSymbol](this: this, that: this): boolean;

  /**
   * Returns `true` when `that` has the same type marker as `this`. Not declared as a TypeScript
   * type guard because two instances of the same generic class may share a marker yet differ in
   * their type parameters.
   */
  abstract [MEqData.hasSameTypeMarkerAsSymbol](that: unknown): boolean;

  /**
   * Returns the hash of `this`. Return `0` to disable hashing when computing a real hash would be
   * more expensive than evaluating the equivalence directly.
   */
  abstract [Hash.symbol](): number;

  /** Implements `Equal.Equal` by combining the same-type-marker guard and the equivalence. */
  [Equal.symbol](this: this, that: Equal.Equal): boolean {
    return (
      this[MEqData.hasSameTypeMarkerAsSymbol](that) &&
      this[MEqData.isEquivalentToSymbol](that as this)
    );
  }
}
