import * as TestUtils from '@parischap/configs/TestUtils';
import { MData } from '@parischap/effect-lib';
import { Equal, Option } from 'effect';
import { describe, it } from 'vitest';

describe('MData', () => {
  const FooUniqueSymbol: unique symbol = Symbol.for(`Foo`) as FooUniqueSymbol;
  type FooUniqueSymbol = typeof FooUniqueSymbol;

  class Foo extends MData.Class {
    readonly a: number;
    readonly b: boolean;
    constructor({ a, b }: { a: number; b: boolean }) {
      super();
      this.a = a;
      this.b = b;
    }

    /** Returns the `id` of `this` */
    [MData.idSymbol](): string | (() => string) {
      return 'Foo';
    }

    /** Returns the TypeMarker of the class */
    protected get [FooUniqueSymbol](): FooUniqueSymbol {
      return FooUniqueSymbol;
    }
  }

  const BarUniqueSymbol: unique symbol = Symbol.for(`Bar`) as BarUniqueSymbol;
  type BarUniqueSymbol = typeof BarUniqueSymbol;

  class Bar extends MData.Class {
    readonly a: number;
    readonly b: boolean;
    constructor({ a, b }: { a: number; b: boolean }) {
      super();
      this.a = a;
      this.b = b;
    }

    /** Returns the `id` of `this` */
    [MData.idSymbol](): string | (() => string) {
      return () => 'Bar';
    }

    /** Returns the TypeMarker of the class */
    protected get [BarUniqueSymbol](): BarUniqueSymbol {
      return BarUniqueSymbol;
    }
  }

  const foo = { a: 5, b: true };
  const foo1 = new Foo(foo);
  const foo2 = new Foo(foo);
  const bar = new Bar(foo);

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(MData.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('toJSON() and toString()', () => {
    TestUtils.assertEquals(foo1.toJSON(), {
      _id: 'Foo',
      a: 5,
      b: true,
    });

    TestUtils.assertEquals(bar.toString(), 'Bar');
  });

  it('pipe()', () => {
    TestUtils.assertFalse(foo1.pipe(Equal.equals(foo2)));
  });

  describe('Equal.equals', () => {
    it('Matching', () => {
      TestUtils.assertEquals(foo1, foo1);
    });

    it('Not matching', () => {
      TestUtils.assertNotEquals(foo1, foo);
      TestUtils.assertNotEquals(foo1, foo2);
      TestUtils.assertNotEquals(foo1, bar);
    });
  });
});
