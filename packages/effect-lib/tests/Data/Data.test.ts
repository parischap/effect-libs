import * as Equal from 'effect/Equal';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MData from '@parischap/effect-lib/MData';

import { describe, it } from 'vitest';

describe('MData', () => {
  const _FooUniqueSymbol: unique symbol = Symbol.for(`Foo`) as _FooUniqueSymbol;
  type _FooUniqueSymbol = typeof _FooUniqueSymbol;

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
    protected get _FooUnique(): _FooUniqueSymbol {
      return _FooUniqueSymbol;
    }
  }

  const foo1 = new Foo({ a: 5, b: true });
  const foo2 = new Foo({ a: 5, b: false });
  const foo3 = { a: 5, b: true };

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
  });

  it('pipe()', () => {
    TestUtils.assertFalse(foo1.pipe(Equal.equals(foo2)));
  });

  describe('Equal.equals', () => {
    it('Matching', () => {
      TestUtils.assertEquals(foo1, foo1);
    });

    it('Not matching', () => {
      TestUtils.assertNotEquals(foo1, foo2);
      TestUtils.assertNotEquals(foo1, foo3);
    });
  });
});
