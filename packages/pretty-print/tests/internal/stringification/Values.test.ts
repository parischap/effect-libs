import { pipe } from 'effect';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';

import * as ASText from '@parischap/ansi-styles/ASText';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPValue from '@parischap/pretty-print/PPValue';
import * as PPValues from '@parischap/pretty-print/PPValues';

import { describe, it } from 'vitest';

describe('PPValues', () => {
  describe('fromNonPrimitiveKeysAndValues', () => {
    it('Returns no properties at maxPrototypeDepth=0', () => {
      const nonPrimitive = PPValue.fromTopValue({ a: 1, b: 'foo' });
      const values = PPValues.fromNonPrimitiveKeysAndValues({
        nonPrimitive,
        maxPrototypeDepth: 0,
      });
      TestUtils.strictEqual(values.length, 0);
    });

    it('Returns own properties at maxPrototypeDepth=1', () => {
      const nonPrimitive = PPValue.fromTopValue({ a: 1, b: 'foo' });
      const values = PPValues.fromNonPrimitiveKeysAndValues({
        nonPrimitive,
        maxPrototypeDepth: 1,
      });
      TestUtils.strictEqual(values.length, 2);
      const [firstValue] = values;
      TestUtils.assertDefined(firstValue);
      TestUtils.strictEqual(PPValue.oneLineStringKey(firstValue), 'a');
      TestUtils.strictEqual(PPValue.content(firstValue as PPValue.Type<unknown>), 1);
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
      TestUtils.assertTrue(keys.has('ownField'));
      TestUtils.assertTrue(keys.has('protoField'));
    });

    it('Sets protoDepth=0 for own properties', () => {
      const nonPrimitive = PPValue.fromTopValue({ a: 1 });
      const values = PPValues.fromNonPrimitiveKeysAndValues({
        nonPrimitive,
        maxPrototypeDepth: 1,
      });
      const [firstValue] = values;
      TestUtils.assertDefined(firstValue);
      TestUtils.strictEqual(PPValue.protoDepth(firstValue), 0);
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
      TestUtils.assertDefined(inherited);
      TestUtils.strictEqual(PPValue.protoDepth(inherited), 1);
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
        TestUtils.strictEqual(values.length, 3);
        const [firstValue] = values;
        TestUtils.assertDefined(firstValue);
        TestUtils.strictEqual(PPValue.oneLineStringKey(firstValue), '0');
        TestUtils.strictEqual(PPValue.content(firstValue), 10);
        TestUtils.assertTrue(PPValue.hasGeneratedKey(firstValue));
        TestUtils.assertTrue(PPValue.isFromIterator(firstValue));
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
        TestUtils.strictEqual(values.length, 2);
        TestUtils.assertTrue(
          values.some((v) => PPValue.oneLineStringKey(v) === 'a' && PPValue.content(v) === 1),
        );
        const [firstValue] = values;
        TestUtils.assertDefined(firstValue);
        TestUtils.assertFalse(PPValue.hasGeneratedKey(firstValue));
      });
    });

    it('Returns empty array for a non-iterable', () => {
      const nonPrimitive = PPValue.fromTopValue({ a: 1 });
      const values = PPValues.fromNonPrimitiveIterable({ nonPrimitive, stringifier });
      TestUtils.deepStrictEqual(values, []);
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
      TestUtils.deepStrictEqual(pipe(values, PPValues.sort(Option.none())), values);
    });

    it('With an Order sorts the values', () => {
      const byKey: Order.Order<PPValue.Any> = (x, y) =>
        Order.String(PPValue.oneLineStringKey(x), PPValue.oneLineStringKey(y));
      const sorted = pipe(values, PPValues.sort(Option.some(byKey)));
      const [firstValue, secondValue] = sorted;
      TestUtils.assertDefined(firstValue);
      TestUtils.assertDefined(secondValue);
      TestUtils.strictEqual(PPValue.oneLineStringKey(firstValue), 'a');
      TestUtils.strictEqual(PPValue.oneLineStringKey(secondValue), 'b');
    });
  });
});
