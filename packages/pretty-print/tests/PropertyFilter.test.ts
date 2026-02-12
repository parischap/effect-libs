import * as TestUtils from '@parischap/configs/TestUtils';
import { MPredicate } from '@parischap/effect-lib';
import { PPPropertyFilter, PPValue, PPValues } from '@parischap/pretty-print';
import { Array, Function, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('PropertyFilter', () => {
  const { removeFunctions } = PPPropertyFilter;

  const value1 = PPValue.fromTopValue({
    content: 1,
  });
  const value2 = PPValue.fromTopValue(Math.max);

  const value3 = PPValue.fromNonPrimitiveValueAndKey({
    nonPrimitive: [1, 2],
    key: 'length',
    depth: 0,
    protoDepth: 0,
  });
  const value4 = PPValue.fromNonPrimitiveValueAndKey({
    nonPrimitive: { [Symbol.iterator]: 1, a: 2 },
    key: Symbol.iterator,
    depth: 0,
    protoDepth: 0,
  });
  const values: PPValues.Type = Array.make(value1, value2, value3, value4);

  describe('Tag, prototype and guards', () => {
    it('moduleTag', () => {
      TestUtils.assertSome(
        TestUtils.moduleTagFromTestFilePath(__filename),
        PPPropertyFilter.moduleTag,
      );
    });

    describe('Equal.equals', () => {
      it('Matching', () => {
        TestUtils.assertEquals(
          removeFunctions,
          PPPropertyFilter.make({
            id: 'RemoveFunctions',
            action: Function.identity,
          }),
        );
      });

      it('Non-matching', () => {
        TestUtils.assertNotEquals(removeFunctions, PPPropertyFilter.removeNonFunctions);
      });
    });

    it('.toString()', () => {
      TestUtils.strictEqual(removeFunctions.toString(), `RemoveFunctions`);
    });

    it('.pipe()', () => {
      TestUtils.strictEqual(removeFunctions.pipe(PPPropertyFilter.id), 'RemoveFunctions');
    });

    describe('has', () => {
      it('Matching', () => {
        TestUtils.assertTrue(PPPropertyFilter.has(removeFunctions));
      });
      it('Non matching', () => {
        TestUtils.assertFalse(PPPropertyFilter.has(new Date()));
      });
    });
  });

  it('removeNonFunctions', () => {
    TestUtils.deepStrictEqual(pipe(values, PPPropertyFilter.removeNonFunctions), Array.of(value2));
  });

  it('removeFunctions', () => {
    TestUtils.deepStrictEqual(
      pipe(values, PPPropertyFilter.removeFunctions),
      Array.make(value1, value3, value4),
    );
  });

  it('removeNonEnumerables', () => {
    TestUtils.deepStrictEqual(
      pipe(values, PPPropertyFilter.removeNonEnumerables),
      Array.of(value4),
    );
  });

  it('removeEnumerables', () => {
    TestUtils.deepStrictEqual(
      pipe(values, PPPropertyFilter.removeEnumerables),
      Array.make(value1, value2, value3),
    );
  });

  it('removeStringKeys', () => {
    TestUtils.deepStrictEqual(pipe(values, PPPropertyFilter.removeStringKeys), Array.of(value4));
  });

  it('removeSymbolicKeys', () => {
    TestUtils.deepStrictEqual(
      pipe(values, PPPropertyFilter.removeSymbolicKeys),
      Array.make(value1, value2, value3),
    );
  });

  it('removeNotFulfillingKeyPredicateMaker', () => {
    TestUtils.deepStrictEqual(
      pipe(
        values,
        PPPropertyFilter.removeNotFulfillingKeyPredicateMaker({
          id: 'OnlyLength',
          predicate: MPredicate.strictEquals('length'),
        }),
      ),
      Array.of(value3),
    );
  });
});
