import * as TestUtils from '@parischap/configs/TestUtils';
import * as MTypes from '@parischap/effect-lib/MTypes';
import * as Number from 'effect/Number';
import { describe, it } from 'vitest';

const unknown = null as unknown;

const testString = 'foo';
const testNumber = 5;
const testBigint = 5n;
const testBoolean = false;
const testSymbol: unique symbol = Symbol.for('testSymbol');

const testArray0: Array<number> = [];
const testArray1 = [5];
const testArray2 = [5, 6];
const testArray3 = [5, 6, 7];

const testOneArgFunction = Number.increment;
const testFunction = (n: number, m?: number) => n + (m !== undefined ? m : 0);

interface TestInterface {
  readonly a: number;
  readonly [testSymbol]: boolean;
  readonly b: string;
  readonly toString: () => string;
}

//type TestTuple = readonly [number, boolean, string];
//type TestRefinement = typeof MTypes.isString;
//type TestOneArgFunction = typeof Number.increment;

/** Tuple */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MTypes.Tuple<string, 2 | 3>,
    readonly [string, string] | readonly [string, string, string]
  >(),
);
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<MTypes.Tuple<string, number>, ReadonlyArray<string>>(),
);

/** IntRange */
//TestUtils.assertTrueType(TestUtils.areEqualTypes<MTypes.IntRange<3, 6>, 3 | 4 | 5>());

/** ReadonlyTail */
/*TestUtils.assertTrueType(
  TestUtils.areEqualTypes<MTypes.ReadonlyTail<TestTuple>, readonly [boolean, string]>(),
);*/

/** MapToTarget */
/*TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MTypes.MapToTarget<TestTuple, string>,
    readonly [string, string, string]
  >(),
);
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MTypes.MapToTarget<ReadonlyArray<number>, string>,
    ReadonlyArray<string>
  >(),
);
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MTypes.MapToTarget<TestInterface, string>,
    {
      readonly a: string;
      readonly [testSymbol]: string;
      readonly b: string;
      readonly toString: string;
    }
  >(),
);
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MTypes.MapToTarget<Record.ReadonlyRecord<string, number>, string>,
    Record.ReadonlyRecord<string, string>
  >(),
);*/

/** Data */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MTypes.Data<TestInterface>,
    {
      readonly a: number;
      readonly b: string;
    }
  >(),
);

/** SetArgTypeTo */
/*TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MTypes.SetArgTypeTo<TestRefinement, MTypes.Primitive>,
    Predicate.Refinement<MTypes.Primitive, string>
  >(),
);
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MTypes.SetArgTypeTo<TestOneArgFunction, string>,
    MTypes.OneArgFunction<string, number>
  >(),
);
TestUtils.assertTrueType(TestUtils.areEqualTypes<MTypes.SetArgTypeTo<number, string>, number>());*/

/** ToKeyIntersection */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<MTypes.ToKeyIntersection<readonly [5, 6]>, 5 & 6>(),
);

/** IntersectAndSimplify */
TestUtils.assertTrueType(TestUtils.areEqualTypes<MTypes.IntersectAndSimplify<number, 5>, 5>());

describe('MTypes', () => {
  describe('isString', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isString(testString));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isString(testNumber));
    });
  });

  describe('isNumber', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isNumber(testNumber));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isNumber(testString));
    });
  });

  describe('isBigInt', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isBigInt(testBigint));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isBigInt(testNumber));
    });
  });

  describe('isBoolean', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isBoolean(testBoolean));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isBoolean(testNumber));
    });
  });

  describe('isSymbol', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isSymbol(testSymbol));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isSymbol(testNumber));
    });
  });

  describe('isUndefined', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isUndefined(undefined));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isUndefined(testNumber));
    });
  });

  describe('isNotUndefined', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isNotUndefined(testNumber));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isNotUndefined(undefined));
    });
  });

  describe('isNull', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isNull(null));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isNull(testNumber));
    });
  });

  describe('isNotNull', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isNotNull(testNumber));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isNotNull(null));
    });
  });

  describe('isNullable', () => {
    it('null', () => {
      TestUtils.assertTrue(MTypes.isNullable(null));
    });

    it('undefined', () => {
      TestUtils.assertTrue(MTypes.isNullable(undefined));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isNullable(testNumber));
    });
  });

  describe('isNotNullable', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isNotNullable(testNumber));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isNotNullable(null));
    });
  });

  describe('isPrimitive', () => {
    if (MTypes.isPrimitive(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, MTypes.Primitive>());

    it('Number', () => {
      TestUtils.assertTrue(MTypes.isPrimitive(testNumber));
    });

    it('Undefined', () => {
      TestUtils.assertTrue(MTypes.isPrimitive(undefined));
    });

    it('Array', () => {
      TestUtils.assertFalse(MTypes.isPrimitive(testArray2));
    });

    it('Function', () => {
      TestUtils.assertFalse(MTypes.isPrimitive(testOneArgFunction));
    });
  });

  describe('isNonPrimitive', () => {
    it('Array', () => {
      TestUtils.assertTrue(MTypes.isNonPrimitive(testArray2));
    });

    it('Function', () => {
      TestUtils.assertTrue(MTypes.isNonPrimitive(testOneArgFunction));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isNonPrimitive(testSymbol));
    });
  });

  describe('isFunction', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isFunction(testFunction));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isFunction(testNumber));
    });
  });

  describe('isOneArgFunction', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isOneArgFunction(testOneArgFunction));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isOneArgFunction(testFunction));
    });
  });

  describe('isEmptyArray', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isEmptyArray(testArray0));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isEmptyArray(testArray3));
    });
  });

  describe('isEmptyReadonlyArray', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isEmptyReadonlyArray(testArray0));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isEmptyReadonlyArray(testArray3));
    });
  });

  describe('isOverOne', () => {
    it('Singleton array', () => {
      TestUtils.assertTrue(MTypes.isOverOne(testArray1));
    });

    it('Two-element array', () => {
      TestUtils.assertTrue(MTypes.isOverOne(testArray2));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isOverOne(testArray0));
    });
  });

  describe('isReadonlyOverOne', () => {
    it('Singleton array', () => {
      TestUtils.assertTrue(MTypes.isReadonlyOverOne(testArray1));
    });

    it('Two-element array', () => {
      TestUtils.assertTrue(MTypes.isReadonlyOverOne(testArray2));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isReadonlyOverOne(testArray0));
    });
  });

  describe('isOverTwo', () => {
    it('Two-element array', () => {
      TestUtils.assertTrue(MTypes.isOverTwo(testArray2));
    });

    it('Three-element array', () => {
      TestUtils.assertTrue(MTypes.isOverTwo(testArray3));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isOverTwo(testArray1));
    });
  });

  describe('isReadonlyOverTwo', () => {
    it('Two-element array', () => {
      TestUtils.assertTrue(MTypes.isReadonlyOverTwo(testArray2));
    });

    it('Three-element array', () => {
      TestUtils.assertTrue(MTypes.isReadonlyOverTwo(testArray3));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isReadonlyOverTwo(testArray0));
    });
  });

  describe('isSingleton', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isSingleton(testArray1));
    });

    it('Empty array', () => {
      TestUtils.assertFalse(MTypes.isSingleton(testArray0));
    });

    it('Two-element array', () => {
      TestUtils.assertFalse(MTypes.isSingleton(testArray2));
    });
  });

  describe('isReadonlySingleton', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isReadonlySingleton(testArray1));
    });

    it('Empty array', () => {
      TestUtils.assertFalse(MTypes.isReadonlySingleton(testArray0));
    });

    it('Two-element array', () => {
      TestUtils.assertFalse(MTypes.isReadonlySingleton(testArray2));
    });
  });

  describe('isPair', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isPair(testArray2));
    });

    it('Singleton array', () => {
      TestUtils.assertFalse(MTypes.isPair(testArray1));
    });

    it('Three-element array', () => {
      TestUtils.assertFalse(MTypes.isPair(testArray3));
    });
  });

  describe('isReadonlyPair', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isReadonlyPair(testArray2));
    });

    it('Empty array', () => {
      TestUtils.assertFalse(MTypes.isReadonlyPair(testArray0));
    });

    it('Three-element array', () => {
      TestUtils.assertFalse(MTypes.isReadonlyPair(testArray3));
    });
  });

  describe('isIterable', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isIterable(testArray2));
    });

    it('Number', () => {
      TestUtils.assertFalse(MTypes.isIterable(testNumber));
    });

    it('String', () => {
      TestUtils.assertFalse(MTypes.isIterable(testString));
    });
  });

  /* describe('isErrorish', () => {
    if (MTypes.isErrorish(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, MTypes.Errorish>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isErrorish({ message: 'foo' }));
      TestUtils.assertTrue(MTypes.isErrorish({ message: 'foo', stack: 'bar' }));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isErrorish(null));
      TestUtils.assertFalse(MTypes.isErrorish({ message: false }));
      TestUtils.assertFalse(MTypes.isErrorish({ message: 'foo', stack: 5 }));
      TestUtils.assertFalse(MTypes.isErrorish(testRecord));
    });
  });*/

  describe('typedArrayName', () => {
    it('Matching', () => {
      TestUtils.assertSome(MTypes.typedArrayName(new Uint8Array(5)), 'Uint8Array');
    });

    it('Non matching', () => {
      TestUtils.assertNone(MTypes.typedArrayName(5));
    });
  });

  describe('isTypedArray', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isTypedArray(new Uint16Array(5)));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isTypedArray(5));
    });
  });
});
