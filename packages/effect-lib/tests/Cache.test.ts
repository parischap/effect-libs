/* eslint-disable functional/no-expression-statements */
import { MCache, MTypes } from '@parischap/effect-lib';
import { Array, MutableHashMap, Option, Order, Record, Tuple, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MCache', () => {
	describe('Non-recursive cache with no capacity and no TTL', () => {
		const testCache = MCache.make({
			lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true)
		});

		it('Get three elements: 3,4 and 3', () => {
			const value1 = pipe(testCache, MCache.get(3));
			const value2 = pipe(testCache, MCache.get(4));
			const value3 = pipe(testCache, MCache.get(3));
			expect(value1).toBe(6);
			expect(value2).toBe(8);
			expect(value3).toBe(6);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(2);
			expect(MCache.keysInStore(testCache).toString()).toBe('3,4');
		});
	});

	describe('Non-recursive cache with capacity=3 and no TTL', () => {
		const testCache = MCache.make({
			lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, key !== 8),
			capacity: 3
		});

		it('Get three elements: 3,4 and 3', () => {
			const value1 = pipe(testCache, MCache.get(3));
			const value2 = pipe(testCache, MCache.get(4));
			const value3 = pipe(testCache, MCache.get(3));
			expect(value1).toBe(6);
			expect(value2).toBe(8);
			expect(value3).toBe(6);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(2);
			expect(MCache.keysInStore(testCache).toString()).toBe('3,4');
		});

		it("Get one more element but don't store it:8", () => {
			const value1 = pipe(testCache, MCache.get(8));
			expect(value1).toBe(16);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(2);
			expect(MCache.keysInStore(testCache).toString()).toBe('3,4');
		});

		it('Get four more elements 5, 6, 5 and 7', () => {
			const value1 = pipe(testCache, MCache.get(5));
			const value2 = pipe(testCache, MCache.get(6));
			const value3 = pipe(testCache, MCache.get(5));
			const value4 = pipe(testCache, MCache.get(7));
			expect(value1).toBe(10);
			expect(value2).toBe(12);
			expect(value3).toBe(10);
			expect(value4).toBe(14);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(3);
			expect(MCache.keysInStore(testCache).toString()).toBe('5,6,7');
		});
	});

	// TTL=0 is not the same as no TTL!!!
	describe('Non-recursive cache with capacity=3 and TTL=0', () => {
		let state = 0;
		const testCache = MCache.make<number, number>({
			lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2 + state++, key !== 8),
			capacity: 3,
			lifeSpan: 0
		});

		it('Get four elements: 3,4,5 and 6', () => {
			expect(state).toBe(0);
			const value1 = pipe(testCache, MCache.get(3));
			expect(state).toBe(1);
			const value2 = pipe(testCache, MCache.get(4));
			expect(state).toBe(2);
			const value3 = pipe(testCache, MCache.get(5));
			expect(state).toBe(3);
			const value4 = pipe(testCache, MCache.get(6));
			expect(value1).toBe(6);
			expect(value2).toBe(9);
			expect(value3).toBe(12);
			expect(value4).toBe(15);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(3);
			expect(pipe(testCache, MCache.keysInStore, Array.sort(Order.number))).toEqual([4, 5, 6]);
		});

		it("Get one more element but don't store it: 8", () => {
			expect(state).toBe(4);
			const value1 = pipe(testCache, MCache.get(8));
			expect(value1).toBe(20);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(3);
			expect(pipe(testCache, MCache.keysInStore, Array.sort(Order.number))).toEqual([4, 5, 6]);
		});

		it('Get element again: 5', () => {
			expect(state).toBe(5);
			const value1 = pipe(testCache, MCache.get(5));
			expect(value1).toBe(15);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(2);
			expect(pipe(testCache, MCache.keysInStore, Array.sort(Order.number))).toEqual([5, 6]);
			expect(testCache.keyOrder.toJSON()).toEqual({
				_id: 'MutableQueue',
				values: [6, 5]
			});
		});

		it('Get elements again: 3 and 4', () => {
			expect(state).toBe(6);
			const value1 = pipe(testCache, MCache.get(3));
			expect(state).toBe(7);
			const value2 = pipe(testCache, MCache.get(4));
			expect(value1).toBe(12);
			expect(value2).toBe(15);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(3);
			expect(pipe(testCache, MCache.keysInStore, Array.sort(Order.number))).toEqual([3, 4, 5]);
		});

		it('Get element again: 4', () => {
			expect(state).toBe(8);
			const value1 = pipe(testCache, MCache.get(4));
			expect(value1).toBe(16);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(1);
			expect(pipe(testCache, MCache.keysInStore)).toEqual([4]);
			expect(testCache.keyOrder.toJSON()).toEqual({
				_id: 'MutableQueue',
				values: [4]
			});
		});
	});

	describe('Recursive cache with capacity=2 and no TTL', () => {
		interface RecursiveStructure {
			/* eslint-disable-next-line functional/prefer-readonly-type */
			[key: string]: string | RecursiveStructure;
		}

		const testCache = MCache.make<RecursiveStructure, string>({
			lookUp: ({ key, memoized, isCircular }) =>
				isCircular ?
					Tuple.make('Circular', false)
				:	Tuple.make(
						pipe(
							key,
							Record.reduce('', (acc, value) =>
								MTypes.isString(value) ? acc + value : acc + memoized(value)
							)
						),
						true
					),
			capacity: 2
		});

		it('Without circularity', () => {
			const z1: RecursiveStructure = { a: 'a', b: 'b', c: 'c' };
			const z2: RecursiveStructure = { a: z1, d: 'd', c: z1 };
			const z3: RecursiveStructure = { a: z1, b: z2, e: 'e' };
			const value1 = pipe(testCache, MCache.get(z3));

			expect(value1).toBe('abcabcdabce');
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(2);
			expect(
				Option.match(MutableHashMap.get(store, z2), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => ''
					}),
					onNone: () => ''
				})
			).toBe('abcdabc');
			expect(
				Option.match(MutableHashMap.get(store, z3), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => ''
					}),
					onNone: () => ''
				})
			).toBe('abcabcdabce');
		});

		it('With circularity', () => {
			const z1: RecursiveStructure = { a: 'a', b: 'b', c: 'c' };
			const z2: RecursiveStructure = { a: z1, d: 'd', c: z1 };
			const z3: RecursiveStructure = { a: z1, b: z2, e: 'e' };
			/* eslint-disable-next-line functional/immutable-data */
			z2['c'] = z3;
			const value1 = pipe(testCache, MCache.get(z3));
			expect(value1).toBe('abcabcdCirculare');
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(2);
			expect(
				Option.match(MutableHashMap.get(store, z2), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => ''
					}),
					onNone: () => ''
				})
			).toBe('abcdCircular');
			expect(
				Option.match(MutableHashMap.get(store, z3), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => ''
					}),
					onNone: () => ''
				})
			).toBe('abcabcdCirculare');
		});
	});
});
