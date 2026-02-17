import * as TestUtils from '@parischap/configs/TestUtils';
import * as MTypesCategory from '@parischap/effect-lib/MTypesCategory'
import { describe, it } from 'vitest';

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
  const testFunction = (n: number, m?: number) => n + (m !== undefined ? m : 0);

  describe('fromValue and predicates', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypesCategory.isString(MTypesCategory.fromValue(testString)));
      TestUtils.assertTrue(MTypesCategory.isNumber(MTypesCategory.fromValue(testNumber)));
      TestUtils.assertTrue(MTypesCategory.isBigint(MTypesCategory.fromValue(testBigint)));
      TestUtils.assertTrue(MTypesCategory.isBoolean(MTypesCategory.fromValue(testBoolean)));
      TestUtils.assertTrue(MTypesCategory.isSymbol(MTypesCategory.fromValue(testSymbol)));
      TestUtils.assertTrue(MTypesCategory.isUndefined(MTypesCategory.fromValue(undefined)));
      TestUtils.assertTrue(MTypesCategory.isNull(MTypesCategory.fromValue(null)));
      TestUtils.assertTrue(MTypesCategory.isFunction(MTypesCategory.fromValue(testFunction)));
      TestUtils.assertTrue(MTypesCategory.isArray(MTypesCategory.fromValue(testArray)));
      TestUtils.assertTrue(MTypesCategory.isRecord(MTypesCategory.fromValue(testRecord)));
      TestUtils.assertTrue(MTypesCategory.isPrimitive(MTypesCategory.fromValue(testString)));
      TestUtils.assertTrue(MTypesCategory.isNonPrimitive(MTypesCategory.fromValue(testArray)));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypesCategory.isString(MTypesCategory.fromValue(testNumber)));
      TestUtils.assertFalse(MTypesCategory.isNumber(MTypesCategory.fromValue(testString)));
      TestUtils.assertFalse(MTypesCategory.isBigint(MTypesCategory.fromValue(testNumber)));
      TestUtils.assertFalse(MTypesCategory.isBoolean(MTypesCategory.fromValue(testNumber)));
      TestUtils.assertFalse(MTypesCategory.isSymbol(MTypesCategory.fromValue(testNumber)));
      TestUtils.assertFalse(MTypesCategory.isUndefined(MTypesCategory.fromValue(testNumber)));
      TestUtils.assertFalse(MTypesCategory.isNull(MTypesCategory.fromValue(testNumber)));
      TestUtils.assertFalse(MTypesCategory.isFunction(MTypesCategory.fromValue(testNumber)));
      TestUtils.assertFalse(MTypesCategory.isArray(MTypesCategory.fromValue(testNumber)));
      TestUtils.assertFalse(MTypesCategory.isRecord(MTypesCategory.fromValue(testNumber)));
      TestUtils.assertFalse(MTypesCategory.isPrimitive(MTypesCategory.fromValue(testArray)));
      TestUtils.assertFalse(MTypesCategory.isNonPrimitive(MTypesCategory.fromValue(testNumber)));
    });
  });
});
