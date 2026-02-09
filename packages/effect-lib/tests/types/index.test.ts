import * as TestUtils from '@parischap/configs/TestUtils';
import { MTypes } from '@parischap/effect-lib';
import { Number } from 'effect';
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
const testReadonlyArray = testArray2 as ReadonlyArray<number>;

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
    if (MTypes.isString(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, string>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isString(testString));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isString(testNumber));
    });
  });

  describe('isNumber', () => {
    if (MTypes.isNumber(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, number>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isNumber(testNumber));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isNumber(testString));
    });
  });

  describe('isBigInt', () => {
    if (MTypes.isBigInt(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, bigint>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isBigInt(testBigint));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isBigInt(testNumber));
    });
  });

  describe('isBoolean', () => {
    if (MTypes.isBoolean(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, boolean>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isBoolean(testBoolean));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isBoolean(testNumber));
    });
  });

  describe('isSymbol', () => {
    if (MTypes.isSymbol(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, symbol>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isSymbol(testSymbol));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isSymbol(testNumber));
    });
  });

  describe('isUndefined', () => {
    if (MTypes.isUndefined(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, undefined>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isUndefined(undefined));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isUndefined(testNumber));
    });
  });

  describe('isNotUndefined', () => {
    const undefinedOrNumber = undefined as undefined | number;
    if (MTypes.isNotUndefined(undefinedOrNumber))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof undefinedOrNumber, number>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isNotUndefined(testNumber));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isNotUndefined(undefined));
    });
  });

  describe('isNull', () => {
    if (MTypes.isNull(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, null>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isNull(null));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isNull(testNumber));
    });
  });

  describe('isNotNull', () => {
    const nullOrNumber = null as null | number;
    if (MTypes.isNotNull(nullOrNumber))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof nullOrNumber, number>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isNotNull(testNumber));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isNotNull(null));
    });
  });

  describe('isNullable', () => {
    const nullOrNumber = null as null | number;
    if (MTypes.isNullable(nullOrNumber))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof nullOrNumber, null>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isNullable(null));
      TestUtils.assertTrue(MTypes.isNullable(undefined));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isNullable(testNumber));
    });
  });

  describe('isNotNullable', () => {
    const nullOrNumber = null as null | number;
    if (MTypes.isNotNullable(nullOrNumber))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof nullOrNumber, number>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isNotNullable(testNumber));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isNotNullable(null));
    });
  });

  describe('isPrimitive', () => {
    const numberOrArray = [3] as unknown as number | ReadonlyArray<number>;
    if (MTypes.isPrimitive(numberOrArray))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof numberOrArray, number>());

    if (MTypes.isPrimitive(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, MTypes.Primitive>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isPrimitive(testNumber));
      TestUtils.assertTrue(MTypes.isPrimitive(undefined));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isPrimitive(testArray2));
      TestUtils.assertFalse(MTypes.isPrimitive(testOneArgFunction));
    });
  });

  describe('isNonPrimitive', () => {
    const numberOrArray = [3] as unknown as number | ReadonlyArray<number>;
    if (MTypes.isNonPrimitive(numberOrArray))
      TestUtils.assertTrueType(
        TestUtils.areEqualTypes<typeof numberOrArray, ReadonlyArray<number>>(),
      );

    if (MTypes.isNonPrimitive(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, MTypes.NonPrimitive>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isNonPrimitive(testArray2));
      TestUtils.assertTrue(MTypes.isNonPrimitive(testOneArgFunction));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isNonPrimitive(testSymbol));
    });
  });

  describe('isFunction', () => {
    if (MTypes.isFunction(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, MTypes.AnyFunction>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isFunction(testFunction));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isFunction(testNumber));
    });
  });

  describe('isOneArgFunction', () => {
    if (MTypes.isFunction(testFunction))
      TestUtils.assertTrueType(
        TestUtils.areEqualTypes<typeof testFunction, MTypes.OneArgFunction<number>>(),
      );

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isOneArgFunction(testOneArgFunction));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isOneArgFunction(testFunction));
    });
  });

  describe('isEmptyArray', () => {
    if (MTypes.isEmptyArray(testArray2))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof testArray2, MTypes.EmptyArray>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isEmptyArray(testArray0));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isEmptyArray(testArray3));
    });
  });

  describe('isEmptyReadonlyArray', () => {
    if (MTypes.isEmptyReadonlyArray(testReadonlyArray))
      TestUtils.assertTrueType(
        TestUtils.areEqualTypes<typeof testReadonlyArray, MTypes.EmptyReadonlyArray>(),
      );

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isEmptyReadonlyArray(testArray0));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isEmptyReadonlyArray(testArray3));
    });
  });

  describe('isOverOne', () => {
    if (MTypes.isOverOne(testArray2))
      TestUtils.assertTrueType(
        TestUtils.areEqualTypes<typeof testArray2, MTypes.OverOne<number>>(),
      );

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isOverOne(testArray1));
      TestUtils.assertTrue(MTypes.isOverOne(testArray2));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isOverOne(testArray0));
    });
  });

  describe('isReadonlyOverOne', () => {
    if (MTypes.isReadonlyOverOne(testReadonlyArray))
      TestUtils.assertTrueType(
        TestUtils.areEqualTypes<typeof testReadonlyArray, MTypes.ReadonlyOverOne<number>>(),
      );

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isReadonlyOverOne(testArray1));
      TestUtils.assertTrue(MTypes.isReadonlyOverOne(testArray2));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isReadonlyOverOne(testArray0));
    });
  });

  describe('isOverTwo', () => {
    if (MTypes.isOverTwo(testArray2))
      TestUtils.assertTrueType(
        TestUtils.areEqualTypes<typeof testArray2, MTypes.OverTwo<number>>(),
      );

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isOverTwo(testArray2));
      TestUtils.assertTrue(MTypes.isOverTwo(testArray3));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isOverTwo(testArray1));
    });
  });

  describe('isReadonlyOverTwo', () => {
    if (MTypes.isReadonlyOverTwo(testReadonlyArray))
      TestUtils.assertTrueType(
        TestUtils.areEqualTypes<typeof testReadonlyArray, MTypes.ReadonlyOverTwo<number>>(),
      );

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isReadonlyOverTwo(testArray2));
      TestUtils.assertTrue(MTypes.isReadonlyOverTwo(testArray3));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isReadonlyOverTwo(testArray0));
    });
  });

  describe('isSingleton', () => {
    if (MTypes.isSingleton(testArray2))
      TestUtils.assertTrueType(
        TestUtils.areEqualTypes<typeof testArray2, MTypes.Singleton<number>>(),
      );

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isSingleton(testArray1));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isSingleton(testArray0));
      TestUtils.assertFalse(MTypes.isSingleton(testArray2));
    });
  });

  describe('isReadonlySingleton', () => {
    if (MTypes.isReadonlySingleton(testReadonlyArray))
      TestUtils.assertTrueType(
        TestUtils.areEqualTypes<typeof testReadonlyArray, MTypes.ReadonlySingleton<number>>(),
      );

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isReadonlySingleton(testArray1));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isReadonlySingleton(testArray0));
      TestUtils.assertFalse(MTypes.isReadonlySingleton(testArray2));
    });
  });

  describe('isPair', () => {
    if (MTypes.isPair(testArray2))
      TestUtils.assertTrueType(
        TestUtils.areEqualTypes<typeof testArray2, MTypes.Pair<number, number>>(),
      );

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isPair(testArray2));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isPair(testArray1));
      TestUtils.assertFalse(MTypes.isPair(testArray3));
    });
  });

  describe('isReadonlyPair', () => {
    if (MTypes.isReadonlyPair(testReadonlyArray))
      TestUtils.assertTrueType(
        TestUtils.areEqualTypes<typeof testReadonlyArray, MTypes.ReadonlyPair<number, number>>(),
      );

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isReadonlyPair(testArray2));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isReadonlyPair(testArray0));
      TestUtils.assertFalse(MTypes.isReadonlyPair(testArray3));
    });
  });

  describe('isIterable', () => {
    if (MTypes.isIterable(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, Iterable<unknown>>());

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isIterable(testArray2));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isIterable(testNumber));
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
    const numberOrUint16Array = new Uint16Array(5) as number | Uint16Array<ArrayBuffer>;
    if (MTypes.isTypedArray(numberOrUint16Array))
      TestUtils.assertTrueType(
        TestUtils.areEqualTypes<typeof numberOrUint16Array, Uint16Array<ArrayBuffer>>(),
      );

    it('Matching', () => {
      TestUtils.assertTrue(MTypes.isTypedArray(new Uint16Array(5)));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MTypes.isTypedArray(5));
    });
  });
});
