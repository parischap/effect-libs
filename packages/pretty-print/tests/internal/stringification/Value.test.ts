import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPValue from '@parischap/pretty-print/PPValue';

import { describe, it } from 'vitest';

describe('PPValue', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(PPValue.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Equal.equals', () => {
    it('Matching (same content)', () => {
      TestUtils.assertEquals(PPValue.fromTopValue(3), PPValue.fromTopValue(3));
    });

    it('Non-matching (different content)', () => {
      TestUtils.assertNotEquals(PPValue.fromTopValue(3), PPValue.fromTopValue(2));
    });
  });

  it('.pipe()', () => {
    TestUtils.strictEqual(PPValue.fromTopValue(42).pipe(PPValue.content), 42);
  });

  describe('fromTopValue', () => {
    it('Sets depth to 0', () => {
      TestUtils.strictEqual(PPValue.depth(PPValue.fromTopValue(3)), 0);
    });

    it('Sets protoDepth to 0', () => {
      TestUtils.strictEqual(PPValue.protoDepth(PPValue.fromTopValue(3)), 0);
    });

    it('Sets isFromIterator to false', () => {
      TestUtils.assertFalse(PPValue.isFromIterator(PPValue.fromTopValue(3)));
    });

    it('Sets hasGeneratedKey to false', () => {
      TestUtils.assertFalse(PPValue.hasGeneratedKey(PPValue.fromTopValue(3)));
    });

    it('Sets stringKey to empty string', () => {
      TestUtils.deepStrictEqual(PPValue.stringKey(PPValue.fromTopValue(3)), ['']);
    });
  });

  describe('fromNonPrimitiveValueAndKey', () => {
    const enumProp = PPValue.fromNonPrimitiveValueAndKey({
      nonPrimitive: { a: 1, b: 'foo' },
      key: 'a',
      depth: 1,
      protoDepth: 0,
    });

    it('Sets content to the property value', () => {
      TestUtils.strictEqual(PPValue.content(enumProp), 1);
    });

    it('Sets isEnumerable for enumerable properties', () => {
      TestUtils.assertTrue(PPValue.isEnumerable(enumProp));
    });

    it('Sets isEnumerable to false for non-enumerable properties', () => {
      const nonEnum = PPValue.fromNonPrimitiveValueAndKey({
        nonPrimitive: [1, 2],
        key: 'length',
        depth: 1,
        protoDepth: 0,
      });
      TestUtils.assertFalse(PPValue.isEnumerable(nonEnum));
    });

    it('Sets hasSymbolicKey for symbolic keys', () => {
      const sym = Symbol.for('test');
      const symProp = PPValue.fromNonPrimitiveValueAndKey({
        nonPrimitive: { [sym]: 42 },
        key: sym,
        depth: 1,
        protoDepth: 0,
      });
      TestUtils.assertTrue(PPValue.hasSymbolicKey(symProp));
    });

    it('Sets hasSymbolicKey to false for string keys', () => {
      TestUtils.assertFalse(PPValue.hasSymbolicKey(enumProp));
    });

    it('Sets isFromIterator to false', () => {
      TestUtils.assertFalse(PPValue.isFromIterator(enumProp));
    });
  });

  describe('fromNonPrimitiveIterable', () => {
    const iterProp = PPValue.fromNonPrimitiveIterable({
      content: 'foo',
      stringKey: ['key1', 'key2'],
      hasGeneratedKey: false,
      depth: 2,
    });

    it('Sets content correctly', () => {
      TestUtils.strictEqual(PPValue.content(iterProp), 'foo');
    });

    it('Sets isFromIterator to true', () => {
      TestUtils.assertTrue(PPValue.isFromIterator(iterProp));
    });

    it('Sets stringKey correctly', () => {
      TestUtils.deepStrictEqual(PPValue.stringKey(iterProp), ['key1', 'key2']);
    });

    it('Joins multi-line keys for oneLineStringKey', () => {
      TestUtils.strictEqual(PPValue.oneLineStringKey(iterProp), 'key1key2');
    });

    it('Sets depth correctly', () => {
      TestUtils.strictEqual(PPValue.depth(iterProp), 2);
    });

    it('Sets protoDepth to 0', () => {
      TestUtils.strictEqual(PPValue.protoDepth(iterProp), 0);
    });

    it('Sets isEnumerable to true', () => {
      TestUtils.assertTrue(PPValue.isEnumerable(iterProp));
    });
  });

  describe('isPrimitive / isNonPrimitive', () => {
    it('isPrimitive for a number', () => {
      TestUtils.assertTrue(PPValue.isPrimitive(PPValue.fromTopValue(42)));
    });

    it('isPrimitive for null', () => {
      TestUtils.assertTrue(PPValue.isPrimitive(PPValue.fromTopValue(null)));
    });

    it('isNonPrimitive for an object', () => {
      TestUtils.assertTrue(PPValue.isNonPrimitive(PPValue.fromTopValue({ a: 1 })));
    });

    it('isNonPrimitive for an array', () => {
      TestUtils.assertTrue(PPValue.isNonPrimitive(PPValue.fromTopValue([1, 2])));
    });
  });
});
