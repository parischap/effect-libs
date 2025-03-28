/* eslint-disable functional/no-expression-statements */
import { MTypes } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Number, Predicate, Record } from 'effect';
import { describe, it } from 'vitest';

const unknown = null as unknown;

const testString = 'foo';
const testNumber = 5;
const testBigint = 5n;
const testBoolean = false;
const testSymbol: unique symbol = Symbol.for('testSymbol');
/* eslint-disable-next-line functional/prefer-readonly-type */
const testArray0: Array<number> = [];
const testArray1 = [5];
const testArray2 = [5, 6];
const testArray3 = [5, 6, 7];
const testReadonlyArray = testArray2 as ReadonlyArray<number>;
const testRecord = {
	a: 'foo',
	b: false
};
const testOneArgFunction = Number.increment;
const testFunction = (n: number, m?: number) => n + (m !== undefined ? m : 0);

interface TestInterface {
	readonly a: number;
	readonly [testSymbol]: boolean;
	readonly b: string;
	readonly toString: () => string;
}

type TestTuple = readonly [number, boolean, string];
type TestRefinement = typeof MTypes.isString;
type TestOneArgFunction = typeof Number.increment;

/** Tuple */
MTypes.checkNever<
	MTypes.Equals<
		MTypes.Tuple<string, 2 | 3>,
		readonly [string, string] | readonly [string, string, string]
	>
>();
MTypes.checkNever<MTypes.Equals<MTypes.Tuple<string, number>, ReadonlyArray<string>>>();

/** IntRange */
MTypes.checkNever<MTypes.Equals<MTypes.IntRange<3, 6>, 3 | 4 | 5>>();

MTypes.checkNever<MTypes.Equals<MTypes.ReadonlyTail<TestTuple>, readonly [boolean, string]>>();

/** MapToReadonlyTarget */
MTypes.checkNever<
	MTypes.Equals<MTypes.MapToReadonlyTarget<TestTuple, string>, readonly [string, string, string]>
>();
MTypes.checkNever<
	MTypes.Equals<MTypes.MapToReadonlyTarget<ReadonlyArray<number>, string>, ReadonlyArray<string>>
>();
MTypes.checkNever<
	MTypes.Equals<
		MTypes.MapToReadonlyTarget<TestInterface, string>,
		{
			readonly a: string;
			readonly [testSymbol]: string;
			readonly b: string;
			readonly toString: string;
		}
	>
>();
MTypes.checkNever<
	MTypes.Equals<
		MTypes.MapToReadonlyTarget<Record.ReadonlyRecord<string, number>, string>,
		Record.ReadonlyRecord<string, string>
	>
>();

/** Data and Proto */
MTypes.checkNever<
	MTypes.Equals<
		MTypes.Data<TestInterface>,
		{
			readonly a: number;
			readonly b: string;
		}
	>
>();
MTypes.checkNever<
	MTypes.Equals<
		MTypes.Data<TestInterface, 'a'>,
		{
			readonly b: string;
		}
	>
>();
MTypes.checkNever<MTypes.Equals<MTypes.Proto<TestInterface, 'a'>, Omit<TestInterface, 'b'>>>();

/** SetArgTypeTo */
MTypes.checkNever<
	MTypes.Equals<
		MTypes.SetArgTypeTo<TestRefinement, MTypes.Primitive>,
		Predicate.Refinement<MTypes.Primitive, string>
	>
>();
MTypes.checkNever<
	MTypes.Equals<
		MTypes.SetArgTypeTo<TestOneArgFunction, string>,
		MTypes.OneArgFunction<string, number>
	>
>();
MTypes.checkNever<MTypes.Equals<MTypes.SetArgTypeTo<number, string>, number>>();

/** ToKeyIntersection */
MTypes.checkNever<MTypes.Equals<MTypes.ToKeyIntersection<readonly [5, 6]>, 5 & 6>>();

/** IntersectAndSimplify */
MTypes.checkNever<MTypes.Equals<MTypes.IntersectAndSimplify<number, 5>, 5>>();

describe('MTypes', () => {
	describe('isString', () => {
		if (MTypes.isString(unknown)) MTypes.checkNever<MTypes.Equals<typeof unknown, string>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isString(testString));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isString(testNumber));
		});
	});

	describe('isNumber', () => {
		if (MTypes.isNumber(unknown)) MTypes.checkNever<MTypes.Equals<typeof unknown, number>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isNumber(testNumber));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isNumber(testString));
		});
	});

	describe('isBigInt', () => {
		if (MTypes.isBigInt(unknown)) MTypes.checkNever<MTypes.Equals<typeof unknown, bigint>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isBigInt(testBigint));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isBigInt(testNumber));
		});
	});

	describe('isBoolean', () => {
		if (MTypes.isBoolean(unknown)) MTypes.checkNever<MTypes.Equals<typeof unknown, boolean>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isBoolean(testBoolean));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isBoolean(testNumber));
		});
	});

	describe('isSymbol', () => {
		if (MTypes.isSymbol(unknown)) MTypes.checkNever<MTypes.Equals<typeof unknown, symbol>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isSymbol(testSymbol));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isSymbol(testNumber));
		});
	});

	describe('isUndefined', () => {
		if (MTypes.isUndefined(unknown)) MTypes.checkNever<MTypes.Equals<typeof unknown, undefined>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isUndefined(undefined));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isUndefined(testNumber));
		});
	});

	describe('isNotUndefined', () => {
		const undefinedOrNumber = undefined as undefined | number;
		if (MTypes.isNotUndefined(undefinedOrNumber))
			MTypes.checkNever<MTypes.Equals<typeof undefinedOrNumber, number>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isNotUndefined(testNumber));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isNotUndefined(undefined));
		});
	});

	describe('isNull', () => {
		if (MTypes.isNull(unknown)) MTypes.checkNever<MTypes.Equals<typeof unknown, null>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isNull(null));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isNull(testNumber));
		});
	});

	describe('isNotNull', () => {
		const nullOrNumber = null as null | number;
		if (MTypes.isNotNull(nullOrNumber))
			MTypes.checkNever<MTypes.Equals<typeof nullOrNumber, number>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isNotNull(testNumber));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isNotNull(null));
		});
	});

	describe('isNullable', () => {
		const nullOrNumber = null as null | number;
		if (MTypes.isNullable(nullOrNumber))
			MTypes.checkNever<MTypes.Equals<typeof nullOrNumber, null>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isNullable(null));
			TEUtils.assertTrue(MTypes.isNullable(undefined));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isNullable(testNumber));
		});
	});

	describe('isNotNullable', () => {
		const nullOrNumber = null as null | number;
		if (MTypes.isNotNullable(nullOrNumber))
			MTypes.checkNever<MTypes.Equals<typeof nullOrNumber, number>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isNotNullable(testNumber));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isNotNullable(null));
		});
	});

	describe('isPrimitive', () => {
		const numberOrArray = [3] as unknown as number | ReadonlyArray<number>;
		if (MTypes.isPrimitive(numberOrArray))
			MTypes.checkNever<MTypes.Equals<typeof numberOrArray, number>>();

		if (MTypes.isPrimitive(unknown))
			MTypes.checkNever<MTypes.Equals<typeof unknown, MTypes.Primitive>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isPrimitive(testNumber));
			TEUtils.assertTrue(MTypes.isPrimitive(undefined));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isPrimitive(testArray2));
			TEUtils.assertFalse(MTypes.isPrimitive(testOneArgFunction));
		});
	});

	describe('isNonPrimitive', () => {
		const numberOrArray = [3] as unknown as number | ReadonlyArray<number>;
		if (MTypes.isNonPrimitive(numberOrArray))
			MTypes.checkNever<MTypes.Equals<typeof numberOrArray, ReadonlyArray<number>>>();

		if (MTypes.isNonPrimitive(unknown))
			MTypes.checkNever<MTypes.Equals<typeof unknown, MTypes.NonPrimitive>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isNonPrimitive(testArray2));
			TEUtils.assertTrue(MTypes.isNonPrimitive(testOneArgFunction));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isNonPrimitive(testSymbol));
		});
	});

	describe('isFunction', () => {
		if (MTypes.isFunction(unknown))
			MTypes.checkNever<MTypes.Equals<typeof unknown, MTypes.AnyFunction>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isFunction(testFunction));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isFunction(testNumber));
		});
	});

	describe('isOneArgFunction', () => {
		if (MTypes.isFunction(testFunction))
			MTypes.checkNever<MTypes.Equals<typeof testFunction, MTypes.OneArgFunction<number>>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isOneArgFunction(testOneArgFunction));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isOneArgFunction(testFunction));
		});
	});

	describe('isEmptyArray', () => {
		if (MTypes.isEmptyArray(testArray2))
			MTypes.checkNever<MTypes.Equals<typeof testArray2, MTypes.EmptyArray>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isEmptyArray(testArray0));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isEmptyArray(testArray3));
		});
	});

	describe('isEmptyReadonlyArray', () => {
		if (MTypes.isEmptyReadonlyArray(testReadonlyArray))
			MTypes.checkNever<MTypes.Equals<typeof testReadonlyArray, MTypes.EmptyReadonlyArray>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isEmptyReadonlyArray(testArray0));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isEmptyReadonlyArray(testArray3));
		});
	});

	describe('isOverOne', () => {
		if (MTypes.isOverOne(testArray2))
			MTypes.checkNever<MTypes.Equals<typeof testArray2, MTypes.OverOne<number>>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isOverOne(testArray1));
			TEUtils.assertTrue(MTypes.isOverOne(testArray2));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isOverOne(testArray0));
		});
	});

	describe('isReadonlyOverOne', () => {
		if (MTypes.isReadonlyOverOne(testReadonlyArray))
			MTypes.checkNever<MTypes.Equals<typeof testReadonlyArray, MTypes.ReadonlyOverOne<number>>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isReadonlyOverOne(testArray1));
			TEUtils.assertTrue(MTypes.isReadonlyOverOne(testArray2));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isReadonlyOverOne(testArray0));
		});
	});

	describe('isOverTwo', () => {
		if (MTypes.isOverTwo(testArray2))
			MTypes.checkNever<MTypes.Equals<typeof testArray2, MTypes.OverTwo<number>>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isOverTwo(testArray2));
			TEUtils.assertTrue(MTypes.isOverTwo(testArray3));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isOverTwo(testArray1));
		});
	});

	describe('isReadonlyOverTwo', () => {
		if (MTypes.isReadonlyOverTwo(testReadonlyArray))
			MTypes.checkNever<MTypes.Equals<typeof testReadonlyArray, MTypes.ReadonlyOverTwo<number>>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isReadonlyOverTwo(testArray2));
			TEUtils.assertTrue(MTypes.isReadonlyOverTwo(testArray3));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isReadonlyOverTwo(testArray0));
		});
	});

	describe('isSingleton', () => {
		if (MTypes.isSingleton(testArray2))
			MTypes.checkNever<MTypes.Equals<typeof testArray2, MTypes.Singleton<number>>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isSingleton(testArray1));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isSingleton(testArray0));
			TEUtils.assertFalse(MTypes.isSingleton(testArray2));
		});
	});

	describe('isReadonlySingleton', () => {
		if (MTypes.isReadonlySingleton(testReadonlyArray))
			MTypes.checkNever<
				MTypes.Equals<typeof testReadonlyArray, MTypes.ReadonlySingleton<number>>
			>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isReadonlySingleton(testArray1));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isReadonlySingleton(testArray0));
			TEUtils.assertFalse(MTypes.isReadonlySingleton(testArray2));
		});
	});

	describe('isPair', () => {
		if (MTypes.isPair(testArray2))
			MTypes.checkNever<MTypes.Equals<typeof testArray2, MTypes.Pair<number, number>>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isPair(testArray2));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isPair(testArray1));
			TEUtils.assertFalse(MTypes.isPair(testArray3));
		});
	});

	describe('isReadonlyPair', () => {
		if (MTypes.isReadonlyPair(testReadonlyArray))
			MTypes.checkNever<
				MTypes.Equals<typeof testReadonlyArray, MTypes.ReadonlyPair<number, number>>
			>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isReadonlyPair(testArray2));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isReadonlyPair(testArray0));
			TEUtils.assertFalse(MTypes.isReadonlyPair(testArray3));
		});
	});

	describe('isIterable', () => {
		if (MTypes.isIterable(unknown))
			MTypes.checkNever<MTypes.Equals<typeof unknown, Iterable<unknown>>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isIterable(testArray2));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isIterable(testNumber));
			TEUtils.assertFalse(MTypes.isIterable(testString));
		});
	});

	describe('isErrorish', () => {
		if (MTypes.isErrorish(unknown))
			MTypes.checkNever<MTypes.Equals<typeof unknown, MTypes.Errorish>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isErrorish({ message: 'foo' }));
			TEUtils.assertTrue(MTypes.isErrorish({ message: 'foo', stack: 'bar' }));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isErrorish(null));
			TEUtils.assertFalse(MTypes.isErrorish({ message: false }));
			TEUtils.assertFalse(MTypes.isErrorish({ message: 'foo', stack: 5 }));
			TEUtils.assertFalse(MTypes.isErrorish(testRecord));
		});
	});

	describe('typedArrayName', () => {
		it('Matching', () => {
			TEUtils.assertSome(MTypes.typedArrayName(new Uint8Array(5)), 'Uint8Array');
		});

		it('Non matching', () => {
			TEUtils.assertNone(MTypes.typedArrayName(5));
		});
	});

	describe('isTypedArray', () => {
		const numberOrUint16Array = new Uint16Array(5) as number | Uint16Array<ArrayBuffer>;
		if (MTypes.isTypedArray(numberOrUint16Array))
			MTypes.checkNever<MTypes.Equals<typeof numberOrUint16Array, Uint16Array<ArrayBuffer>>>();

		it('Matching', () => {
			TEUtils.assertTrue(MTypes.isTypedArray(new Uint16Array(5)));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(MTypes.isTypedArray(5));
		});
	});

	describe('Category', () => {
		describe('fromValue and predicates', () => {
			it('Matching', () => {
				TEUtils.assertTrue(MTypes.Category.isString(MTypes.Category.fromValue(testString)));
				TEUtils.assertTrue(MTypes.Category.isNumber(MTypes.Category.fromValue(testNumber)));
				TEUtils.assertTrue(MTypes.Category.isBigint(MTypes.Category.fromValue(testBigint)));
				TEUtils.assertTrue(MTypes.Category.isBoolean(MTypes.Category.fromValue(testBoolean)));
				TEUtils.assertTrue(MTypes.Category.isSymbol(MTypes.Category.fromValue(testSymbol)));
				TEUtils.assertTrue(MTypes.Category.isUndefined(MTypes.Category.fromValue(undefined)));
				TEUtils.assertTrue(MTypes.Category.isNull(MTypes.Category.fromValue(null)));
				TEUtils.assertTrue(MTypes.Category.isFunction(MTypes.Category.fromValue(testFunction)));
				TEUtils.assertTrue(MTypes.Category.isArray(MTypes.Category.fromValue(testArray2)));
				TEUtils.assertTrue(MTypes.Category.isRecord(MTypes.Category.fromValue(testRecord)));
				TEUtils.assertTrue(MTypes.Category.isPrimitive(MTypes.Category.fromValue(testString)));
				TEUtils.assertTrue(MTypes.Category.isNonPrimitive(MTypes.Category.fromValue(testArray2)));
			});

			it('Non matching', () => {
				TEUtils.assertFalse(MTypes.Category.isString(MTypes.Category.fromValue(testNumber)));
				TEUtils.assertFalse(MTypes.Category.isNumber(MTypes.Category.fromValue(testString)));
				TEUtils.assertFalse(MTypes.Category.isBigint(MTypes.Category.fromValue(testNumber)));
				TEUtils.assertFalse(MTypes.Category.isBoolean(MTypes.Category.fromValue(testNumber)));
				TEUtils.assertFalse(MTypes.Category.isSymbol(MTypes.Category.fromValue(testNumber)));
				TEUtils.assertFalse(MTypes.Category.isUndefined(MTypes.Category.fromValue(testNumber)));
				TEUtils.assertFalse(MTypes.Category.isNull(MTypes.Category.fromValue(testNumber)));
				TEUtils.assertFalse(MTypes.Category.isFunction(MTypes.Category.fromValue(testNumber)));
				TEUtils.assertFalse(MTypes.Category.isArray(MTypes.Category.fromValue(testNumber)));
				TEUtils.assertFalse(MTypes.Category.isRecord(MTypes.Category.fromValue(testNumber)));
				TEUtils.assertFalse(MTypes.Category.isPrimitive(MTypes.Category.fromValue(testArray2)));
				TEUtils.assertFalse(MTypes.Category.isNonPrimitive(MTypes.Category.fromValue(testNumber)));
			});
		});
	});
});
