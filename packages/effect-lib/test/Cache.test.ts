/* eslint functional/no-expression-statements: "off" */
import { MCache, MTypes } from '@parischap-dev/effect-lib';
import { Equal, MutableHashMap, Option, Record, Tuple, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MCache', () => {
	describe('Non-recursive cache with no capacity and no TTL', () => {
		const testCache = MCache.make<number, number>({
			lookUp: ({ key }) => Tuple.make(key * 2, true)
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
			expect(
				Equal.equals(
					MutableHashMap.get(store, 3),
					Option.some(Option.some(MCache.makeValueContainer({ value: 6, storeDate: 0 })))
				)
			).toBe(true);
			expect(
				Equal.equals(
					MutableHashMap.get(store, 4),
					Option.some(Option.some(MCache.makeValueContainer({ value: 8, storeDate: 0 })))
				)
			).toBe(true);
		});
	});

	describe('Non-recursive cache with capacity=3 and no TTL', () => {
		const testCache = MCache.make<number, number>({
			lookUp: ({ key }) => Tuple.make(key * 2, key !== 8),
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
			expect(
				Equal.equals(
					MutableHashMap.get(store, 3),
					Option.some(Option.some(MCache.makeValueContainer({ value: 6, storeDate: 0 })))
				)
			).toBe(true);
			expect(
				Equal.equals(
					MutableHashMap.get(store, 4),
					Option.some(Option.some(MCache.makeValueContainer({ value: 8, storeDate: 0 })))
				)
			).toBe(true);
		});

		it("Get one more element but don't store it:8", () => {
			const value1 = pipe(testCache, MCache.get(8));
			expect(value1).toBe(16);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(2);
			expect(
				Equal.equals(
					MutableHashMap.get(store, 3),
					Option.some(Option.some(MCache.makeValueContainer({ value: 6, storeDate: 0 })))
				)
			).toBe(true);
			expect(
				Equal.equals(
					MutableHashMap.get(store, 4),
					Option.some(Option.some(MCache.makeValueContainer({ value: 8, storeDate: 0 })))
				)
			).toBe(true);
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
			expect(
				Equal.equals(
					MutableHashMap.get(store, 5),
					Option.some(Option.some(MCache.makeValueContainer({ value: 10, storeDate: 0 })))
				)
			).toBe(true);
			expect(
				Equal.equals(
					MutableHashMap.get(store, 6),
					Option.some(Option.some(MCache.makeValueContainer({ value: 12, storeDate: 0 })))
				)
			).toBe(true);
			expect(
				Equal.equals(
					MutableHashMap.get(store, 7),
					Option.some(Option.some(MCache.makeValueContainer({ value: 14, storeDate: 0 })))
				)
			).toBe(true);
		});
	});

	describe('Non-recursive cache with capacity=3 and TTL=0', () => {
		let state = 0;
		const testCache = MCache.make<number, number>({
			lookUp: ({ key }) => Tuple.make(key * 2 + state++, key !== 8),
			capacity: 3,
			lifeSpan: 0
		});

		it('Get four elements: 3,4,5 and 6', () => {
			const value1 = pipe(testCache, MCache.get(3));
			const value2 = pipe(testCache, MCache.get(4));
			const value3 = pipe(testCache, MCache.get(5));
			const value4 = pipe(testCache, MCache.get(6));
			expect(value1).toBe(6);
			expect(value2).toBe(9);
			expect(value3).toBe(12);
			expect(value4).toBe(15);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(3);
			expect(
				Option.match(MutableHashMap.get(store, 4), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => 0
					}),
					onNone: () => 0
				})
			).toBe(9);
			expect(
				Option.match(MutableHashMap.get(store, 5), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => 0
					}),
					onNone: () => 0
				})
			).toBe(12);
			expect(
				Option.match(MutableHashMap.get(store, 6), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => 0
					}),
					onNone: () => 0
				})
			).toBe(15);
		});

		it("Get one more element but don't store it:8", () => {
			const value1 = pipe(testCache, MCache.get(8));
			expect(value1).toBe(20);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(3);
			expect(
				Option.match(MutableHashMap.get(store, 4), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => 0
					}),
					onNone: () => 0
				})
			).toBe(9);
			expect(
				Option.match(MutableHashMap.get(store, 5), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => 0
					}),
					onNone: () => 0
				})
			).toBe(12);
			expect(
				Option.match(MutableHashMap.get(store, 6), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => 0
					}),
					onNone: () => 0
				})
			).toBe(15);
		});

		it('Get one more element:5', () => {
			const value1 = pipe(testCache, MCache.get(5));
			expect(value1).toBe(15);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(2);
			expect(
				Option.match(MutableHashMap.get(store, 5), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => 0
					}),
					onNone: () => 0
				})
			).toBe(15);
			expect(
				Option.match(MutableHashMap.get(store, 6), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => 0
					}),
					onNone: () => 0
				})
			).toBe(15);
			expect(testCache.keyOrder.toJSON()).toEqual({
				_id: 'MutableQueue',
				values: [6, 5]
			});
		});

		it('Get two more elements: 3 and 4', () => {
			const value1 = pipe(testCache, MCache.get(3));
			const value2 = pipe(testCache, MCache.get(4));
			expect(value1).toBe(12);
			expect(value2).toBe(15);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(3);
			expect(
				Option.match(MutableHashMap.get(store, 5), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => 0
					}),
					onNone: () => 0
				})
			).toBe(15);
			expect(
				Option.match(MutableHashMap.get(store, 3), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => 0
					}),
					onNone: () => 0
				})
			).toBe(12);
			expect(
				Option.match(MutableHashMap.get(store, 4), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => 0
					}),
					onNone: () => 0
				})
			).toBe(15);
		});

		it('Get one more element: 4', () => {
			const value1 = pipe(testCache, MCache.get(4));
			expect(value1).toBe(16);
			const store = testCache.store;
			expect(MutableHashMap.size(store)).toBe(1);
			expect(
				Option.match(MutableHashMap.get(store, 4), {
					onSome: Option.match({
						onSome: ({ value }) => value,
						onNone: () => 0
					}),
					onNone: () => 0
				})
			).toBe(16);
			expect(testCache.keyOrder.toJSON()).toEqual({
				_id: 'MutableQueue',
				values: [4]
			});
		});
	});

	describe('Recursive cache with capacity=2 and no TTL', () => {
		interface RecursiveStructure {
			// eslint-disable-next-line functional/prefer-readonly-type
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
			// eslint-disable-next-line functional/immutable-data
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
