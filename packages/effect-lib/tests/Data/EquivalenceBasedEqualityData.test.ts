import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MData from '@parischap/effect-lib/MData';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';

import { describe, it } from 'vitest';

describe('MEquivalenceBasedEqualityData', () => {
  const _FooUniqueSymbol: unique symbol = Symbol.for(`Foo`) as _FooUniqueSymbol;
  type _FooUniqueSymbol = typeof _FooUniqueSymbol;

  class Foo extends MEquivalenceBasedEqualityData.Class {
    readonly a: number;
    readonly b: boolean;
    constructor({ a, b }: { a: number; b: boolean }) {
      super();
      this.a = a;
      this.b = b;
    }

    /** Returns the `id` of `this` */
    [MData.idSymbol](this: this): string | (() => string) {
      return 'Foo';
    }

    /** Calculates the hash value of `this` */
    [Hash.symbol](): number {
      return 0;
    }

    /** Function that implements the equivalence of `this` and `that` */
    [MEquivalenceBasedEqualityData.isEquivalentToSymbol](this: this, that: this): boolean {
      return this.a === that.a;
    }

    /**
     * Predicate that returns true if `that` has the same type marker as `this`. It would be
     * tempting to make it a type guard. But two instances of the same generic class that have the
     * same type marker do not necessaraly have the same type
     */
    [MEquivalenceBasedEqualityData.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
      return Predicate.hasProperty(that, _FooUniqueSymbol);
    }

    /** Returns the TypeMarker of the class */
    protected get [_FooUniqueSymbol](): _FooUniqueSymbol {
      return _FooUniqueSymbol;
    }
  }

  const foo1 = new Foo({ a: 5, b: true });
  const foo2 = new Foo({ a: 5, b: false });
  const foo3 = { a: 5, b: true };

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(MEquivalenceBasedEqualityData.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Equal.equals', () => {
    it('Matching', () => {
      //TestUtils.assertEquals(foo1, foo1);
      TestUtils.assertEquals(foo1, foo2);
    });

    it('Not matching', () => {
      TestUtils.assertNotEquals(foo1, foo3);
    });
  });
});
