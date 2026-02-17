import * as TestUtils from '@parischap/configs/TestUtils';
import * as MArray from '@parischap/effect-lib/MArray'
import * as MPredicate from '@parischap/effect-lib/MPredicate'
import * as MTuple from '@parischap/effect-lib/MTuple'
import {flow, pipe} from 'effect'
import * as Array from 'effect/Array'
import * as Either from 'effect/Either'
import * as ENumber from 'effect/Number'
import * as Equal from 'effect/Equal'
import * as Function from 'effect/Function'
import * as Hash from 'effect/Hash'
import * as Option from 'effect/Option'
import * as Order from 'effect/Order'
import * as Predicate from 'effect/Predicate'
import * as Record from 'effect/Record'
import * as Struct from 'effect/Struct'
import * as Tuple from 'effect/Tuple'
import { describe, it } from 'vitest';

describe('MArray', () => {
  describe('hasLength', () => {
    it('Simple Array', () => {
      TestUtils.assertTrue(pipe(Array.make(1, 2, 3), MArray.hasLength(3)));
    });
  });

  describe('hasDuplicatesWith', () => {
    it('With no duplicates', () => {
      TestUtils.assertFalse(
        pipe(Array.make(1, 2, 3), MArray.hasDuplicatesWith(ENumber.Equivalence)),
      );
    });

    it('With duplicates', () => {
      TestUtils.assertTrue(
        pipe(Array.make(1, 2, 3, 2), MArray.hasDuplicatesWith(ENumber.Equivalence)),
      );
    });
  });

  describe('hasDuplicates', () => {
    it('With no duplicates', () => {
      TestUtils.assertFalse(pipe(Array.make(1, 2, 3), MArray.hasDuplicates));
    });

    it('With duplicates', () => {
      TestUtils.assertTrue(pipe(Array.make(1, 2, 3, 2), MArray.hasDuplicates));
    });
  });

  describe('match012', () => {
    it('Empty array', () => {
      TestUtils.strictEqual(
        pipe(
          Array.empty<number>(),
          MArray.match012({
            onEmpty: () => 'Empty array',
            onSingleton: () => 'Singleton',
            onOverTwo: () => 'OverTwo',
          }),
        ),
        'Empty array',
      );
    });
    it('Empty array', () => {
      TestUtils.strictEqual(
        pipe(
          Array.of(1),
          MArray.match012({
            onEmpty: () => 'Empty array',
            onSingleton: () => 'Singleton',
            onOverTwo: () => 'OverTwo',
          }),
        ),
        'Singleton',
      );
    });
    it('Empty array', () => {
      TestUtils.strictEqual(
        pipe(
          Array.make(1, 2, 3),
          MArray.match012({
            onEmpty: () => 'Empty array',
            onSingleton: () => 'Singleton',
            onOverTwo: () => 'OverTwo',
          }),
        ),
        'OverTwo',
      );
    });
  });

  describe('findAll', () => {
    it('Empty array', () => {
      TestUtils.assertTrue(
        pipe(Array.empty<number>(), MArray.findAll(MPredicate.strictEquals(3)), Array.isEmptyArray),
      );
    });
    it('Non empty array', () => {
      TestUtils.deepStrictEqual(
        pipe(Array.make(3, 2, 5, 3, 8, 3), MArray.findAll(MPredicate.strictEquals(3))),
        [0, 3, 5],
      );
    });
  });

  describe('takeBut', () => {
    it('Empty array', () => {
      TestUtils.assertTrue(pipe(Array.empty<number>(), MArray.takeBut(2), Array.isEmptyArray));
    });
    it('Non empty array', () => {
      TestUtils.deepStrictEqual(
        pipe(Array.make(3, 2, 5, 3, 8, 3), MArray.takeBut(2)),
        [3, 2, 5, 3],
      );
    });
  });

  describe('takeRightBut', () => {
    it('Empty array', () => {
      TestUtils.assertTrue(pipe(Array.empty<number>(), MArray.takeRightBut(2), Array.isEmptyArray));
    });
    it('Non empty array', () => {
      TestUtils.deepStrictEqual(
        pipe(Array.make(3, 2, 5, 3, 8, 3), MArray.takeRightBut(2)),
        [5, 3, 8, 3],
      );
    });
  });

  describe('getFromEnd', () => {
    it('Empty array', () => {
      TestUtils.assertNone(pipe(Array.empty<number>(), MArray.getFromEnd(2)));
    });
    it('Non empty array', () => {
      TestUtils.assertSome(pipe(Array.make(1, 2, 3), MArray.getFromEnd(2)), 1);
    });
  });

  describe('longestCommonSubArray', () => {
    it('Empty array', () => {
      TestUtils.assertTrue(
        pipe(
          Array.empty<number>(),
          MArray.longestCommonSubArray(Array.make(1, 2, 3)),
          Array.isEmptyArray,
        ),
      );
    });
    it('Non empty array', () => {
      TestUtils.deepStrictEqual(
        pipe(Array.make(1, 2, 3, 4, 5), MArray.longestCommonSubArray(Array.make(1, 2, 3))),
        [1, 2, 3],
      );
    });
  });

  describe('extractFirst', () => {
    it('Empty array', () => {
      TestUtils.assertEquals(
        pipe(Array.empty<number>(), MArray.extractFirst(MPredicate.strictEquals(3))),
        Tuple.make(Option.none(), Array.empty()),
      );
    });
    it('Non empty array', () => {
      TestUtils.assertEquals(
        pipe(Array.make(1, 2, 3, 4, 5), MArray.extractFirst(MPredicate.strictEquals(3))),
        Tuple.make(Option.some(3), Array.make(1, 2, 4, 5)),
      );
    });
  });

  describe('ungroup', () => {
    it('Empty array', () => {
      TestUtils.strictEqual(
        pipe(Array.empty<ReadonlyArray<number>>(), MArray.ungroup, Array.isEmptyArray),
        true,
      );
    });
    it('Non empty array', () => {
      TestUtils.deepStrictEqual(
        pipe(
          [
            [1, 2, 3],
            [1, 2, 3],
          ],
          MArray.ungroup,
        ),
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

  describe('groupByNum', () => {
    it('With indexes within bounds', () => {
      const foo: ReadonlyArray<readonly [number, number]> = [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 1],
        [1, 2],
        [1, 3],
      ];
      TestUtils.deepStrictEqual(
        pipe(foo, MArray.groupByNum({ size: 2, fKey: Tuple.getFirst, fValue: Tuple.getSecond })),
        [
          [1, 2, 3],
          [1, 2, 3],
        ],
      );
    });
    it('With indexes out of bounds', () => {
      const foo: ReadonlyArray<readonly [number, number]> = [
        [0, 1],
        [0, 2],
        [0, 3],
        [2, 1],
        [2, 2],
        [2, 3],
      ];
      TestUtils.deepStrictEqual(
        pipe(foo, MArray.groupByNum({ size: 2, fKey: Tuple.getFirst, fValue: Tuple.getSecond })),
        [[1, 2, 3], []],
      );
    });
  });

  describe('groupBy', () => {
    it('Empty array', () => {
      TestUtils.assertTrue(
        pipe(
          Array.empty<readonly [string, number]>(),
          MArray.groupBy({ fKey: Tuple.getFirst, fValue: Tuple.getSecond }),
          Record.isEmptyRecord,
        ),
      );
    });
    it('With indexes out of bounds', () => {
      const foo: ReadonlyArray<readonly [string, number]> = [
        ['a', 1],
        ['b', 2],
        ['a', 3],
        ['b', 1],
        ['a', 2],
        ['b', 3],
      ];
      TestUtils.deepStrictEqual(
        pipe(foo, MArray.groupBy({ fKey: Tuple.getFirst, fValue: Tuple.getSecond })),
        {
          a: [1, 3, 2],
          b: [2, 1, 3],
        },
      );
    });
  });

  describe('getter', () => {
    const getter = MArray.getter([1, 3, 2]);
    it('Out of range', () => {
      TestUtils.assertNone(getter(3));
    });
    it('Within range', () => {
      TestUtils.assertSome(getter(1), 3);
    });
  });

  describe('unsafeGet', () => {
    it('Not passing', () => {
      TestUtils.doesNotThrow(() => MArray.unsafeGet(3)([]));
      TestUtils.doesNotThrow(() => MArray.unsafeGet(Number.NaN)([]));
      TestUtils.doesNotThrow(() => MArray.unsafeGet(Infinity)([]));
    });
    it('Passing', () => {
      TestUtils.strictEqual(MArray.unsafeGet(0)([2, 1]), 2);
    });
  });

  describe('unsafeGetter', () => {
    const unsafeGetter = MArray.unsafeGetter([1, 3, 2]);
    it('Not passing', () => {
      TestUtils.doesNotThrow(() => unsafeGetter(3));
      TestUtils.doesNotThrow(() => unsafeGetter(Number.NaN));
      TestUtils.doesNotThrow(() => unsafeGetter(Infinity));
    });
    it('Passing', () => {
      TestUtils.strictEqual(unsafeGetter(1), 3);
    });
  });

  describe('modifyInit', () => {
    it('One element', () => {
      TestUtils.deepStrictEqual(pipe(Array.of(1), MArray.modifyInit(ENumber.sum(1))), [1]);
    });
    it('More than one element', () => {
      TestUtils.deepStrictEqual(
        pipe(Array.make(1, 2, 3), MArray.modifyInit(ENumber.sum(1))),
        [2, 3, 3],
      );
    });
  });

  describe('modifyTail', () => {
    it('One element', () => {
      TestUtils.deepStrictEqual(pipe(Array.of(1), MArray.modifyTail(ENumber.sum(1))), [1]);
    });
    it('More than one element', () => {
      TestUtils.deepStrictEqual(
        pipe(Array.make(1, 2, 3), MArray.modifyTail(ENumber.sum(1))),
        [1, 3, 4],
      );
    });
  });

  describe('modifyHead', () => {
    it('Empty array', () => {
      TestUtils.assertTrue(
        pipe(Array.empty<number>(), MArray.modifyHead(ENumber.sum(1)), Array.isEmptyArray),
      );
    });
    it('Non empty array', () => {
      TestUtils.deepStrictEqual(
        pipe(Array.make(1, 2, 3), MArray.modifyHead(ENumber.sum(1))),
        [2, 2, 3],
      );
    });
  });

  describe('modifyLast', () => {
    it('Empty array', () => {
      TestUtils.assertTrue(
        pipe(Array.empty<number>(), MArray.modifyLast(ENumber.sum(1)), Array.isEmptyArray),
      );
    });
    it('Non empty array', () => {
      TestUtils.deepStrictEqual(
        pipe(Array.make(1, 2, 3), MArray.modifyLast(ENumber.sum(1))),
        [1, 2, 4],
      );
    });
  });

  describe('unfold', () => {
    it('Without cycle', () => {
      TestUtils.deepStrictEqual(
        pipe(
          0,
          MArray.unfold<number, number>(
            flow(
              MTuple.makeBothBy({ toFirst: Function.identity, toSecond: ENumber.increment }),
              Option.liftPredicate(
                Predicate.tuple(ENumber.lessThanOrEqualTo(3), Function.constTrue),
              ),
            ),
          ),
        ),
        [0, 1, 2, 3],
      );
    });

    it('With cycle', () => {
      const cyclical = flow(
        Option.liftPredicate(ENumber.lessThanOrEqualTo(2)),
        Option.map(ENumber.increment),
        Option.getOrElse(() => 0),
      );
      TestUtils.deepStrictEqual(
        pipe(
          0,
          MArray.unfold<number, number>(
            (b, cycleSource) =>
              Option.match(cycleSource, {
                onSome: () => Option.none(),
                onNone: () =>
                  pipe(
                    b,
                    MTuple.makeBothBy({ toFirst: Function.identity, toSecond: cyclical }),
                    Option.some,
                  ),
              }),
            ENumber.Equivalence,
          ),
        ),
        [0, 1, 2, 3],
      );
    });
  });

  it('unfoldNonEmpty', () => {
    TestUtils.deepStrictEqual(
      pipe(
        0,
        MArray.unfoldNonEmpty(
          MTuple.makeBothBy({
            toFirst: Function.identity,
            toSecond: flow(ENumber.increment, Option.liftPredicate(ENumber.lessThanOrEqualTo(3))),
          }),
        ),
      ),
      [0, 1, 2, 3],
    );
  });

  describe('splitAtFromRight', () => {
    it('Empty array', () => {
      TestUtils.deepStrictEqual(pipe(Array.empty(), MArray.splitAtFromRight(3)), [[], []]);
    });

    it('Any array with n within bounds', () => {
      TestUtils.deepStrictEqual(pipe(Array.make(1, 2, 3), MArray.splitAtFromRight(2)), [
        [1],
        [2, 3],
      ]);
    });

    it('Any array with n beyond bounds', () => {
      TestUtils.deepStrictEqual(pipe(Array.make(1, 2, 3), MArray.splitAtFromRight(5)), [
        [],
        [1, 2, 3],
      ]);
    });
  });

  describe('mapUnlessNone', () => {
    const f = flow(
      Option.liftPredicate(ENumber.greaterThanOrEqualTo(3)),
      Option.map(ENumber.multiply(2)),
    );
    it('Empty array', () => {
      TestUtils.assertSome(pipe(Array.empty(), MArray.mapUnlessNone(f)), Array.empty());
    });

    it('Array with all matching elements', () => {
      TestUtils.assertSome(
        pipe(Array.make(3, 4, 6, 5), MArray.mapUnlessNone(f)),
        Array.make(6, 8, 12, 10),
      );
    });

    it('Array with some non matching element', () => {
      TestUtils.assertNone(pipe(Array.make(3, 4, 2, 5), MArray.mapUnlessNone(f)));
    });
  });

  describe('mapUnlessLeft', () => {
    const f = flow(
      Either.liftPredicate(ENumber.greaterThanOrEqualTo(3), () => new Error('boom')),
      Either.map(ENumber.multiply(2)),
    );
    it('Empty array', () => {
      TestUtils.assertRight(pipe(Array.empty(), MArray.mapUnlessLeft(f)), Array.empty());
    });

    it('Array with all matching elements', () => {
      TestUtils.assertRight(
        pipe(Array.make(3, 4, 6, 5), MArray.mapUnlessLeft(f)),
        Array.make(6, 8, 12, 10),
      );
    });

    it('Array with some non matching element', () => {
      TestUtils.assertLeft(pipe(Array.make(3, 4, 2, 5), MArray.mapUnlessLeft(f)));
    });
  });

  describe('reduceUnlessNone', () => {
    const f = (z: number, current: number) =>
      pipe(
        current,
        Option.liftPredicate(ENumber.greaterThanOrEqualTo(3)),
        Option.map(ENumber.sum(z)),
      );

    it('Empty array', () => {
      TestUtils.assertSome(pipe(Array.empty(), MArray.reduceUnlessNone(0, f)), 0);
    });

    it('Array with all matching elements', () => {
      TestUtils.assertSome(pipe(Array.make(3, 4, 6, 5), MArray.reduceUnlessNone(0, f)), 18);
    });

    it('Array with some non matching element', () => {
      TestUtils.assertNone(pipe(Array.make(3, 4, 2, 5), MArray.reduceUnlessNone(0, f)));
    });
  });

  describe('reduceUnlessLeft', () => {
    const f = (z: number, current: number) =>
      pipe(
        current,
        Either.liftPredicate(ENumber.greaterThanOrEqualTo(3), () => new Error('boom')),
        Either.map(ENumber.sum(z)),
      );

    it('Empty array', () => {
      TestUtils.assertRight(pipe(Array.empty(), MArray.reduceUnlessLeft(0, f)), 0);
    });

    it('Array with all matching elements', () => {
      TestUtils.assertRight(pipe(Array.make(3, 4, 6, 5), MArray.reduceUnlessLeft(0, f)), 18);
    });

    it('Array with some non matching element', () => {
      TestUtils.assertLeft(pipe(Array.make(3, 4, 2, 5), MArray.reduceUnlessLeft(0, f)));
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
        return pipe(this.key, Hash.hash, Hash.cached(this));
      }
    }

    const byKey: Order.Order<A> = Order.mapInput(ENumber.Order, Struct.get('key'));

    const mergeSortedAs = MArray.mergeSorted(byKey);

    it('Empty arrays', () => {
      TestUtils.assertTrue(
        pipe(Array.empty<A>(), mergeSortedAs(Array.empty<A>()), Array.isEmptyArray),
      );
    });

    it('that finishes first', () => {
      TestUtils.assertEquals(
        pipe(
          Array.make(new A(1, 'self1'), new A(3, 'self3'), new A(5, 'self5')),
          mergeSortedAs(Array.make(new A(2, 'that2'), new A(3, 'that3'), new A(4, 'that4'))),
        ),
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
        pipe(
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
    const substractSortedNumbers = MArray.differenceSorted(ENumber.Order);
    it('Substract non-empty array from empty array', () => {
      TestUtils.assertTrue(
        pipe(
          Array.empty<number>(),
          substractSortedNumbers(Array.make(1, 2, 3)),
          Array.isEmptyArray,
        ),
      );
    });

    it('that finishes first', () => {
      TestUtils.deepStrictEqual(
        pipe(Array.make(1, 2, 4, 6, 6, 6, 7, 8), substractSortedNumbers(Array.make(2, 6, 6))),
        Array.make(1, 4, 6, 7, 8),
      );
    });

    it('self finishes first', () => {
      TestUtils.deepStrictEqual(
        pipe(Array.make(1, 2, 4, 6, 6, 7, 8), substractSortedNumbers(Array.make(2, 6, 6, 10))),
        Array.make(1, 4, 7, 8),
      );
    });
  });
});
