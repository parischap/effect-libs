import { assert, describe, it } from '@effect/vitest';
import * as Equal from 'effect/Equal';
import * as Option from 'effect/Option';
import * as Redactable from 'effect/Redactable';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MData from '@parischap/effect-lib/MData';

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
    assert.isFalse(foo1.pipe(Equal.equals(foo2)));
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

  describe('Redactable', () => {
    class SecretFoo extends MData.Class implements Redactable.Redactable {
      readonly a: number;
      readonly secret: string;
      constructor({ a, secret }: { a: number; secret: string }) {
        super();
        this.a = a;
        this.secret = secret;
      }

      /** Returns the `id` of `this` */
      [MData.idSymbol](): string | (() => string) {
        return 'SecretFoo';
      }

      /** Returns the redacted representation of `this` */
      [Redactable.symbolRedactable](): unknown {
        return { _id: 'SecretFoo', a: this.a, secret: '<redacted>' };
      }
    }

    const secretFoo = new SecretFoo({ a: 5, secret: 'shh' });

    it('toJSON() returns the redacted representation instead of the raw fields', () => {
      TestUtils.assertEquals(secretFoo.toJSON(), { _id: 'SecretFoo', a: 5, secret: '<redacted>' });
    });

    it("toString() does not leak the secret field's raw value", () => {
      assert.isFalse(secretFoo.toString().includes('shh'));
    });
  });
});
