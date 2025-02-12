/* eslint-disable functional/no-expression-statements */
import { MTypes } from '@parischap/effect-lib';
import { Number, Predicate, Record } from 'effect';
import { describe, expect, it } from 'vitest';

const unknown = null as unknown;

const testString = 'foo' as string;
const testNumber = 5;
const testBigint = 5n;
const testBoolean = false;
const testArray = [5, 6];
const testReadonlyArray = [5, 6] as ReadonlyArray<number>;
const testSymbol: unique symbol = Symbol.for('testSymbol');

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

		it('Matching', () => {
			expect(MTypes.isPrimitive(testNumber)).toBe(true);
			expect(MTypes.isPrimitive(undefined)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isPrimitive(testArray)).toBe(false);
			expect(MTypes.isPrimitive(testOneArgFunction)).toBe(false);
		});
	});

	describe('isNonPrimitive', () => {
		const numberOrArray = [3] as unknown as number | ReadonlyArray<number>;
		if (MTypes.isNonPrimitive(numberOrArray))
			MTypes.checkNever<MTypes.Equals<typeof numberOrArray, ReadonlyArray<number>>>();

		it('Matching', () => {
			expect(MTypes.isNonPrimitive(testArray)).toBe(true);
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
		if (MTypes.isEmptyArray(testArray))
			MTypes.checkNever<MTypes.Equals<typeof testArray, MTypes.EmptyArray>>();

		it('Matching', () => {
			expect(MTypes.isEmptyArray([])).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isEmptyArray([1, 2, 3])).toBe(false);
		});
	});

	describe('isEmptyReadonlyArray', () => {
		if (MTypes.isEmptyReadonlyArray(testReadonlyArray))
			MTypes.checkNever<MTypes.Equals<typeof testReadonlyArray, MTypes.EmptyReadonlyArray>>();

		it('Matching', () => {
			expect(MTypes.isEmptyReadonlyArray([])).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isEmptyReadonlyArray([1, 2, 3])).toBe(false);
		});
	});

	describe('isOverOne', () => {
		if (MTypes.isOverOne(testArray))
			MTypes.checkNever<MTypes.Equals<typeof testArray, MTypes.OverOne<number>>>();

		it('Matching', () => {
			expect(MTypes.isOverOne([1])).toBe(true);
			expect(MTypes.isOverOne([1, 2])).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isOverOne([])).toBe(false);
		});
	});

	describe('isReadonlyOverOne', () => {
		if (MTypes.isReadonlyOverOne(testReadonlyArray))
			MTypes.checkNever<MTypes.Equals<typeof testReadonlyArray, MTypes.ReadonlyOverOne<number>>>();

		it('Matching', () => {
			expect(MTypes.isReadonlyOverOne([1])).toBe(true);
			expect(MTypes.isReadonlyOverOne([1, 2])).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isReadonlyOverOne([])).toBe(false);
		});
	});

	describe('isOverTwo', () => {
		if (MTypes.isOverTwo(testArray))
			MTypes.checkNever<MTypes.Equals<typeof testArray, MTypes.OverTwo<number>>>();

		it('Matching', () => {
			expect(MTypes.isOverTwo([1, 2])).toBe(true);
			expect(MTypes.isOverTwo([1, 2, 3])).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isOverTwo([1])).toBe(false);
		});
	});

	describe('isReadonlyOverTwo', () => {
		if (MTypes.isReadonlyOverTwo(testReadonlyArray))
			MTypes.checkNever<MTypes.Equals<typeof testReadonlyArray, MTypes.ReadonlyOverTwo<number>>>();

		it('Matching', () => {
			expect(MTypes.isReadonlyOverTwo([1, 2])).toBe(true);
			expect(MTypes.isReadonlyOverTwo([1, 2, 3])).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isReadonlyOverTwo([])).toBe(false);
		});
	});

	describe('isSingleton', () => {
		if (MTypes.isSingleton(testArray))
			MTypes.checkNever<MTypes.Equals<typeof testArray, MTypes.Singleton<number>>>();

		it('Matching', () => {
			expect(MTypes.isSingleton([1])).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isSingleton([])).toBe(false);
			expect(MTypes.isSingleton([1, 2])).toBe(false);
		});
	});

	describe('isReadonlySingleton', () => {
		if (MTypes.isReadonlySingleton(testReadonlyArray))
			MTypes.checkNever<
				MTypes.Equals<typeof testReadonlyArray, MTypes.ReadonlySingleton<number>>
			>();

		it('Matching', () => {
			expect(MTypes.isReadonlySingleton([1])).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isReadonlySingleton([])).toBe(false);
			expect(MTypes.isReadonlySingleton([1, 2])).toBe(false);
		});
	});

	describe('isPair', () => {
		if (MTypes.isPair(testArray))
			MTypes.checkNever<MTypes.Equals<typeof testArray, MTypes.Pair<number, number>>>();

		it('Matching', () => {
			expect(MTypes.isPair([1, 2])).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isPair([1])).toBe(false);
			expect(MTypes.isPair([1, 2, 3])).toBe(false);
		});
	});

	describe('isReadonlyPair', () => {
		if (MTypes.isReadonlyPair(testReadonlyArray))
			MTypes.checkNever<
				MTypes.Equals<typeof testReadonlyArray, MTypes.ReadonlyPair<number, number>>
			>();

		it('Matching', () => {
			expect(MTypes.isReadonlyPair([1, 2])).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isReadonlyPair([])).toBe(false);
			expect(MTypes.isReadonlyPair([1, 2, 3])).toBe(false);
		});
	});

	describe('isIterable', () => {
		if (MTypes.isIterable(unknown))
			MTypes.checkNever<MTypes.Equals<typeof unknown, Iterable<unknown>>>();

		it('Matching', () => {
			//expect(MTypes.isIterable(testString)).toBe(true);
			expect(MTypes.isIterable(testArray)).toBe(true);
		});

		it('Non matching', () => {
			expect(MTypes.isIterable(testNumber)).toBe(false);
		});
	});
});
