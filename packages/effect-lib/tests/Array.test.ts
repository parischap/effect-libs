/* eslint-disable functional/no-expression-statements */
import { MArray, MFunction } from '@parischap/effect-lib';
import { Array, Equal, Number, Option, pipe, Record, Tuple } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MArray', () => {
	describe('hasDuplicatesWith', () => {
		it('With no duplicates', () => {
			expect(pipe(Array.make(1, 2, 3), MArray.hasDuplicatesWith(Number.Equivalence))).toBe(false);
		});

		it('With duplicates', () => {
			expect(pipe(Array.make(1, 2, 3, 2), MArray.hasDuplicatesWith(Number.Equivalence))).toBe(true);
		});
	});

	describe('hasDuplicates', () => {
		it('With no duplicates', () => {
			expect(pipe(Array.make(1, 2, 3), MArray.hasDuplicates)).toBe(false);
		});

		it('With duplicates', () => {
			expect(pipe(Array.make(1, 2, 3, 2), MArray.hasDuplicates)).toBe(true);
		});
	});

	describe('match012', () => {
		it('Empty array', () => {
			expect(
				pipe(
					Array.empty<number>(),
					MArray.match012({
						onEmpty: () => 'Empty array',
						onSingleton: () => 'Singleton',
						onOverTwo: () => 'OverTwo'
					})
				)
			).toBe('Empty array');
		});
		it('Empty array', () => {
			expect(
				pipe(
					Array.of(1),
					MArray.match012({
						onEmpty: () => 'Empty array',
						onSingleton: () => 'Singleton',
						onOverTwo: () => 'OverTwo'
					})
				)
			).toBe('Singleton');
		});
		it('Empty array', () => {
			expect(
				pipe(
					Array.make(1, 2, 3),
					MArray.match012({
						onEmpty: () => 'Empty array',
						onSingleton: () => 'Singleton',
						onOverTwo: () => 'OverTwo'
					})
				)
			).toBe('OverTwo');
		});
	});

	describe('findAll', () => {
		it('Empty array', () => {
			expect(
				pipe(Array.empty<number>(), MArray.findAll(MFunction.strictEquals(3)), Array.isEmptyArray)
			).toBe(true);
		});
		it('Non empty array', () => {
			expect(pipe(Array.make(3, 2, 5, 3, 8, 3), MArray.findAll(MFunction.strictEquals(3)))).toEqual(
				[0, 3, 5]
			);
		});
	});

	describe('takeBut', () => {
		it('Empty array', () => {
			expect(pipe(Array.empty<number>(), MArray.takeBut(2), Array.isEmptyArray)).toBe(true);
		});
		it('Non empty array', () => {
			expect(pipe(Array.make(3, 2, 5, 3, 8, 3), MArray.takeBut(2))).toEqual([3, 2, 5, 3]);
		});
	});

	describe('takeRightBut', () => {
		it('Empty array', () => {
			expect(pipe(Array.empty<number>(), MArray.takeRightBut(2), Array.isEmptyArray)).toBe(true);
		});
		it('Non empty array', () => {
			expect(pipe(Array.make(3, 2, 5, 3, 8, 3), MArray.takeRightBut(2))).toEqual([5, 3, 8, 3]);
		});
	});

	describe('getFromEnd', () => {
		it('Empty array', () => {
			expect(pipe(Array.empty<number>(), MArray.getFromEnd(2), Option.isNone)).toBe(true);
		});
		it('Non empty array', () => {
			expect(pipe(Array.make(1, 2, 3), MArray.getFromEnd(2), Equal.equals(Option.some(1)))).toBe(
				true
			);
		});
	});

	describe('longestCommonSubArray', () => {
		it('Empty array', () => {
			expect(
				pipe(
					Array.empty<number>(),
					MArray.longestCommonSubArray(Array.make(1, 2, 3)),
					Array.isEmptyArray
				)
			).toBe(true);
		});
		it('Non empty array', () => {
			expect(
				pipe(Array.make(1, 2, 3, 4, 5), MArray.longestCommonSubArray(Array.make(1, 2, 3)))
			).toEqual([1, 2, 3]);
		});
	});

	describe('extractFirst', () => {
		it('Empty array', () => {
			const [extracted, remaining] = pipe(
				Array.empty<Option.Option<number>>(),
				MArray.extractFirst(Option.isSome)
			);
			expect(pipe(extracted, Option.isNone)).toBe(true);
			expect(pipe(remaining, Array.isEmptyArray)).toBe(true);
		});
		it('Non empty array', () => {
			const [extracted, remaining] = pipe(
				Array.make(Option.none(), Option.some(3), Option.some(4), Option.none()),
				MArray.extractFirst(Option.isSome)
			);
			expect(pipe(extracted, Equal.equals(Option.some(Option.some(3))))).toBe(true);
			expect(remaining).toEqual([Option.none(), Option.some(4), Option.none()]);
		});
	});

	describe('ungroup', () => {
		it('Empty array', () => {
			expect(pipe(Array.empty<ReadonlyArray<number>>(), MArray.ungroup, Array.isEmptyArray)).toBe(
				true
			);
		});
		it('Non empty array', () => {
			expect(
				pipe(
					[
						[1, 2, 3],
						[1, 2, 3]
					],
					MArray.ungroup
				)
			).toEqual([
				[0, 1],
				[0, 2],
				[0, 3],
				[1, 1],
				[1, 2],
				[1, 3]
			]);
		});
	});

	describe('groupByNum', () => {
		it('With indexes within bounds', () => {
			const foo: ReadonlyArray<readonly [number, number]> = [
				[0, 1],
				[0, 2],
				[0, 3],
				[1, 1],
				[1, 2],
				[1, 3]
			];
			expect(
				pipe(foo, MArray.groupByNum({ size: 2, fKey: Tuple.getFirst, fValue: Tuple.getSecond }))
			).toEqual([
				[1, 2, 3],
				[1, 2, 3]
			]);
		});
		it('With indexes out of bounds', () => {
			const foo: ReadonlyArray<readonly [number, number]> = [
				[0, 1],
				[0, 2],
				[0, 3],
				[2, 1],
				[2, 2],
				[2, 3]
			];
			expect(
				pipe(foo, MArray.groupByNum({ size: 2, fKey: Tuple.getFirst, fValue: Tuple.getSecond }))
			).toEqual([[1, 2, 3], []]);
		});
	});

	describe('groupBy', () => {
		it('Empty array', () => {
			expect(
				pipe(
					Array.empty<readonly [string, number]>(),
					MArray.groupBy({ fKey: Tuple.getFirst, fValue: Tuple.getSecond }),
					Record.isEmptyRecord
				)
			).toBe(true);
		});
		it('With indexes out of bounds', () => {
			const foo: ReadonlyArray<readonly [string, number]> = [
				['a', 1],
				['b', 2],
				['a', 3],
				['b', 1],
				['a', 2],
				['b', 3]
			];
			expect(pipe(foo, MArray.groupBy({ fKey: Tuple.getFirst, fValue: Tuple.getSecond }))).toEqual({
				a: [1, 3, 2],
				b: [2, 1, 3]
			});
		});
	});

	describe('modifyInit', () => {
		it('One element', () => {
			expect(pipe(Array.of(1), MArray.modifyInit(Number.sum(1)))).toEqual([1]);
		});
		it('More than one element', () => {
			expect(pipe(Array.make(1, 2, 3), MArray.modifyInit(Number.sum(1)))).toEqual([2, 3, 3]);
		});
	});

	describe('modifyTail', () => {
		it('One element', () => {
			expect(pipe(Array.of(1), MArray.modifyTail(Number.sum(1)))).toEqual([1]);
		});
		it('More than one element', () => {
			expect(pipe(Array.make(1, 2, 3), MArray.modifyTail(Number.sum(1)))).toEqual([1, 3, 4]);
		});
	});

	describe('modifyHead', () => {
		it('Empty array', () => {
			expect(
				pipe(Array.empty<number>(), MArray.modifyHead(Number.sum(1)), Array.isEmptyArray)
			).toBe(true);
		});
		it('Non empty array', () => {
			expect(pipe(Array.make(1, 2, 3), MArray.modifyHead(Number.sum(1)))).toEqual([2, 2, 3]);
		});
	});

	describe('modifyLast', () => {
		it('Empty array', () => {
			expect(
				pipe(Array.empty<number>(), MArray.modifyLast(Number.sum(1)), Array.isEmptyArray)
			).toBe(true);
		});
		it('Non empty array', () => {
			expect(pipe(Array.make(1, 2, 3), MArray.modifyLast(Number.sum(1)))).toEqual([1, 2, 4]);
		});
	});
});
