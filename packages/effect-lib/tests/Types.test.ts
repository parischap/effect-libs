/* eslint-disable functional/no-expression-statements */
import { MTypes } from '@parischap/effect-lib';
import { Number, Option, pipe, Predicate, Record, String } from 'effect';
import { describe, expect, it } from 'vitest';

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
			expect(MTypes.isString(testString)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isString(testNumber)).toBe(false);
		});
	});

	describe('isNumber', () => {
		if (MTypes.isNumber(unknown)) MTypes.checkNever<MTypes.Equals<typeof unknown, number>>();

		it('Matching', () => {
			expect(MTypes.isNumber(testNumber)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isNumber(testString)).toBe(false);
		});
	});

	describe('isBigInt', () => {
		if (MTypes.isBigInt(unknown)) MTypes.checkNever<MTypes.Equals<typeof unknown, bigint>>();

		it('Matching', () => {
			expect(MTypes.isBigInt(testBigint)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isBigInt(testNumber)).toBe(false);
		});
	});

	describe('isBigInt', () => {
		if (MTypes.isBigInt(unknown)) MTypes.checkNever<MTypes.Equals<typeof unknown, bigint>>();

		it('Matching', () => {
			expect(MTypes.isBigInt(testBigint)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isBigInt(testNumber)).toBe(false);
		});
	});

	describe('isBoolean', () => {
		if (MTypes.isBoolean(unknown)) MTypes.checkNever<MTypes.Equals<typeof unknown, boolean>>();

		it('Matching', () => {
			expect(MTypes.isBoolean(testBoolean)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isBoolean(testNumber)).toBe(false);
		});
	});

	describe('isSymbol', () => {
		if (MTypes.isSymbol(unknown)) MTypes.checkNever<MTypes.Equals<typeof unknown, symbol>>();

		it('Matching', () => {
			expect(MTypes.isSymbol(testSymbol)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isSymbol(testNumber)).toBe(false);
		});
	});

	describe('isUndefined', () => {
		if (MTypes.isUndefined(unknown)) MTypes.checkNever<MTypes.Equals<typeof unknown, undefined>>();

		it('Matching', () => {
			expect(MTypes.isUndefined(undefined)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isUndefined(testNumber)).toBe(false);
		});
	});

	describe('isNotUndefined', () => {
		const undefinedOrNumber = undefined as undefined | number;
		if (MTypes.isNotUndefined(undefinedOrNumber))
			MTypes.checkNever<MTypes.Equals<typeof undefinedOrNumber, number>>();

		it('Matching', () => {
			expect(MTypes.isNotUndefined(testNumber)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isNotUndefined(undefined)).toBe(false);
		});
	});

	describe('isNull', () => {
		if (MTypes.isNull(unknown)) MTypes.checkNever<MTypes.Equals<typeof unknown, null>>();

		it('Matching', () => {
			expect(MTypes.isNull(null)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isNull(testNumber)).toBe(false);
		});
	});

	describe('isNotNull', () => {
		const nullOrNumber = null as null | number;
		if (MTypes.isNotNull(nullOrNumber))
			MTypes.checkNever<MTypes.Equals<typeof nullOrNumber, number>>();

		it('Matching', () => {
			expect(MTypes.isNotNull(testNumber)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isNotNull(null)).toBe(false);
		});
	});

	describe('isNullable', () => {
		const nullOrNumber = null as null | number;
		if (MTypes.isNullable(nullOrNumber))
			MTypes.checkNever<MTypes.Equals<typeof nullOrNumber, null>>();

		it('Matching', () => {
			expect(MTypes.isNullable(null)).toBe(true);
			expect(MTypes.isNullable(undefined)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isNullable(testNumber)).toBe(false);
		});
	});

	describe('isNotNullable', () => {
		const nullOrNumber = null as null | number;
		if (MTypes.isNotNullable(nullOrNumber))
			MTypes.checkNever<MTypes.Equals<typeof nullOrNumber, number>>();

		it('Matching', () => {
			expect(MTypes.isNotNullable(testNumber)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isNotNullable(null)).toBe(false);
		});
	});

	describe('isPrimitive', () => {
		const numberOrArray = [3] as unknown as number | ReadonlyArray<number>;
		if (MTypes.isPrimitive(numberOrArray))
			MTypes.checkNever<MTypes.Equals<typeof numberOrArray, number>>();

		if (MTypes.isPrimitive(unknown))
			MTypes.checkNever<MTypes.Equals<typeof unknown, MTypes.Primitive>>();

		it('Matching', () => {
			expect(MTypes.isPrimitive(testNumber)).toBe(true);
			expect(MTypes.isPrimitive(undefined)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isPrimitive(testArray2)).toBe(false);
			expect(MTypes.isPrimitive(testOneArgFunction)).toBe(false);
		});
	});

	describe('isNonPrimitive', () => {
		const numberOrArray = [3] as unknown as number | ReadonlyArray<number>;
		if (MTypes.isNonPrimitive(numberOrArray))
			MTypes.checkNever<MTypes.Equals<typeof numberOrArray, ReadonlyArray<number>>>();

		if (MTypes.isNonPrimitive(unknown))
			MTypes.checkNever<MTypes.Equals<typeof unknown, MTypes.NonPrimitive>>();

		it('Matching', () => {
			expect(MTypes.isNonPrimitive(testArray2)).toBe(true);
			expect(MTypes.isNonPrimitive(testOneArgFunction)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isNonPrimitive(testSymbol)).toBe(false);
		});
	});

	describe('isFunction', () => {
		if (MTypes.isFunction(unknown))
			MTypes.checkNever<MTypes.Equals<typeof unknown, MTypes.AnyFunction>>();

		it('Matching', () => {
			expect(MTypes.isFunction(testFunction)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isFunction(testNumber)).toBe(false);
		});
	});

	describe('isOneArgFunction', () => {
		if (MTypes.isFunction(testFunction))
			MTypes.checkNever<MTypes.Equals<typeof testFunction, MTypes.OneArgFunction<number>>>();

		it('Matching', () => {
			expect(MTypes.isOneArgFunction(testOneArgFunction)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isOneArgFunction(testFunction)).toBe(false);
		});
	});

	describe('isEmptyArray', () => {
		if (MTypes.isEmptyArray(testArray2))
			MTypes.checkNever<MTypes.Equals<typeof testArray2, MTypes.EmptyArray>>();

		it('Matching', () => {
			expect(MTypes.isEmptyArray(testArray0)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isEmptyArray(testArray3)).toBe(false);
		});
	});

	describe('isEmptyReadonlyArray', () => {
		if (MTypes.isEmptyReadonlyArray(testReadonlyArray))
			MTypes.checkNever<MTypes.Equals<typeof testReadonlyArray, MTypes.EmptyReadonlyArray>>();

		it('Matching', () => {
			expect(MTypes.isEmptyReadonlyArray(testArray0)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isEmptyReadonlyArray(testArray3)).toBe(false);
		});
	});

	describe('isOverOne', () => {
		if (MTypes.isOverOne(testArray2))
			MTypes.checkNever<MTypes.Equals<typeof testArray2, MTypes.OverOne<number>>>();

		it('Matching', () => {
			expect(MTypes.isOverOne(testArray1)).toBe(true);
			expect(MTypes.isOverOne(testArray2)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isOverOne(testArray0)).toBe(false);
		});
	});

	describe('isReadonlyOverOne', () => {
		if (MTypes.isReadonlyOverOne(testReadonlyArray))
			MTypes.checkNever<MTypes.Equals<typeof testReadonlyArray, MTypes.ReadonlyOverOne<number>>>();

		it('Matching', () => {
			expect(MTypes.isReadonlyOverOne(testArray1)).toBe(true);
			expect(MTypes.isReadonlyOverOne(testArray2)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isReadonlyOverOne(testArray0)).toBe(false);
		});
	});

	describe('isOverTwo', () => {
		if (MTypes.isOverTwo(testArray2))
			MTypes.checkNever<MTypes.Equals<typeof testArray2, MTypes.OverTwo<number>>>();

		it('Matching', () => {
			expect(MTypes.isOverTwo(testArray2)).toBe(true);
			expect(MTypes.isOverTwo(testArray3)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isOverTwo(testArray1)).toBe(false);
		});
	});

	describe('isReadonlyOverTwo', () => {
		if (MTypes.isReadonlyOverTwo(testReadonlyArray))
			MTypes.checkNever<MTypes.Equals<typeof testReadonlyArray, MTypes.ReadonlyOverTwo<number>>>();

		it('Matching', () => {
			expect(MTypes.isReadonlyOverTwo(testArray2)).toBe(true);
			expect(MTypes.isReadonlyOverTwo(testArray3)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isReadonlyOverTwo(testArray0)).toBe(false);
		});
	});

	describe('isSingleton', () => {
		if (MTypes.isSingleton(testArray2))
			MTypes.checkNever<MTypes.Equals<typeof testArray2, MTypes.Singleton<number>>>();

		it('Matching', () => {
			expect(MTypes.isSingleton(testArray1)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isSingleton(testArray0)).toBe(false);
			expect(MTypes.isSingleton(testArray2)).toBe(false);
		});
	});

	describe('isReadonlySingleton', () => {
		if (MTypes.isReadonlySingleton(testReadonlyArray))
			MTypes.checkNever<
				MTypes.Equals<typeof testReadonlyArray, MTypes.ReadonlySingleton<number>>
			>();

		it('Matching', () => {
			expect(MTypes.isReadonlySingleton(testArray1)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isReadonlySingleton(testArray0)).toBe(false);
			expect(MTypes.isReadonlySingleton(testArray2)).toBe(false);
		});
	});

	describe('isPair', () => {
		if (MTypes.isPair(testArray2))
			MTypes.checkNever<MTypes.Equals<typeof testArray2, MTypes.Pair<number, number>>>();

		it('Matching', () => {
			expect(MTypes.isPair(testArray2)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isPair(testArray1)).toBe(false);
			expect(MTypes.isPair(testArray3)).toBe(false);
		});
	});

	describe('isReadonlyPair', () => {
		if (MTypes.isReadonlyPair(testReadonlyArray))
			MTypes.checkNever<
				MTypes.Equals<typeof testReadonlyArray, MTypes.ReadonlyPair<number, number>>
			>();

		it('Matching', () => {
			expect(MTypes.isReadonlyPair(testArray2)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isReadonlyPair(testArray0)).toBe(false);
			expect(MTypes.isReadonlyPair(testArray3)).toBe(false);
		});
	});

	describe('isIterable', () => {
		if (MTypes.isIterable(unknown))
			MTypes.checkNever<MTypes.Equals<typeof unknown, Iterable<unknown>>>();

		it('Matching', () => {
			expect(MTypes.isIterable(testArray2)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isIterable(testNumber)).toBe(false);
			expect(MTypes.isIterable(testString)).toBe(false);
		});
	});

	describe('isErrorish', () => {
		if (MTypes.isErrorish(unknown))
			MTypes.checkNever<MTypes.Equals<typeof unknown, MTypes.Errorish>>();

		it('Matching', () => {
			expect(MTypes.isErrorish({ message: 'foo' })).toBe(true);
			expect(MTypes.isErrorish({ message: 'foo', stack: 'bar' })).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isErrorish(null)).toBe(false);
			expect(MTypes.isErrorish({ message: false })).toBe(false);
			expect(MTypes.isErrorish({ message: 'foo', stack: 5 })).toBe(false);
			expect(MTypes.isErrorish(testRecord)).toBe(false);
		});
	});

	describe('typedArrayName', () => {
		const stringOptionEq = Option.getEquivalence(String.Equivalence);
		it('Matching', () => {
			expect(
				stringOptionEq(MTypes.typedArrayName(new Uint8Array(5)), Option.some('Uint8Array'))
			).toBe(true);
		});

		it('Non matching', () => {
			expect(pipe(5, MTypes.typedArrayName, Option.isNone)).toBe(true);
		});
	});

	describe('isTypedArray', () => {
		const numberOrUint16Array = new Uint16Array(5) as number | Uint16Array<ArrayBuffer>;
		if (MTypes.isTypedArray(numberOrUint16Array))
			MTypes.checkNever<MTypes.Equals<typeof numberOrUint16Array, Uint16Array<ArrayBuffer>>>();

		it('Matching', () => {
			expect(MTypes.isTypedArray(new Uint16Array(5))).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isTypedArray(5)).toBe(false);
		});
	});

	describe('Category', () => {
		describe('fromValue and predicates', () => {
			it('Matching', () => {
				expect(MTypes.Category.isString(MTypes.Category.fromValue(testString))).toBe(true);
				expect(MTypes.Category.isNumber(MTypes.Category.fromValue(testNumber))).toBe(true);
				expect(MTypes.Category.isBigint(MTypes.Category.fromValue(testBigint))).toBe(true);
				expect(MTypes.Category.isBoolean(MTypes.Category.fromValue(testBoolean))).toBe(true);
				expect(MTypes.Category.isSymbol(MTypes.Category.fromValue(testSymbol))).toBe(true);
				expect(MTypes.Category.isUndefined(MTypes.Category.fromValue(undefined))).toBe(true);
				expect(MTypes.Category.isNull(MTypes.Category.fromValue(null))).toBe(true);
				expect(MTypes.Category.isFunction(MTypes.Category.fromValue(testFunction))).toBe(true);
				expect(MTypes.Category.isArray(MTypes.Category.fromValue(testArray2))).toBe(true);
				expect(MTypes.Category.isRecord(MTypes.Category.fromValue(testRecord))).toBe(true);
				expect(MTypes.Category.isPrimitive(MTypes.Category.fromValue(testString))).toBe(true);
				expect(MTypes.Category.isNonPrimitive(MTypes.Category.fromValue(testArray2))).toBe(true);
			});

			it('Non matching', () => {
				expect(MTypes.Category.isString(MTypes.Category.fromValue(testNumber))).toBe(false);
				expect(MTypes.Category.isNumber(MTypes.Category.fromValue(testString))).toBe(false);
				expect(MTypes.Category.isBigint(MTypes.Category.fromValue(testNumber))).toBe(false);
				expect(MTypes.Category.isBoolean(MTypes.Category.fromValue(testNumber))).toBe(false);
				expect(MTypes.Category.isSymbol(MTypes.Category.fromValue(testNumber))).toBe(false);
				expect(MTypes.Category.isUndefined(MTypes.Category.fromValue(testNumber))).toBe(false);
				expect(MTypes.Category.isNull(MTypes.Category.fromValue(testNumber))).toBe(false);
				expect(MTypes.Category.isFunction(MTypes.Category.fromValue(testNumber))).toBe(false);
				expect(MTypes.Category.isArray(MTypes.Category.fromValue(testNumber))).toBe(false);
				expect(MTypes.Category.isRecord(MTypes.Category.fromValue(testNumber))).toBe(false);
				expect(MTypes.Category.isPrimitive(MTypes.Category.fromValue(testArray2))).toBe(false);
				expect(MTypes.Category.isNonPrimitive(MTypes.Category.fromValue(testNumber))).toBe(false);
			});
		});
	});
});
