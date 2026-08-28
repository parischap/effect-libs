import { assert, describe, it } from '@effect/vitest';
import { pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MIterable from '@parischap/effect-lib/MIterable';
import * as MPredicate from '@parischap/effect-lib/MPredicate';

describe('MIterable', () => {
  describe('findAll', () => {
    it('Empty array', () => {
      assert.deepStrictEqual(
        [...pipe(Array.empty<number>(), MIterable.findAll(MPredicate.strictEquals(3)))],
        [],
      );
    });
    it('Non empty array', () => {
      assert.deepStrictEqual(
        [...pipe(Array.make(3, 2, 5, 3, 8, 3), MIterable.findAll(MPredicate.strictEquals(3)))],
        [0, 3, 5],
      );
    });
  });

  describe('takeRightBut', () => {
    it('Empty array', () => {
      assert.deepStrictEqual([...pipe(Array.empty<number>(), MIterable.takeRightBut(2))], []);
    });
    it('Non empty array', () => {
      assert.deepStrictEqual(
        [...pipe(Array.make(3, 2, 5, 3, 8, 3), MIterable.takeRightBut(2))],
        [5, 3, 8, 3],
      );
    });
  });

  describe('longestCommonSubArray', () => {
    it('Empty array', () => {
      assert.deepStrictEqual(
        [...pipe(Array.empty<number>(), MIterable.longestCommonSubArray(Array.make(1, 2, 3)))],
        [],
      );
    });
    it('Non empty array', () => {
      assert.deepStrictEqual(
        [...pipe(Array.make(1, 2, 3, 4, 5), MIterable.longestCommonSubArray(Array.make(1, 2, 3)))],
        [1, 2, 3],
      );
    });
  });

  describe('ungroup', () => {
    it('Empty array', () => {
      assert.deepStrictEqual(
        [...pipe(Array.empty<ReadonlyArray<number>>(), MIterable.ungroup)],
        [],
      );
    });
    it('Non empty array', () => {
      assert.deepStrictEqual(
        [
          ...pipe(
            [
              [1, 2, 3],
              [1, 2, 3],
            ],
            MIterable.ungroup,
          ),
        ],
        [
          [0, 1],
          [0, 2],
          [0, 3],
          [1, 1],
          [1, 2],
          [1, 3],
        ],
      );
    });
  });

  describe('modifyTail', () => {
    it('Empty array', () => {
      assert.deepStrictEqual(
        [...pipe(Array.empty<number>(), MIterable.modifyTail(Number.sum(1)))],
        [],
      );
    });
    it('One element', () => {
      assert.deepStrictEqual([...pipe(Array.of(1), MIterable.modifyTail(Number.sum(1)))], [1]);
    });
    it('More than one element', () => {
      assert.deepStrictEqual(
        [...pipe(Array.make(1, 2, 3), MIterable.modifyTail(Number.sum(1)))],
        [1, 3, 4],
      );
    });
  });

  describe('modifyHead', () => {
    it('Empty array', () => {
      assert.deepStrictEqual(
        [...pipe(Array.empty<number>(), MIterable.modifyHead(Number.sum(1)))],
        [],
      );
    });
    it('One element', () => {
      assert.deepStrictEqual([...pipe(Array.of(1), MIterable.modifyHead(Number.sum(1)))], [2]);
    });
    it('More than one element', () => {
      assert.deepStrictEqual(
        [...pipe(Array.make(1, 2, 3), MIterable.modifyHead(Number.sum(1)))],
        [2, 2, 3],
      );
    });
  });

  describe('unfold', () => {
    it('Without cycle', () => {
      assert.deepStrictEqual(
        [
          ...pipe(
            0,
            MIterable.unfold<number, number>((n) =>
              n <= 3 ? Option.some(Tuple.make(n, n + 1)) : Option.none(),
            ),
          ),
        ],
        [0, 1, 2, 3],
      );
    });

    it('With cycle', () => {
      const cyclical = (n: number): number => (n <= 2 ? n + 1 : 0);
      assert.deepStrictEqual(
        [
          ...pipe(
            0,
            MIterable.unfold<number, number>(
              (n, cycleSource) =>
                Option.match(cycleSource, {
                  onSome: () => Option.none(),
                  onNone: () => Option.some(Tuple.make(n, cyclical(n))),
                }),
              Number.Equivalence,
            ),
          ),
        ],
        [0, 1, 2, 3],
      );
    });
  });

  describe('mergeSorted', () => {
    class A implements Equal.Equal {
      constructor(
        readonly key: number,
        readonly value: string,
      ) {}
      [Equal.symbol](this: A, that: unknown): boolean {
        return that instanceof A && this.key === that.key;
      }
      [Hash.symbol](this: A) {
        return Hash.hash(this.key);
      }
    }

    const byKey: Order.Order<A> = Order.mapInput(Number.Order, Struct.get('key'));

    const mergeSortedAs = MIterable.mergeSorted(byKey);

    it('Empty arrays', () => {
      assert.deepStrictEqual([...pipe(Array.empty<A>(), mergeSortedAs(Array.empty<A>()))], []);
    });

    it('that finishes first', () => {
      TestUtils.assertEquals(
        [
          ...pipe(
            Array.make(new A(1, 'self1'), new A(3, 'self3'), new A(5, 'self5')),
            mergeSortedAs(Array.make(new A(2, 'that2'), new A(3, 'that3'), new A(4, 'that4'))),
          ),
        ],
        Array.make(
          new A(1, 'self1'),
          new A(2, 'that2'),
          new A(3, 'self3'),
          new A(3, 'that3'),
          new A(4, 'that4'),
          new A(5, 'self5'),
        ),
      );
    });

    it('self finishes first', () => {
      TestUtils.assertEquals(
        [
          ...pipe(
            Array.make(new A(1, 'self1'), new A(3, 'self3'), new A(5, 'self5')),
            mergeSortedAs(
              Array.make(
                new A(2, 'that2'),
                new A(3, 'that3'),
                new A(4, 'that4'),
                new A(6, 'that6'),
                new A(7, 'that7'),
              ),
            ),
          ),
        ],
        Array.make(
          new A(1, 'self1'),
          new A(2, 'that2'),
          new A(3, 'self3'),
          new A(3, 'that3'),
          new A(4, 'that4'),
          new A(5, 'self5'),
          new A(6, 'that6'),
          new A(7, 'that7'),
        ),
      );
    });
  });

  describe('differenceSorted', () => {
    const substractSortedNumbers = MIterable.differenceSorted(Number.Order);
    it('Subtract non-empty array from empty array', () => {
      assert.deepStrictEqual(
        [...pipe(Array.empty<number>(), substractSortedNumbers(Array.make(1, 2, 3)))],
        [],
      );
    });

    it('that finishes first', () => {
      assert.deepStrictEqual(
        [...pipe(Array.make(1, 2, 4, 6, 6, 6, 7, 8), substractSortedNumbers(Array.make(2, 6, 6)))],
        Array.make(1, 4, 6, 7, 8),
      );
    });

    it('self finishes first', () => {
      assert.deepStrictEqual(
        [...pipe(Array.make(1, 2, 4, 6, 6, 7, 8), substractSortedNumbers(Array.make(2, 6, 6, 10)))],
        Array.make(1, 4, 7, 8),
      );
    });
  });
});
