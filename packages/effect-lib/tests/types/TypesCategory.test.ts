import * as MTypesCategory from '@parischap/effect-lib/MTypesCategory';

import { assert, describe, it } from '@effect/vitest';

describe('MTypesCategory', () => {
  const testString = 'foo';
  const testNumber = 5;
  const testBigint = 5n;
  const testBoolean = false;
  const testSymbol: unique symbol = Symbol.for('testSymbol');

  const testArray = [5, 6];
  const testRecord = {
    a: 'foo',
    b: false,
  };
  const testFunction = (n: number, m?: number) => n + (m ?? 0);

  describe('fromValue and predicates', () => {
    it('Matching', () => {
      assert.isTrue(MTypesCategory.isString(MTypesCategory.fromValue(testString)));
      assert.isTrue(MTypesCategory.isNumber(MTypesCategory.fromValue(testNumber)));
      assert.isTrue(MTypesCategory.isBigint(MTypesCategory.fromValue(testBigint)));
      assert.isTrue(MTypesCategory.isBoolean(MTypesCategory.fromValue(testBoolean)));
      assert.isTrue(MTypesCategory.isSymbol(MTypesCategory.fromValue(testSymbol)));
      assert.isTrue(MTypesCategory.isUndefined(MTypesCategory.fromValue(undefined)));
      assert.isTrue(MTypesCategory.isNull(MTypesCategory.fromValue(null)));
      assert.isTrue(MTypesCategory.isFunction(MTypesCategory.fromValue(testFunction)));
      assert.isTrue(MTypesCategory.isArray(MTypesCategory.fromValue(testArray)));
      assert.isTrue(MTypesCategory.isRecord(MTypesCategory.fromValue(testRecord)));
      assert.isTrue(MTypesCategory.isPrimitive(MTypesCategory.fromValue(testString)));
      assert.isTrue(MTypesCategory.isNonPrimitive(MTypesCategory.fromValue(testArray)));
    });

    it('Non matching', () => {
      assert.isFalse(MTypesCategory.isString(MTypesCategory.fromValue(testNumber)));
      assert.isFalse(MTypesCategory.isNumber(MTypesCategory.fromValue(testString)));
      assert.isFalse(MTypesCategory.isBigint(MTypesCategory.fromValue(testNumber)));
      assert.isFalse(MTypesCategory.isBoolean(MTypesCategory.fromValue(testNumber)));
      assert.isFalse(MTypesCategory.isSymbol(MTypesCategory.fromValue(testNumber)));
      assert.isFalse(MTypesCategory.isUndefined(MTypesCategory.fromValue(testNumber)));
      assert.isFalse(MTypesCategory.isNull(MTypesCategory.fromValue(testNumber)));
      assert.isFalse(MTypesCategory.isFunction(MTypesCategory.fromValue(testNumber)));
      assert.isFalse(MTypesCategory.isArray(MTypesCategory.fromValue(testNumber)));
      assert.isFalse(MTypesCategory.isRecord(MTypesCategory.fromValue(testNumber)));
      assert.isFalse(MTypesCategory.isPrimitive(MTypesCategory.fromValue(testArray)));
      assert.isFalse(MTypesCategory.isNonPrimitive(MTypesCategory.fromValue(testNumber)));
    });
  });
});
