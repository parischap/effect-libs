import * as TestUtils from '@parischap/configs/TestUtils';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';

import * as Hash from 'effect/Hash';
import * as Predicate from 'effect/Predicate';
import { describe, it } from 'vitest';

describe('MEquivalenceBasedEqualityData', () => {
  const FooUniqueSymbol: unique symbol = Symbol.for(`Foo`) as FooUniqueSymbol;
  type FooUniqueSymbol = typeof FooUniqueSymbol;

  class Foo extends MEquivalenceBasedEqualityData.Class {
    readonly a: number;
    readonly b: boolean;
    constructor({ a, b }: { a: number; b: boolean }) {
      super();
      this.a = a;
      this.b = b;
    }

    /** Returns the `id` of `this` */
    _id(this: this): string | (() => string) {
      return 'Foo';
    }

    /** Calculates the hash value of `this` */
    [Hash.symbol](): number {
      return 0;
    }

    /** Function that implements the equivalence of `this` and `that` */
    [MEquivalenceBasedEqualityData.isEquivalentToSymbol](this: this, that: this): boolean {
      return this.a === that.a && this.b === that.b;
    }

    /**
     * Predicate that returns true if `that` has the same type marker as `this`. It would be
     * tempting to make it a type guard. But two instances of the same generic class that have the
     * same type marker do not necessaraly have the same type
     */
    [MEquivalenceBasedEqualityData.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
      return Predicate.hasProperty(that, FooUniqueSymbol);
    }

    /** Returns the TypeMarker of the class */
    protected get _FooUnique(): FooUniqueSymbol {
      return FooUniqueSymbol;
    }
  }

  const BarUniqueSymbol: unique symbol = Symbol.for(`Bar`) as BarUniqueSymbol;
  type BarUniqueSymbol = typeof BarUniqueSymbol;

  class Bar extends MEquivalenceBasedEqualityData.Class {
    readonly a: number;
    readonly b: boolean;
    constructor({ a, b }: { a: number; b: boolean }) {
      super();
      this.a = a;
      this.b = b;
    }

    /** Returns the `id` of `this` */
    _id(this: this): string | (() => string) {
      return 'Bar';
    }

    /** Calculates the hash value of `this` */
    [Hash.symbol](): number {
      return 0;
    }

    /** Function that implements the equivalence of `this` and `that` */
    [MEquivalenceBasedEqualityData.isEquivalentToSymbol](this: this, that: this): boolean {
      return this.a === that.a && this.b === that.b;
    }

    /** Predicate that returns true if `that` has the same type marker as `this` */
    [MEquivalenceBasedEqualityData.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
      return Predicate.hasProperty(that, BarUniqueSymbol);
    }

    /** Returns the TypeMarker of the class */
    protected get _BarUnique(): BarUniqueSymbol {
      return BarUniqueSymbol;
    }
  }

  const foo = { a: 5, b: true };
  const foo1 = new Foo(foo);
  const foo2 = new Foo(foo);
  const bar = new Bar(foo);

  describe('Equal.equals', () => {
    it('Matching', () => {
      TestUtils.assertEquals(foo1, foo1);
      TestUtils.assertEquals(foo1, foo2);
    });

    it('Not matching', () => {
      TestUtils.assertNotEquals(foo1, foo);
      TestUtils.assertNotEquals(foo1, bar);
    });
  });
});
