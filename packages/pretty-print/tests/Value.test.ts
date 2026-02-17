import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPValue from '@parischap/pretty-print/PPValue'
import { describe, it } from 'vitest';

describe('Value', () => {
  const value1 = PPValue.fromTopValue(3);
  const value2 = PPValue.fromTopValue(3);
  const value3 = PPValue.fromTopValue(2);

  describe('Tag, prototype and guards', () => {
    it('moduleTag', () => {
      TestUtils.assertSome(TestUtils.moduleTagFromTestFilePath(__filename), PPValue.moduleTag);
    });

    describe('Equal.equals', () => {
      it('Matching', () => {
        TestUtils.assertEquals(value1, value2);
      });

      it('Non-matching', () => {
        TestUtils.assertNotEquals(value1, value3);
      });
    });

    it('.toString()', () => {
      TestUtils.strictEqual(
        value1.toString(),
        `{
  "_id": "@parischap/pretty-print/Value/",
  "content": 3,
  "contentType": 1,
  "depth": 0,
  "protoDepth": 0,
  "stringKey": [
    ""
  ],
  "oneLineStringKey": "",
  "hasSymbolicKey": false,
  "isEnumerable": false
}`,
      );
    });

    it('.pipe()', () => {
      TestUtils.strictEqual(value1.pipe(PPValue.content), 3);
    });

    describe('has', () => {
      it('Matching', () => {
        TestUtils.assertTrue(PPValue.has(value1));
      });
      it('Non matching', () => {
        TestUtils.assertFalse(PPValue.has(new Date()));
      });
    });
  });

  describe('fromNonPrimitiveValueAndKey', () => {
    it('Enumerable property', () => {
      TestUtils.strictEqual(
        PPValue.fromNonPrimitiveValueAndKey({
          nonPrimitive: { a: 1, b: 'foo' },
          key: 'a',
          depth: 1,
          protoDepth: 0,
        }).toString(),
        `{
  "_id": "@parischap/pretty-print/Value/",
  "content": 1,
  "contentType": 1,
  "depth": 1,
  "protoDepth": 0,
  "stringKey": [
    "a"
  ],
  "oneLineStringKey": "a",
  "hasSymbolicKey": false,
  "isEnumerable": true
}`,
      );
    });

    it('Non-enumerable property', () => {
      TestUtils.strictEqual(
        PPValue.fromNonPrimitiveValueAndKey({
          nonPrimitive: [1, 2],
          key: 'length',
          depth: 1,
          protoDepth: 0,
        }).toString(),
        `{
  "_id": "@parischap/pretty-print/Value/",
  "content": 2,
  "contentType": 1,
  "depth": 1,
  "protoDepth": 0,
  "stringKey": [
    "length"
  ],
  "oneLineStringKey": "length",
  "hasSymbolicKey": false,
  "isEnumerable": false
}`,
      );
    });
  });
});

it('fromIterable', () => {
  TestUtils.strictEqual(
    PPValue.fromIterable({
      content: 'foo',
      stringKey: ['a : 1', 'b : 2'],
      depth: 1,
    }).toString(),
    `{
  "_id": "@parischap/pretty-print/Value/",
  "content": "foo",
  "contentType": 0,
  "depth": 1,
  "protoDepth": 0,
  "stringKey": [
    "a : 1",
    "b : 2"
  ],
  "oneLineStringKey": "a : 1b : 2",
  "hasSymbolicKey": false,
  "isEnumerable": true
}`,
  );
});
