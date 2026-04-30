/**
 * This module implements a type that can optionally short-circuit the normal stringification
 * pipeline for a given non-primitive value. When a `PPByPasser` decides to handle a value it
 * returns a `some` of the resulting string, bypassing the usual property-extraction and formatting
 * steps. When it does not apply, it returns a `none` and the normal pipeline takes over.
 *
 * A typical use case is printing a `Date` as a human-readable string rather than as an object with
 * all its internal properties.
 *
 * Use the `make` function to define custom instances if the pre-built ones do not suit your needs.
 */

import { flow } from 'effect';
import * as Array from 'effect/Array';
import type * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as Struct from 'effect/Struct';

import * as MData from '@parischap/effect-lib/MData';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MRecord from '@parischap/effect-lib/MRecord';
import * as MTypes from '@parischap/effect-lib/MTypes';

import type * as PPResolvedNonPrimitiveParameters from '../internal/Parameters/ResolvedNonPrimitiveParameters.js';
import type * as PPParameters from './Parameters.js';

import * as PPValue from '../internal/stringification/Value.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/Parameters/ByPasser/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a `PPByPasser`
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** Id of this PPByPasser instance. Useful for equality and debugging */
  readonly id: string;

  /**
   * Action of this `PPByPasser`. Takes as input:
   *
   * - `nonPrimitive`: the non-primitive value being stringified (used as context for styling),
   * - `parameters`: the `PPParameters` instance passed to the `PPStringifier`,
   * - `applicableNonPrimitiveParameters`: the merged, fully-resolved `PPNonPrimitiveParameters`
   *   fields applicable to `nonPrimitive` (see
   *   `PPResolvedNonPrimitiveParameters.fromApplicableNonPrimitiveParameters`).
   *
   * Returns `Option.some(s)` where `s` is the bypass string when this bypasser handles the value.
   */

  readonly action: MTypes.OneArgFunction<
    {
      readonly nonPrimitive: PPValue.NonPrimitive;
      readonly parameters: PPParameters.Type;
      readonly applicableNonPrimitiveParameters: PPResolvedNonPrimitiveParameters.Type;
    },
    Option.Option<string>
  >;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.id;
    };
  }

  /** Class constructor */
  constructor({ id, action }: MTypes.Data<Type>) {
    super();
    this.id = id;
    this.action = action;
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
  }

  /** Function that implements the equivalence of `this` and `that` */
  [MEquivalenceBasedEqualityData.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  [MEquivalenceBasedEqualityData.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
    return Predicate.hasProperty(that, TypeId);
  }
  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Constructor of a PPByPasser
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type => new Type(params);

/**
 * Creates a new `PPByPasser` by composing several existing `PPByPasser`'s. The resulting
 * `PPByPasser` returns the `some` of the first `PPByPasser` in `byPassers` that returns a `some`
 * for the given value. Returns `none` if no `PPByPasser` matches.
 *
 * @category Constructors
 */
export const merge = ({
  id,
  byPassers,
}: {
  readonly id: string;
  readonly byPassers: ReadonlyArray<Type>;
}): Type =>
  new Type({
    id,
    action: (value) => Array.findFirst(byPassers, flow(action, Function.apply(value))),
  });

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/**
 * Returns the `id` property of `self`
 *
 * @category Getters
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * Returns the `action` property of `self`
 *
 * @category Getters
 */
export const action: MTypes.OneArgFunction<Type, Type['action']> = Struct.get('action');

/**
 * `PPByPasser` instance that never bypasses any value (always returns `none`)
 *
 * @category Instances
 */
export const empty: Type = make({
  id: 'Empty',
  action: Function.constant(Option.none()),
});

/**
 * `PPByPasser` instance that calls the `.toString()` method of the non-primitive value, but only
 * when that method is not `Object.prototype.toString` (i.e. the value has a custom or overridden
 * implementation). Returns a `some` of the result on success, `none` otherwise.
 *
 * Practical examples where this returns a `some`: `Date`, any class that overrides `toString`. Note
 * that calling `.toString()` on a function will return its source code, which is usually not the
 * desired output.
 *
 * @category Instances
 */
export const toStringable: Type = make({
  id: 'ToStringable',
  action: flow(
    Struct.get('nonPrimitive'),
    PPValue.content,
    MRecord.tryZeroParamStringFunction({
      functionName: 'toString',
      /* oxlint-disable-next-line typescript/unbound-method */
      exception: Object.prototype.toString,
    }),
  ),
});

/**
 * `PPByPasser` instance that displays the non-primitive value as its name surrounded by the
 * `openingTagMark` and `closingTagMark` (e.g. `[Function: foo]`). Always returns a `some`. Can be
 * used to display functions.
 *
 * @category Instances
 */
export const allWithName: Type = make({
  id: 'AllWithName',
  action: ({ nonPrimitive, parameters }) =>
    Option.some(
      `${parameters.openingTagMark}${parameters.name(nonPrimitive.content)}${parameters.closingTagMark}`,
    ),
});

/**
 * `PPByPasser` instance that:
 *
 * - Returns a `some` of the result of calling `.toISOString()` on a `Date` non-primitive value
 * - Returns a `some` of the result of calling `.toString()` on a `RegExp` non-primitive value
 * - Returns a `none` for all other non-primitive values
 *
 * This is the default `byPasser` baked into the merge defaults, so dates and regular expressions
 * are pretty-printed as `2026-04-29T00:00:00.000Z` and `/foo/g` even when no
 * `PPNonPrimitiveParameters` explicitly sets a `byPasser`.
 *
 * @category Instances
 */
export const dateAndRegExp: Type = make({
  id: 'DateAndRegExp',
  action: flow(
    Struct.get('nonPrimitive'),
    PPValue.content,
    MMatch.make,
    MMatch.when(MTypes.isDate, (d) => Option.some(d.toISOString())),
    MMatch.when(
      (u): u is RegExp => u instanceof RegExp,
      (r) => Option.some(r.toString()),
    ),
    MMatch.orElse(() => Option.none<string>()),
  ),
});
