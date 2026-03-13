import { pipe } from 'effect';

import * as MCache from '@parischap/effect-lib/MCache';

import * as Array from 'effect/Array';
import * as Order from 'effect/Order';
import * as Tuple from 'effect/Tuple';
import { describe, it } from 'vitest';

import * as TestUtils from '@parischap/configs/TestUtils';

import type * as MCacheLookUp from '@parischap/effect-lib/MCacheLookUp';

describe('MCacheLookUp', () => {
  describe('Non-recursive lookUp', () => {
    const lookUp: MCacheLookUp.Type<number, number> = ({ key }) => Tuple.make(key * 3, true);

    const testCache = MCache.make({ lookUp });

    it('Produces correct results when used in a cache', () => {
      TestUtils.strictEqual(pipe(testCache, MCache.get(5)), 15);
      TestUtils.strictEqual(pipe(testCache, MCache.get(10)), 30);
      TestUtils.deepStrictEqual(
        pipe(testCache, MCache.toKeys, Array.sort(Order.number)),
        [5, 10],
      );
    });
  });

  describe('LookUp that does not store results', () => {
    const lookUp: MCacheLookUp.Type<number, number> = ({ key }) => Tuple.make(key * 2, false);

    const testCache = MCache.make({ lookUp });

    it('Results are not cached when storeInCache is false', () => {
      TestUtils.strictEqual(pipe(testCache, MCache.get(7)), 14);
      TestUtils.deepStrictEqual(pipe(testCache, MCache.toKeys), []);
    });
  });

  describe('Recursive lookUp with circularity detection', () => {
    interface Tree {
      readonly value: number;
      readonly children: ReadonlyArray<Tree>;
    }

    const lookUp: MCacheLookUp.Type<Tree, number> = ({ key, memoized, isCircular }) =>
      isCircular
        ? Tuple.make(0, false)
        : Tuple.make(
            key.value + key.children.reduce((acc, child) => acc + memoized(child), 0),
            true,
          );

    it('Sums all values in a tree', () => {
      const testCache = MCache.make({ lookUp });

      const leaf1: Tree = { value: 1, children: [] };
      const leaf2: Tree = { value: 2, children: [] };
      const node: Tree = { value: 10, children: [leaf1, leaf2] };

      TestUtils.strictEqual(pipe(testCache, MCache.get(node)), 13);
    });
  });
});
