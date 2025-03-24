/* eslint-disable functional/no-expression-statements */
import { MArray, MFunction, MTuple } from '@parischap/effect-lib';
import {
	Array,
	Equal,
	flow,
	Function,
	Hash,
	Number,
	Option,
	Order,
	pipe,
	Predicate,
	Record,
	Struct,
	Tuple
} from 'effect';
import { describe, expect, it } from 'vitest';

describe('MArray', () => {
	describe('hasLength', () => {
		it('Simple Array', () => {
			expect(pipe(Array.make(1, 2, 3), MArray.hasLength(3))).toBe(true);
		});
	});

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
			expect(
				pipe(Array.make(3, 2, 5, 3, 8, 3), MArray.findAll(MFunction.strictEquals(3)))
			).toStrictEqual([0, 3, 5]);
		});
	});

	describe('takeBut', () => {
		it('Empty array', () => {
			expect(pipe(Array.empty<number>(), MArray.takeBut(2), Array.isEmptyArray)).toBe(true);
		});
		it('Non empty array', () => {
			expect(pipe(Array.make(3, 2, 5, 3, 8, 3), MArray.takeBut(2))).toStrictEqual([3, 2, 5, 3]);
		});
	});

	describe('takeRightBut', () => {
		it('Empty array', () => {
			expect(pipe(Array.empty<number>(), MArray.takeRightBut(2), Array.isEmptyArray)).toBe(true);
		});
		it('Non empty array', () => {
			expect(pipe(Array.make(3, 2, 5, 3, 8, 3), MArray.takeRightBut(2))).toStrictEqual([
				5, 3, 8, 3
			]);
		});
	});

	describe('getFromEnd', () => {
		it('Empty array', () => {
			expect(pipe(Array.empty<number>(), MArray.getFromEnd(2), Option.isNone)).toBe(true);
		});
		it('Non empty array', () => {
			expect(
				Option.getEquivalence(Number.Equivalence)(
					pipe(Array.make(1, 2, 3), MArray.getFromEnd(2)),
					Option.some(1)
				)
			).toBe(true);
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
			).toStrictEqual([1, 2, 3]);
		});
	});

	describe('extractFirst', () => {
		const tupleEq = Tuple.getEquivalence(
			Option.getEquivalence(Number.Equivalence),
			Array.getEquivalence(Number.Equivalence)
		);
		it('Empty array', () => {
			expect(
				tupleEq(
					pipe(Array.empty<number>(), MArray.extractFirst(MFunction.strictEquals(3))),
					Tuple.make(Option.none(), Array.empty())
				)
			).toBe(true);
		});
		it('Non empty array', () => {
			expect(
				tupleEq(
					pipe(Array.make(1, 2, 3, 4, 5), MArray.extractFirst(MFunction.strictEquals(3))),
					Tuple.make(Option.some(3), Array.make(1, 2, 4, 5))
				)
			).toBe(true);
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
			).toStrictEqual([
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
			).toStrictEqual([
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
			).toStrictEqual([[1, 2, 3], []]);
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
			expect(
				pipe(foo, MArray.groupBy({ fKey: Tuple.getFirst, fValue: Tuple.getSecond }))
			).toStrictEqual({
				a: [1, 3, 2],
				b: [2, 1, 3]
			});
		});
	});

	describe('modifyInit', () => {
		it('One element', () => {
			expect(pipe(Array.of(1), MArray.modifyInit(Number.sum(1)))).toStrictEqual([1]);
		});
		it('More than one element', () => {
			expect(pipe(Array.make(1, 2, 3), MArray.modifyInit(Number.sum(1)))).toStrictEqual([2, 3, 3]);
		});
	});

	describe('modifyTail', () => {
		it('One element', () => {
			expect(pipe(Array.of(1), MArray.modifyTail(Number.sum(1)))).toStrictEqual([1]);
		});
		it('More than one element', () => {
			expect(pipe(Array.make(1, 2, 3), MArray.modifyTail(Number.sum(1)))).toStrictEqual([1, 3, 4]);
		});
	});

	describe('modifyHead', () => {
		it('Empty array', () => {
			expect(
				pipe(Array.empty<number>(), MArray.modifyHead(Number.sum(1)), Array.isEmptyArray)
			).toBe(true);
		});
		it('Non empty array', () => {
			expect(pipe(Array.make(1, 2, 3), MArray.modifyHead(Number.sum(1)))).toStrictEqual([2, 2, 3]);
		});
	});

	describe('modifyLast', () => {
		it('Empty array', () => {
			expect(
				pipe(Array.empty<number>(), MArray.modifyLast(Number.sum(1)), Array.isEmptyArray)
			).toBe(true);
		});
		it('Non empty array', () => {
			expect(pipe(Array.make(1, 2, 3), MArray.modifyLast(Number.sum(1)))).toStrictEqual([1, 2, 4]);
		});
	});

	describe('unfold', () => {
		it('Without cycle', () => {
			expect(
				pipe(
					0,
					MArray.unfold<number, number>(
						flow(
							MTuple.makeBothBy({ toFirst: Function.identity, toSecond: Number.increment }),
							Option.liftPredicate(Predicate.tuple(Number.lessThanOrEqualTo(3), Function.constTrue))
						)
					)
				)
			).toStrictEqual([0, 1, 2, 3]);
		});

		it('With cycle', () => {
			const cyclical = flow(
				Option.liftPredicate(Number.lessThanOrEqualTo(2)),
				Option.map(Number.increment),
				Option.getOrElse(() => 0)
			);
			expect(
				pipe(
					0,
					MArray.unfold((b, isCyclical) =>
						isCyclical ?
							Option.none()
						:	pipe(
								b,
								MTuple.makeBothBy({ toFirst: Function.identity, toSecond: cyclical }),
								Option.some
							)
					)
				)
			).toStrictEqual([0, 1, 2, 3]);
		});
	});

	it('unfoldNonEmpty', () => {
		expect(
			pipe(
				0,
				MArray.unfoldNonEmpty(
					flow(
						MTuple.makeBothBy({
							toFirst: Function.identity,
							toSecond: flow(Number.increment, Option.liftPredicate(Number.lessThanOrEqualTo(3)))
						})
					)
				)
			)
		).toStrictEqual([0, 1, 2, 3]);
	});

	describe('splitAtFromRight', () => {
		it('Empty array', () => {
			expect(pipe(Array.empty(), MArray.splitAtFromRight(3))).toStrictEqual([[], []]);
		});

		it('Any array with n within bounds', () => {
			expect(pipe(Array.make(1, 2, 3), MArray.splitAtFromRight(2))).toStrictEqual([[1], [2, 3]]);
		});

		it('Any array with n beyond bounds', () => {
			expect(pipe(Array.make(1, 2, 3), MArray.splitAtFromRight(5))).toStrictEqual([[], [1, 2, 3]]);
		});
	});

	describe('firstSomeResult', () => {
		const f = Option.liftPredicate(Number.greaterThanOrEqualTo(3));
		it('Empty array', () => {
			expect(pipe(Array.empty(), MArray.firstSomeResult(f), Option.isNone)).toBe(true);
		});

		it('Array with matching element', () => {
			expect(
				Equal.equals(pipe(Array.make(1, 2, 3, 4), MArray.firstSomeResult(f)), Option.some(3))
			).toBe(true);
		});

		it('Array with no matching element', () => {
			expect(pipe(Array.make(1, 2, 2, 1), MArray.firstSomeResult(f), Option.isNone)).toBe(true);
		});
	});

	describe('mergeSorted', () => {
		class A implements Equal.Equal {
			constructor(
				readonly key: number,
				readonly value: string
			) {}
			[Equal.symbol](this: A, that: unknown): boolean {
				return that instanceof A && this.key === that.key;
			}
			[Hash.symbol](this: A) {
				return pipe(this.key, Hash.hash, Hash.cached(this));
			}
		}

		const byKey: Order.Order<A> = Order.mapInput(Number.Order, Struct.get('key'));

		const mergeSortedAs = MArray.mergeSorted(byKey);

		it('Empty arrays', () => {
			expect(pipe(Array.empty<A>(), mergeSortedAs(Array.empty<A>()))).toStrictEqual(
				Array.empty<A>()
			);
		});

		it('that finishes first', () => {
			expect(
				pipe(
					Array.make(new A(1, 'self1'), new A(3, 'self3'), new A(5, 'self5')),
					mergeSortedAs(Array.make(new A(2, 'that2'), new A(3, 'that3'), new A(4, 'that4')))
				)
			).toStrictEqual(
				Array.make(
					new A(1, 'self1'),
					new A(2, 'that2'),
					new A(3, 'self3'),
					new A(3, 'that3'),
					new A(4, 'that4'),
					new A(5, 'self5')
				)
			);
		});

		it('self finishes first', () => {
			expect(
				pipe(
					Array.make(new A(1, 'self1'), new A(3, 'self3'), new A(5, 'self5')),
					mergeSortedAs(
						Array.make(
							new A(2, 'that2'),
							new A(3, 'that3'),
							new A(4, 'that4'),
							new A(6, 'that6'),
							new A(7, 'that7')
						)
					)
				)
			).toStrictEqual(
				Array.make(
					new A(1, 'self1'),
					new A(2, 'that2'),
					new A(3, 'self3'),
					new A(3, 'that3'),
					new A(4, 'that4'),
					new A(5, 'self5'),
					new A(6, 'that6'),
					new A(7, 'that7')
				)
			);
		});
	});

	describe('differenceSorted', () => {
		const substractSortedNumbers = MArray.differenceSorted(Number.Order);
		it('Substract non-empty array from empty array', () => {
			expect(
				pipe(Array.empty<number>(), substractSortedNumbers(Array.make(1, 2, 3)))
			).toStrictEqual(Array.empty<number>());
		});

		it('that finishes first', () => {
			expect(
				pipe(Array.make(1, 2, 4, 6, 6, 6, 7, 8), substractSortedNumbers(Array.make(2, 6, 6)))
			).toStrictEqual(Array.make(1, 4, 6, 7, 8));
		});

		it('self finishes first', () => {
			expect(
				pipe(Array.make(1, 2, 4, 6, 6, 7, 8), substractSortedNumbers(Array.make(2, 6, 6, 10)))
			).toStrictEqual(Array.make(1, 4, 7, 8));
		});
	});
});
