import * as assert from '@effect/vitest/assert';
import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPValue from '@parischap/pretty-print/PPValue';

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
    assert.strictEqual(PPValue.fromTopValue(42).pipe(PPValue.content), 42);
  });

  describe('fromTopValue', () => {
    it('Sets depth to 0', () => {
      assert.strictEqual(PPValue.depth(PPValue.fromTopValue(3)), 0);
    });

    it('Sets protoDepth to 0', () => {
      assert.strictEqual(PPValue.protoDepth(PPValue.fromTopValue(3)), 0);
    });

    it('Sets isFromIterator to false', () => {
      assert.isFalse(PPValue.isFromIterator(PPValue.fromTopValue(3)));
    });

    it('Sets hasGeneratedKey to false', () => {
      assert.isFalse(PPValue.hasGeneratedKey(PPValue.fromTopValue(3)));
    });

    it('Sets stringKey to empty string', () => {
      assert.deepStrictEqual(PPValue.stringKey(PPValue.fromTopValue(3)), ['']);
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
      assert.strictEqual(PPValue.content(enumProp), 1);
    });

    it('Sets isEnumerable for enumerable properties', () => {
      assert.isTrue(PPValue.isEnumerable(enumProp));
    });

    it('Sets isEnumerable to false for non-enumerable properties', () => {
      const nonEnum = PPValue.fromNonPrimitiveValueAndKey({
        nonPrimitive: [1, 2],
        key: 'length',
        depth: 1,
        protoDepth: 0,
      });
      assert.isFalse(PPValue.isEnumerable(nonEnum));
    });

    it('Sets hasSymbolicKey for symbolic keys', () => {
      const sym = Symbol.for('test');
      const symProp = PPValue.fromNonPrimitiveValueAndKey({
        nonPrimitive: { [sym]: 42 },
        key: sym,
        depth: 1,
        protoDepth: 0,
      });
      assert.isTrue(PPValue.hasSymbolicKey(symProp));
    });

    it('Sets hasSymbolicKey to false for string keys', () => {
      assert.isFalse(PPValue.hasSymbolicKey(enumProp));
    });

    it('Sets isFromIterator to false', () => {
      assert.isFalse(PPValue.isFromIterator(enumProp));
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
      assert.strictEqual(PPValue.content(iterProp), 'foo');
    });

    it('Sets isFromIterator to true', () => {
      assert.isTrue(PPValue.isFromIterator(iterProp));
    });

    it('Sets stringKey correctly', () => {
      assert.deepStrictEqual(PPValue.stringKey(iterProp), ['key1', 'key2']);
    });

    it('Joins multi-line keys for oneLineStringKey', () => {
      assert.strictEqual(PPValue.oneLineStringKey(iterProp), 'key1key2');
    });

    it('Sets depth correctly', () => {
      assert.strictEqual(PPValue.depth(iterProp), 2);
    });

    it('Sets protoDepth to 0', () => {
      assert.strictEqual(PPValue.protoDepth(iterProp), 0);
    });

    it('Sets isEnumerable to true', () => {
      assert.isTrue(PPValue.isEnumerable(iterProp));
    });
  });

  describe('isPrimitive / isNonPrimitive', () => {
    it('isPrimitive for a number', () => {
      assert.isTrue(PPValue.isPrimitive(PPValue.fromTopValue(42)));
    });

    it('isPrimitive for null', () => {
      assert.isTrue(PPValue.isPrimitive(PPValue.fromTopValue(null)));
    });

    it('isNonPrimitive for an object', () => {
      assert.isTrue(PPValue.isNonPrimitive(PPValue.fromTopValue({ a: 1 })));
    });

    it('isNonPrimitive for an array', () => {
      assert.isTrue(PPValue.isNonPrimitive(PPValue.fromTopValue([1, 2])));
    });
  });
});
