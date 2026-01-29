import * as TestUtils from '@parischap/configs/TestUtils';
import { MCache, MTypes } from '@parischap/effect-lib';
import { Array, Option, Order, Record, Tuple, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('MCache', () => {
  TestUtils.assertEquals(
    Option.some(MCache.moduleTag),
    TestUtils.moduleTagFromTestFilePath(import.meta.filename),
  );

  describe('Non-recursive cache with unbounded capacity and no TTL', () => {
    const testCache = MCache.make({
      lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true),
    });

    it('Get three elements: 3,4 and 3', () => {
      const value1 = pipe(testCache, MCache.get(3));
      const value2 = pipe(testCache, MCache.get(4));
      const value3 = pipe(testCache, MCache.get(3));
      TestUtils.strictEqual(value1, 6);
      TestUtils.strictEqual(value2, 8);
      TestUtils.strictEqual(value3, 6);
      TestUtils.deepStrictEqual(
        pipe(testCache, MCache.keysInStore, Array.sort(Order.number)),
        [3, 4],
      );
    });
  });

  describe('Non-recursive cache with capacity=3 and no TTL', () => {
    const testCache = MCache.make({
      lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, key !== 8),
      capacity: 3,
    });

    it('Get three elements: 3,4 and 3', () => {
      const value1 = pipe(testCache, MCache.get(3));
      const value2 = pipe(testCache, MCache.get(4));
      const value3 = pipe(testCache, MCache.get(3));
      TestUtils.strictEqual(value1, 6);
      TestUtils.strictEqual(value2, 8);
      TestUtils.strictEqual(value3, 6);
      TestUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 2);
      TestUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [4, 3]);
    });

    it("Get one more element but don't store it:8", () => {
      const value1 = pipe(testCache, MCache.get(8));
      TestUtils.strictEqual(value1, 16);
      TestUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 2);
      TestUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [4, 3]);
    });

    it('Get four more elements 5, 6, 5 and 7', () => {
      const value1 = pipe(testCache, MCache.get(5));
      const value2 = pipe(testCache, MCache.get(6));
      const value3 = pipe(testCache, MCache.get(5));
      const value4 = pipe(testCache, MCache.get(7));
      TestUtils.strictEqual(value1, 10);
      TestUtils.strictEqual(value2, 12);
      TestUtils.strictEqual(value3, 10);
      TestUtils.strictEqual(value4, 14);
      TestUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 3);
      TestUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [7, 6, 5]);
    });
  });

  describe('Non-recursive cache with capacity=3 and TTL=0', () => {
    let state = 0;
    const testCache = MCache.make<number, number>({
      lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2 + state++, key !== 8),
      capacity: 3,
      lifeSpan: 0,
    });

    it('Get four elements: 3,4,5 and 6', () => {
      TestUtils.strictEqual(state, 0);
      const value1 = pipe(testCache, MCache.get(3));
      TestUtils.strictEqual(state, 1);
      const value2 = pipe(testCache, MCache.get(4));
      TestUtils.strictEqual(state, 2);
      const value3 = pipe(testCache, MCache.get(5));
      TestUtils.strictEqual(state, 3);
      const value4 = pipe(testCache, MCache.get(6));
      TestUtils.strictEqual(value1, 6);
      TestUtils.strictEqual(value2, 9);
      TestUtils.strictEqual(value3, 12);
      TestUtils.strictEqual(value4, 15);
      TestUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 3);
      TestUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [6, 5, 4]);
    });

    it("Get one more element but don't store it: 8", () => {
      TestUtils.strictEqual(state, 4);
      const value1 = pipe(testCache, MCache.get(8));
      TestUtils.strictEqual(value1, 20);
      TestUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 3);
      TestUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [6, 5, 4]);
    });

    it('Get element again: 5', () => {
      TestUtils.strictEqual(state, 5);
      const value1 = pipe(testCache, MCache.get(5));
      TestUtils.strictEqual(value1, 15);
      TestUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 2);
      TestUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [5, 6]);
    });

    it('Get elements again: 3 and 4', () => {
      TestUtils.strictEqual(state, 6);
      const value1 = pipe(testCache, MCache.get(3));
      TestUtils.strictEqual(state, 7);
      const value2 = pipe(testCache, MCache.get(4));
      TestUtils.strictEqual(value1, 12);
      TestUtils.strictEqual(value2, 15);
      TestUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 3);
      TestUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [4, 3, 5]);
    });

    it('Get element again: 4', () => {
      TestUtils.strictEqual(state, 8);
      const value1 = pipe(testCache, MCache.get(4));
      TestUtils.strictEqual(value1, 16);
      TestUtils.strictEqual(pipe(testCache, MCache.keysInStore, Array.length), 1);
      TestUtils.deepStrictEqual(Array.fromIterable(testCache.keyListInOrder), [4]);
    });
  });

  describe('Recursive cache with capacity=2 and no TTL', () => {
    interface RecursiveStructure {
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
        : Tuple.make(
            pipe(
              key,
              Record.reduce('', (acc, value) =>
                MTypes.isString(value) ? acc + value : acc + memoized(value),
              ),
            ),
            true,
          ),
      capacity: 2,
    });

    it('Without circularity', () => {
      const z1: RecursiveStructure = { a: 'a', b: 'b', c: 'c' };

      const z2: RecursiveStructure = { a: z1, d: 'd', c: z1 };

      const z3: RecursiveStructure = { a: z1, b: z2, e: 'e' };
      const value1 = pipe(testCache, MCache.get(z3));

      TestUtils.strictEqual(value1, 'abcabcdabce');
      const keysInStore = MCache.keysInStore(testCache);
      TestUtils.assertTrue(keysInStore[0] === z3);
      TestUtils.assertTrue(keysInStore[1] === z2);
    });

    it('With circularity', () => {
      const z1: RecursiveStructure = { a: 'a', b: 'b', c: 'c' };

      const z2: RecursiveStructure = { a: z1, d: 'd', c: z1 };

      const z3: RecursiveStructure = { a: z1, b: z2, e: 'e' };
      z2['c'] = z3;
      const value1 = pipe(testCache, MCache.get(z3));
      TestUtils.strictEqual(value1, 'abcabcdCirculare');
    });
  });
});
