/**
 * This module implements a type that takes care of filtering properties when printing non-primitive
 * values.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import * as Array from 'effect/Array';
import * as Boolean from 'effect/Boolean';
import type * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Predicate from 'effect/Predicate';
import * as Struct from 'effect/Struct';

import * as MData from '@parischap/effect-lib/MData';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MPredicate from '@parischap/effect-lib/MPredicate';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import type * as PPValues from '../internal/stringification/Values.js';

import * as PPValue from '../internal/stringification/Value.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/Parameters/PropertyFilter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a PPPropertyFilter
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** Id of this PropertyFilter instance. Useful for equality and debugging */
  readonly id: string;
  /** Action of this PropertyFilter instance */
  readonly action: MTypes.OneArgFunction<PPValues.Type>;

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
 * Constructor of a PPPropertyFilter
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type => new Type(params);

/**
 * Equivalence of PPPropertyFilter's
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
 * Creates a new `PPPropertyFilter` by composing several existing `PPPropertyFilter`'s in sequence.
 * The resulting `PPPropertyFilter` removes any value that is removed by at least one of the
 * composed `PPPropertyFilter`'s.
 *
 * @category Constructors
 */
export const merge = ({
  id,
  filters,
}: {
  readonly id: string;
  readonly filters: ReadonlyArray<Type>;
}): Type =>
  new Type({
    id,
    action: (properties) =>
      Array.reduce(filters, properties, (remainingProperties, propertyFilter) =>
        propertyFilter.action(remainingProperties),
      ),
  });

/**
 * PPPropertyFilter instance that removes no properties
 *
 * @category Instances
 */
export const none: Type = make({
  id: 'None',
  action: Function.identity,
});

/**
 * PPPropertyFilter instance that removes properties of non-primitive values whose value is not a
 * function
 *
 * @category Instances
 */
export const removeNonFunctions: Type = make({
  id: 'RemoveNonFunctions',
  action: Array.filter(PPValue.isAnyFunction),
});

/**
 * PPPropertyFilter instance that removes properties of non-primitive values whose value is a
 * function
 *
 * @category Instances
 */
export const removeFunctions: Type = make({
  id: 'RemoveFunctions',
  action: Array.filter(Predicate.not(PPValue.isAnyFunction)),
});

/**
 * PPPropertyFilter instance that removes non-enumerable properties of non-primitive values
 *
 * @category Instances
 */
export const removeNonEnumerables: Type = make({
  id: 'RemoveNonEnumerables',
  action: Array.filter(PPValue.isEnumerable),
});

/**
 * PPPropertyFilter instance that removes enumerable properties of non-primitive values
 *
 * @category Instances
 */
export const removeEnumerables: Type = make({
  id: 'RemoveEnumerables',
  action: Array.filter(Predicate.not(PPValue.isEnumerable)),
});

/**
 * PPPropertyFilter instance that removes properties of non-primitive values with a string key
 *
 * @category Instances
 */
export const removeStringKeys: Type = make({
  id: 'RemoveStringKeys',
  action: Array.filter(PPValue.hasSymbolicKey),
});

/**
 * PPPropertyFilter instance that removes properties of non-primitive values with a symbolic key
 *
 * @category Instances
 */
export const removeSymbolicKeys: Type = make({
  id: 'RemoveSymbolicKeys',
  action: Array.filter(Predicate.not(PPValue.hasSymbolicKey)),
});

/**
 * Constructor of a PPPropertyFilter instance that removes properties of non-primitive values whose
 * key is:
 *
 * - A string that does not fulfill `predicate`
 * - A symbol
 *
 * @category Constructors
 */
export const removeNotFulfillingKeyPredicateMaker = ({
  id,
  predicate,
}: {
  readonly id: string;
  readonly predicate: Predicate.Predicate<string>;
}): Type =>
  make({
    id,
    action: Array.filter(
      MPredicate.struct({ oneLineStringKey: predicate, hasSymbolicKey: Boolean.not }),
    ),
  });
