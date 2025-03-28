/* eslint-disable functional/no-expression-statements */
import { MCache, MTypes } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Array, Order, Record, Tuple, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('MCache', () => {
	describe('Tag, prototype and guards', () => {
		const testCache = MCache.make({
			lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true)
		});

		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), MCache.moduleTag);
		});

		/* +Infinity gets printed as null... */
		it('.toString()', () => {
			TEUtils.strictEqual(
				testCache.toString(),
				`{
  "_id": "@parischap/effect-lib/Cache/",
  "capacity": null,
  "lifeSpan": null,
  "store": {
    "_id": "MutableHashMap",
    "values": []
  },
  "keyListInOrder": {
    "_id": "MutableList",
    "values": []
  }
}`
			);
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(testCache.pipe(MCache.get(3)), 6);
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(MCache.has(testCache));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(MCache.has(new Date()));
			});
		});
	});

	describe('Non-recursive cache with unbounded capacity and no TTL', () => {
		const testCache = MCache.make({
			lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true)
		});

		it('Get three elements: 3,4 and 3', () => {
			const value1 = pipe(testCache, MCache.get(3));
			const value2 = pipe(testCache, MCache.get(4));
			const value3 = pipe(testCache, MCache.get(3));
			TEUtils.strictEqual(value1, 6);
			TEUtils.strictEqual(value2, 8);
			TEUtils.strictEqual(value3, 6);
			TEUtils.deepStrictEqual(
				pipe(testCache, MCache.keysInStore, Array.sort(Order.number)),
				[3, 4]
			);
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
			TEUtils.strictEqual(value1, 6);
			TEUtils.strictEqual(value2, 8);
			TEUtils.strictEqual(value3, 6);
			TEUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 2);
			TEUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [4, 3]);
		});

		it("Get one more element but don't store it:8", () => {
			const value1 = pipe(testCache, MCache.get(8));
			TEUtils.strictEqual(value1, 16);
			TEUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 2);
			TEUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [4, 3]);
		});

		it('Get four more elements 5, 6, 5 and 7', () => {
			const value1 = pipe(testCache, MCache.get(5));
			const value2 = pipe(testCache, MCache.get(6));
			const value3 = pipe(testCache, MCache.get(5));
			const value4 = pipe(testCache, MCache.get(7));
			TEUtils.strictEqual(value1, 10);
			TEUtils.strictEqual(value2, 12);
			TEUtils.strictEqual(value3, 10);
			TEUtils.strictEqual(value4, 14);
			TEUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 3);
			TEUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [7, 6, 5]);
		});
	});

	describe('Non-recursive cache with capacity=3 and TTL=0', () => {
		let state = 0;
		const testCache = MCache.make<number, number>({
			lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2 + state++, key !== 8),
			capacity: 3,
			lifeSpan: 0
		});

		it('Get four elements: 3,4,5 and 6', () => {
			TEUtils.strictEqual(state, 0);
			const value1 = pipe(testCache, MCache.get(3));
			TEUtils.strictEqual(state, 1);
			const value2 = pipe(testCache, MCache.get(4));
			TEUtils.strictEqual(state, 2);
			const value3 = pipe(testCache, MCache.get(5));
			TEUtils.strictEqual(state, 3);
			const value4 = pipe(testCache, MCache.get(6));
			TEUtils.strictEqual(value1, 6);
			TEUtils.strictEqual(value2, 9);
			TEUtils.strictEqual(value3, 12);
			TEUtils.strictEqual(value4, 15);
			TEUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 3);
			TEUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [6, 5, 4]);
		});

		it("Get one more element but don't store it: 8", () => {
			TEUtils.strictEqual(state, 4);
			const value1 = pipe(testCache, MCache.get(8));
			TEUtils.strictEqual(value1, 20);
			TEUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 3);
			TEUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [6, 5, 4]);
		});

		it('Get element again: 5', () => {
			TEUtils.strictEqual(state, 5);
			const value1 = pipe(testCache, MCache.get(5));
			TEUtils.strictEqual(value1, 15);
			TEUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 2);
			TEUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [5, 6]);
		});

		it('Get elements again: 3 and 4', () => {
			TEUtils.strictEqual(state, 6);
			const value1 = pipe(testCache, MCache.get(3));
			TEUtils.strictEqual(state, 7);
			const value2 = pipe(testCache, MCache.get(4));
			TEUtils.strictEqual(value1, 12);
			TEUtils.strictEqual(value2, 15);
			TEUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 3);
			TEUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [4, 3, 5]);
		});

		it('Get element again: 4', () => {
			TEUtils.strictEqual(state, 8);
			const value1 = pipe(testCache, MCache.get(4));
			TEUtils.strictEqual(value1, 16);
			TEUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 1);
			TEUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [4]);
		});
	});

	describe('Recursive cache with capacity=2 and no TTL', () => {
		interface RecursiveStructure {
			/* eslint-disable-next-line functional/prefer-readonly-type */
			[key: string]: string | RecursiveStructure;
		}

		/**
		 * The lookup function takes a record and outputs the concatenated values of all its properties.
		 * If the value of a property is a record, the lookup function calls itself recursively until it
		 * finds a string.
		 */
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

			TEUtils.strictEqual(value1, 'abcabcdabce');
			const keysInStore = MCache.keysInStore(testCache);
			TEUtils.assertTrue(keysInStore[0] === z3);
			TEUtils.assertTrue(keysInStore[1] === z2);
		});

		it('With circularity', () => {
			const z1: RecursiveStructure = { a: 'a', b: 'b', c: 'c' };
			const z2: RecursiveStructure = { a: z1, d: 'd', c: z1 };
			const z3: RecursiveStructure = { a: z1, b: z2, e: 'e' };
			/* eslint-disable-next-line functional/immutable-data */
			z2['c'] = z3;
			const value1 = pipe(testCache, MCache.get(z3));
			TEUtils.strictEqual(value1, 'abcabcdCirculare');
		});
	});
});
