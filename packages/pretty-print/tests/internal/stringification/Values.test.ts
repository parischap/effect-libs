import { pipe } from 'effect';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';

import * as ASText from '@parischap/ansi-styles/ASText';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPValue from '@parischap/pretty-print/PPValue';
import * as PPValues from '@parischap/pretty-print/PPValues';

import { assert, describe, it } from '@effect/vitest';

describe('PPValues', () => {
  describe('fromNonPrimitiveKeysAndValues', () => {
    it('Returns no properties at maxPrototypeDepth=0', () => {
      const nonPrimitive = PPValue.fromTopValue({ a: 1, b: 'foo' });
      const values = PPValues.fromNonPrimitiveKeysAndValues({
        nonPrimitive,
        maxPrototypeDepth: 0,
      });
      assert.strictEqual(values.length, 0);
    });

    it('Returns own properties at maxPrototypeDepth=1', () => {
      const nonPrimitive = PPValue.fromTopValue({ a: 1, b: 'foo' });
      const values = PPValues.fromNonPrimitiveKeysAndValues({
        nonPrimitive,
        maxPrototypeDepth: 1,
      });
      assert.strictEqual(values.length, 2);
      const [firstValue] = values;
      assert.isDefined(firstValue);
      assert.strictEqual(PPValue.oneLineStringKey(firstValue), 'a');
      assert.strictEqual(PPValue.content(firstValue), 1);
    });

    it('Returns own + prototype properties at maxPrototypeDepth=2', () => {
      const proto = { protoField: 'inherited' };
      const child = Object.assign(Object.create(proto), { ownField: 42 }) as object;
      const nonPrimitive = PPValue.fromTopValue(child);
      const values = PPValues.fromNonPrimitiveKeysAndValues({
        nonPrimitive,
        maxPrototypeDepth: 2,
      });
      const keys = new Set(values.map(PPValue.oneLineStringKey));
      assert.isTrue(keys.has('ownField'));
      assert.isTrue(keys.has('protoField'));
    });

    it('Sets protoDepth=0 for own properties', () => {
      const nonPrimitive = PPValue.fromTopValue({ a: 1 });
      const values = PPValues.fromNonPrimitiveKeysAndValues({
        nonPrimitive,
        maxPrototypeDepth: 1,
      });
      const [firstValue] = values;
      assert.isDefined(firstValue);
      assert.strictEqual(PPValue.protoDepth(firstValue), 0);
    });

    it('Sets protoDepth=1 for first-prototype properties', () => {
      const proto = { inherited: true };
      const child = Object.assign(Object.create(proto), {}) as object;
      const nonPrimitive = PPValue.fromTopValue(child);
      const values = PPValues.fromNonPrimitiveKeysAndValues({
        nonPrimitive,
        maxPrototypeDepth: 2,
      });
      const inherited = values.find((v) => PPValue.oneLineStringKey(v) === 'inherited');
      assert.isDefined(inherited);
      assert.strictEqual(PPValue.protoDepth(inherited), 1);
    });
  });

  describe('fromNonPrimitiveIterable', () => {
    // A simple stringifier for use as key converter
    const stringifier = (v: unknown): PPStringifiedValue.Type =>
      PPStringifiedValue.fromText(ASText.fromString(String(v)));

    describe('Array-like iterable (simple values)', () => {
      it('Returns a value for each element with an auto-generated key', () => {
        const nonPrimitive = PPValue.fromTopValue([10, 20, 30]);
        const values = PPValues.fromNonPrimitiveIterable({ nonPrimitive, stringifier });
        assert.strictEqual(values.length, 3);
        const [firstValue] = values;
        assert.isDefined(firstValue);
        assert.strictEqual(PPValue.oneLineStringKey(firstValue), '0');
        assert.strictEqual(PPValue.content(firstValue), 10);
        assert.isTrue(PPValue.hasGeneratedKey(firstValue));
        assert.isTrue(PPValue.isFromIterator(firstValue));
      });
    });

    describe('Map-like iterable (key-value pairs)', () => {
      it('Returns a value for each entry with the map key as the string key', () => {
        const nonPrimitive = PPValue.fromTopValue(
          new Map([
            ['a', 1],
            ['b', 2],
          ]),
        );
        const values = PPValues.fromNonPrimitiveIterable({ nonPrimitive, stringifier });
        assert.strictEqual(values.length, 2);
        assert.isTrue(
          values.some((v) => PPValue.oneLineStringKey(v) === 'a' && PPValue.content(v) === 1),
        );
        const [firstValue] = values;
        assert.isDefined(firstValue);
        assert.isFalse(PPValue.hasGeneratedKey(firstValue));
      });
    });

    it('Returns empty array for a non-iterable', () => {
      const nonPrimitive = PPValue.fromTopValue({ a: 1 });
      const values = PPValues.fromNonPrimitiveIterable({ nonPrimitive, stringifier });
      assert.deepStrictEqual(values, []);
    });
  });

  describe('sort', () => {
    const a = PPValue.fromNonPrimitiveValueAndKey({
      nonPrimitive: { b: 1, a: 2 },
      key: 'b',
      depth: 1,
      protoDepth: 0,
    });
    const b = PPValue.fromNonPrimitiveValueAndKey({
      nonPrimitive: { b: 1, a: 2 },
      key: 'a',
      depth: 1,
      protoDepth: 0,
    });
    const values: PPValues.Type = [a, b];

    it('With Order.none returns values unchanged', () => {
      assert.deepStrictEqual(pipe(values, PPValues.sort(Option.none())), values);
    });

    it('With an Order sorts the values', () => {
      const byKey: Order.Order<PPValue.Any> = (x, y) =>
        Order.String(PPValue.oneLineStringKey(x), PPValue.oneLineStringKey(y));
      const sorted = pipe(values, PPValues.sort(Option.some(byKey)));
      const [firstValue, secondValue] = sorted;
      assert.isDefined(firstValue);
      assert.isDefined(secondValue);
      assert.strictEqual(PPValue.oneLineStringKey(firstValue), 'a');
      assert.strictEqual(PPValue.oneLineStringKey(secondValue), 'b');
    });
  });
});
