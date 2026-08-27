import { pipe } from 'effect';
import * as Array from 'effect/Array';
import * as MutableList from 'effect/MutableList';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import * as Predicate from 'effect/Predicate';
import * as Record from 'effect/Record';
import * as Tuple from 'effect/Tuple';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MCache from '@parischap/effect-lib/MCache';

import { assert, describe, it } from '@effect/vitest';

describe('MCache', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(MCache.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Non-recursive cache with unbounded capacity and no TTL', () => {
    const testCache = MCache.make({
      lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true),
    });

    it('Get three elements: 3,4 and 3', () => {
      const value1 = pipe(testCache, MCache.get(3));
      const value2 = pipe(testCache, MCache.get(4));
      const value3 = pipe(testCache, MCache.get(3));
      assert.strictEqual(value1, 6);
      assert.strictEqual(value2, 8);
      assert.strictEqual(value3, 6);
      assert.deepStrictEqual(pipe(testCache, MCache.toKeys, Array.sort(Order.Number)), [3, 4]);
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
      assert.strictEqual(value1, 6);
      assert.strictEqual(value2, 8);
      assert.strictEqual(value3, 6);
      assert.strictEqual(pipe(testCache, MCache.toKeys, Array.length), 2);
      assert.deepStrictEqual(MutableList.toArray(testCache.keyListInOrder), [3, 4]);
    });

    it("Get one more element but don't store it:8", () => {
      const value1 = pipe(testCache, MCache.get(8));
      assert.strictEqual(value1, 16);
      assert.strictEqual(pipe(testCache, MCache.toKeys, Array.length), 2);
      assert.deepStrictEqual(MutableList.toArray(testCache.keyListInOrder), [3, 4]);
    });

    it('Get four more elements 5, 6, 5 and 7', () => {
      const value1 = pipe(testCache, MCache.get(5));
      const value2 = pipe(testCache, MCache.get(6));
      const value3 = pipe(testCache, MCache.get(5));
      const value4 = pipe(testCache, MCache.get(7));
      assert.strictEqual(value1, 10);
      assert.strictEqual(value2, 12);
      assert.strictEqual(value3, 10);
      assert.strictEqual(value4, 14);
      assert.strictEqual(pipe(testCache, MCache.toKeys, Array.length), 3);
      assert.deepStrictEqual(MutableList.toArray(testCache.keyListInOrder), [5, 6, 7]);
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
      assert.strictEqual(state, 0);
      const value1 = pipe(testCache, MCache.get(3));
      assert.strictEqual(state, 1);
      const value2 = pipe(testCache, MCache.get(4));
      assert.strictEqual(state, 2);
      const value3 = pipe(testCache, MCache.get(5));
      assert.strictEqual(state, 3);
      const value4 = pipe(testCache, MCache.get(6));
      assert.strictEqual(value1, 6);
      assert.strictEqual(value2, 9);
      assert.strictEqual(value3, 12);
      assert.strictEqual(value4, 15);
      assert.strictEqual(pipe(testCache, MCache.toKeys, Array.length), 3);
      assert.deepStrictEqual(MutableList.toArray(testCache.keyListInOrder), [4, 5, 6]);
    });

    it("Get one more element but don't store it: 8", () => {
      assert.strictEqual(state, 4);
      const value1 = pipe(testCache, MCache.get(8));
      assert.strictEqual(value1, 20);
      assert.strictEqual(pipe(testCache, MCache.toKeys, Array.length), 3);
      assert.deepStrictEqual(MutableList.toArray(testCache.keyListInOrder), [4, 5, 6]);
    });

    it('Get element again: 5', () => {
      assert.strictEqual(state, 5);
      const value1 = pipe(testCache, MCache.get(5));
      assert.strictEqual(value1, 15);
      assert.strictEqual(pipe(testCache, MCache.toKeys, Array.length), 2);
      assert.deepStrictEqual(MutableList.toArray(testCache.keyListInOrder), [6, 5]);
    });

    it('Get elements again: 3 and 4', () => {
      assert.strictEqual(state, 6);
      const value1 = pipe(testCache, MCache.get(3));
      assert.strictEqual(state, 7);
      const value2 = pipe(testCache, MCache.get(4));
      assert.strictEqual(value1, 12);
      assert.strictEqual(value2, 15);
      assert.strictEqual(pipe(testCache, MCache.toKeys, Array.length), 3);
      assert.deepStrictEqual(MutableList.toArray(testCache.keyListInOrder), [5, 3, 4]);
    });

    it('Get element again: 4', () => {
      assert.strictEqual(state, 8);
      const value1 = pipe(testCache, MCache.get(4));
      assert.strictEqual(value1, 16);
      assert.strictEqual(pipe(testCache, MCache.toKeys, Array.length), 1);
      assert.deepStrictEqual(MutableList.toArray(testCache.keyListInOrder), [4]);
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
        isCircular
          ? Tuple.make('Circular', false)
          : Tuple.make(
              pipe(
                key,
                Record.reduce('', (acc, value) =>
                  Predicate.isString(value) ? acc + value : acc + memoized(value),
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

      assert.strictEqual(value1, 'abcabcdabce');
      const keysInStore = MCache.toKeys(testCache);
      assert.isTrue(keysInStore[0] === z3);
      assert.isTrue(keysInStore[1] === z2);
    });

    it('With circularity', () => {
      const z1: RecursiveStructure = { a: 'a', b: 'b', c: 'c' };

      const z2: RecursiveStructure = { a: z1, d: 'd', c: z1 };

      const z3: RecursiveStructure = { a: z1, b: z2, e: 'e' };
      z2['c'] = z3;
      const value1 = pipe(testCache, MCache.get(z3));
      assert.strictEqual(value1, 'abcabcdCirculare');
    });
  });
});
