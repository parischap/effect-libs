import * as Array from 'effect/Array';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MPredicate from '@parischap/effect-lib/MPredicate';
import * as PPPropertyFilter from '@parischap/pretty-print/PPPropertyFilter';
import * as PPValue from '@parischap/pretty-print/PPValue';

import { describe, it } from 'vitest';

describe('PPPropertyFilter', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(PPPropertyFilter.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Equal.equals', () => {
    it('Matching', () => {
      TestUtils.assertEquals(
        PPPropertyFilter.removeFunctions,
        PPPropertyFilter.make({ id: 'RemoveFunctions', action: Function.identity }),
      );
    });

    it('Non-matching', () => {
      TestUtils.assertNotEquals(
        PPPropertyFilter.removeFunctions,
        PPPropertyFilter.removeNonFunctions,
      );
    });
  });

  it('.toString()', () => {
    TestUtils.strictEqual(PPPropertyFilter.removeFunctions.toString(), 'RemoveFunctions');
  });

  it('.pipe()', () => {
    TestUtils.strictEqual(
      PPPropertyFilter.removeFunctions.pipe(PPPropertyFilter.id),
      'RemoveFunctions',
    );
  });

  // Build a set of test values covering different types of properties
  const fnValue = PPValue.fromTopValue(Math.max);
  const objValue = PPValue.fromTopValue({ a: 1 });
  const nonEnumerableValue = PPValue.fromNonPrimitiveValueAndKey({
    nonPrimitive: [1, 2],
    key: 'length',
    depth: 1,
    protoDepth: 0,
  });
  const symbolicValue = PPValue.fromNonPrimitiveValueAndKey({
    nonPrimitive: { [Symbol.iterator]: 1 },
    key: Symbol.iterator,
    depth: 1,
    protoDepth: 0,
  });
  const stringValue = PPValue.fromNonPrimitiveValueAndKey({
    nonPrimitive: { a: 1 },
    key: 'a',
    depth: 1,
    protoDepth: 0,
  });
  const values = Array.make(fnValue, objValue, nonEnumerableValue, symbolicValue, stringValue);

  it('none keeps everything', () => {
    TestUtils.deepStrictEqual(PPPropertyFilter.action(PPPropertyFilter.none)(values), values);
  });

  it('removeNonFunctions keeps only functions', () => {
    TestUtils.deepStrictEqual(
      PPPropertyFilter.action(PPPropertyFilter.removeNonFunctions)(values),
      Array.of(fnValue),
    );
  });

  it('removeFunctions removes functions', () => {
    TestUtils.deepStrictEqual(
      PPPropertyFilter.action(PPPropertyFilter.removeFunctions)(values),
      Array.make(objValue, nonEnumerableValue, symbolicValue, stringValue),
    );
  });

  it('removeNonEnumerables keeps only enumerable properties', () => {
    TestUtils.deepStrictEqual(
      PPPropertyFilter.action(PPPropertyFilter.removeNonEnumerables)(values),
      Array.make(symbolicValue, stringValue),
    );
  });

  it('removeEnumerables keeps only non-enumerable properties', () => {
    TestUtils.deepStrictEqual(
      PPPropertyFilter.action(PPPropertyFilter.removeEnumerables)(values),
      Array.make(fnValue, objValue, nonEnumerableValue),
    );
  });

  it('removeStringKeys keeps only symbolic keys', () => {
    TestUtils.deepStrictEqual(
      PPPropertyFilter.action(PPPropertyFilter.removeStringKeys)(values),
      Array.of(symbolicValue),
    );
  });

  it('removeSymbolicKeys keeps only string keys', () => {
    TestUtils.deepStrictEqual(
      PPPropertyFilter.action(PPPropertyFilter.removeSymbolicKeys)(values),
      Array.make(fnValue, objValue, nonEnumerableValue, stringValue),
    );
  });

  it('removeNotFulfillingKeyPredicateMaker keeps only matching string keys', () => {
    TestUtils.deepStrictEqual(
      PPPropertyFilter.action(
        PPPropertyFilter.removeNotFulfillingKeyPredicateMaker({
          id: 'OnlyA',
          predicate: MPredicate.strictEquals('a'),
        }),
      )(values),
      Array.of(stringValue),
    );
  });

  describe('merge', () => {
    it('Applies all filters in sequence', () => {
      const merged = PPPropertyFilter.merge({
        id: 'NoFunctionsNoSymbols',
        filters: [PPPropertyFilter.removeFunctions, PPPropertyFilter.removeSymbolicKeys],
      });
      TestUtils.deepStrictEqual(
        PPPropertyFilter.action(merged)(values),
        Array.make(objValue, nonEnumerableValue, stringValue),
      );
    });
  });
});
