import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Equal from 'effect/Equal';
import * as Function from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import * as Predicate from 'effect/Predicate';
import * as Record from 'effect/Record';
import * as Result from 'effect/Result';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MArray from '@parischap/effect-lib/MArray';
import * as MPredicate from '@parischap/effect-lib/MPredicate';
import * as MTuple from '@parischap/effect-lib/MTuple';

import { assert, describe, it } from '@effect/vitest';

describe('MArray', () => {
  describe('hasLength', () => {
    it('Simple Array', () => {
      assert.isTrue(pipe(Array.make(1, 2, 3), MArray.hasLength(3)));
    });
  });

  describe('hasDuplicatesWith', () => {
    it('With no duplicates', () => {
      assert.isFalse(pipe(Array.make(1, 2, 3), MArray.hasDuplicatesWith(Number.Equivalence)));
    });

    it('With duplicates', () => {
      assert.isTrue(pipe(Array.make(1, 2, 3, 2), MArray.hasDuplicatesWith(Number.Equivalence)));
    });
  });

  describe('hasDuplicates', () => {
    it('With no duplicates', () => {
      assert.isFalse(pipe(Array.make(1, 2, 3), MArray.hasDuplicates));
    });

    it('With duplicates', () => {
      assert.isTrue(pipe(Array.make(1, 2, 3, 2), MArray.hasDuplicates));
    });
  });

  describe('match012', () => {
    it('Empty array', () => {
      assert.strictEqual(
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
    it('Singleton', () => {
      assert.strictEqual(
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
    it('Two or more elements', () => {
      assert.strictEqual(
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
      assert.isTrue(
        pipe(Array.empty<number>(), MArray.findAll(MPredicate.strictEquals(3)), Array.isArrayEmpty),
      );
    });
    it('Non empty array', () => {
      assert.deepStrictEqual(
        pipe(Array.make(3, 2, 5, 3, 8, 3), MArray.findAll(MPredicate.strictEquals(3))),
        [0, 3, 5],
      );
    });
  });

  describe('takeBut', () => {
    it('Empty array', () => {
      assert.isTrue(pipe(Array.empty<number>(), MArray.takeBut(2), Array.isArrayEmpty));
    });
    it('Non empty array', () => {
      assert.deepStrictEqual(pipe(Array.make(3, 2, 5, 3, 8, 3), MArray.takeBut(2)), [3, 2, 5, 3]);
    });
  });

  describe('takeRightBut', () => {
    it('Empty array', () => {
      assert.isTrue(pipe(Array.empty<number>(), MArray.takeRightBut(2), Array.isArrayEmpty));
    });
    it('Non empty array', () => {
      assert.deepStrictEqual(
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
      assert.isTrue(
        pipe(
          Array.empty<number>(),
          MArray.longestCommonSubArray(Array.make(1, 2, 3)),
          Array.isArrayEmpty,
        ),
      );
    });
    it('Non empty array', () => {
      assert.deepStrictEqual(
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
      assert.strictEqual(
        pipe(Array.empty<ReadonlyArray<number>>(), MArray.ungroup, Array.isArrayEmpty),
        true,
      );
    });
    it('Non empty array', () => {
      assert.deepStrictEqual(
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
      assert.deepStrictEqual(
        pipe(foo, MArray.groupByNum({ size: 2, fKey: Tuple.get(0), fValue: Tuple.get(1) })),
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
      assert.deepStrictEqual(
        pipe(foo, MArray.groupByNum({ size: 2, fKey: Tuple.get(0), fValue: Tuple.get(1) })),
        [[1, 2, 3], []],
      );
    });
  });

  describe('groupBy', () => {
    it('Empty array', () => {
      assert.isTrue(
        pipe(
          Array.empty<readonly [string, number]>(),
          MArray.groupBy({ fKey: Tuple.get(0), fValue: Tuple.get(1) }),
          Record.isEmptyRecord,
        ),
      );
    });
    it('Non-empty array', () => {
      const foo: ReadonlyArray<readonly [string, number]> = [
        ['a', 1],
        ['b', 2],
        ['a', 3],
        ['b', 1],
        ['a', 2],
        ['b', 3],
      ];
      assert.deepStrictEqual(
        pipe(foo, MArray.groupBy({ fKey: Tuple.get(0), fValue: Tuple.get(1) })),
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
    it('Out-of-bounds index', () => {
      TestUtils.doesNotThrow(() => MArray.unsafeGet(3)([]));
    });
    it('NaN index', () => {
      TestUtils.doesNotThrow(() => MArray.unsafeGet(Number.Number.NaN)([]));
    });
    it('Infinity index', () => {
      TestUtils.doesNotThrow(() => MArray.unsafeGet(Infinity)([]));
    });
    it('Passing', () => {
      assert.strictEqual(MArray.unsafeGet(0)([2, 1]), 2);
    });
  });

  describe('unsafeGetter', () => {
    const unsafeGetter = MArray.unsafeGetter([1, 3, 2]);
    it('Out-of-bounds index', () => {
      TestUtils.doesNotThrow(() => unsafeGetter(3));
    });
    it('NaN index', () => {
      TestUtils.doesNotThrow(() => unsafeGetter(Number.Number.NaN));
    });
    it('Infinity index', () => {
      TestUtils.doesNotThrow(() => unsafeGetter(Infinity));
    });
    it('Passing', () => {
      assert.strictEqual(unsafeGetter(1), 3);
    });
  });

  describe('modifyInit', () => {
    it('Empty array', () => {
      assert.deepStrictEqual(pipe(Array.empty<number>(), MArray.modifyInit(Number.sum(1))), []);
    });
    it('One element', () => {
      assert.deepStrictEqual(pipe(Array.of(1), MArray.modifyInit(Number.sum(1))), [1]);
    });
    it('More than one element', () => {
      assert.deepStrictEqual(
        pipe(Array.make(1, 2, 3), MArray.modifyInit(Number.sum(1))),
        [2, 3, 3],
      );
    });
  });

  describe('modifyTail', () => {
    it('Empty array', () => {
      assert.deepStrictEqual(pipe(Array.empty<number>(), MArray.modifyTail(Number.sum(1))), []);
    });
    it('One element', () => {
      assert.deepStrictEqual(pipe(Array.of(1), MArray.modifyTail(Number.sum(1))), [1]);
    });

    it('More than one element', () => {
      assert.deepStrictEqual(
        pipe(Array.make(1, 2, 3), MArray.modifyTail(Number.sum(1))),
        [1, 3, 4],
      );
    });
  });

  describe('modifyHead', () => {
    it('Empty array', () => {
      assert.deepStrictEqual(pipe(Array.empty<number>(), MArray.modifyHead(Number.sum(1))), []);
    });
    it('One element', () => {
      assert.deepStrictEqual(pipe(Array.of(1), MArray.modifyHead(Number.sum(1))), [2]);
    });

    it('More than one element', () => {
      assert.deepStrictEqual(
        pipe(Array.make(1, 2, 3), MArray.modifyHead(Number.sum(1))),
        [2, 2, 3],
      );
    });
  });

  describe('modifyLast', () => {
    it('Empty array', () => {
      assert.deepStrictEqual(pipe(Array.empty<number>(), MArray.modifyLast(Number.sum(1))), []);
    });
    it('One element', () => {
      assert.deepStrictEqual(pipe(Array.of(1), MArray.modifyLast(Number.sum(1))), [2]);
    });
    it('More than one element', () => {
      assert.deepStrictEqual(
        pipe(Array.make(1, 2, 3), MArray.modifyLast(Number.sum(1))),
        [1, 2, 4],
      );
    });
  });

  describe('unfold', () => {
    it('Without cycle', () => {
      assert.deepStrictEqual(
        pipe(
          0,
          MArray.unfold<number, number>(
            flow(
              MTuple.replicate(2),
              Tuple.evolve(Tuple.make(Function.identity, Number.increment)),
              Option.liftPredicate(
                Predicate.Tuple([Number.isLessThanOrEqualTo(3), Function.constTrue]),
              ),
            ),
          ),
        ),
        [0, 1, 2, 3],
      );
    });

    it('With cycle', () => {
      const cyclical = flow(
        Option.liftPredicate(Number.isLessThanOrEqualTo(2)),
        Option.map(Number.increment),
        Option.getOrElse(() => 0),
      );
      assert.deepStrictEqual(
        pipe(
          0,
          MArray.unfold<number, number>(
            (b, cycleSource) =>
              Option.match(cycleSource, {
                onSome: () => Option.none(),
                onNone: () =>
                  pipe(
                    b,
                    MTuple.replicate(2),
                    Tuple.evolve(Tuple.make(Function.identity, cyclical)),
                    Option.some,
                  ),
              }),
            Number.Equivalence,
          ),
        ),
        [0, 1, 2, 3],
      );
    });
  });

  describe('unfoldNonEmpty', () => {
    it('Without cycle', () => {
      assert.deepStrictEqual(
        pipe(
          0,
          MArray.unfoldNonEmpty<number, number>(
            flow(
              MTuple.replicate(2),
              Tuple.evolve(
                Tuple.make(
                  Function.identity,
                  flow(Number.increment, Option.liftPredicate(Number.isLessThanOrEqualTo(3))),
                ),
              ),
            ),
          ),
        ),
        [0, 1, 2, 3],
      );
    });

    it('With cycle', () => {
      assert.deepStrictEqual(
        pipe(
          0,
          MArray.unfoldNonEmpty<number, number>(
            (b, cycleSource) =>
              Option.match(cycleSource, {
                onSome: () => Tuple.make(-1, Option.none()),
                onNone: () => Tuple.make(b, Option.some(b < 2 ? b + 1 : 0)),
              }),
            Number.Equivalence,
          ),
        ),
        [0, 1, 2, -1],
      );
    });
  });

  describe('splitAtFromRight', () => {
    it('Empty array', () => {
      assert.deepStrictEqual(pipe(Array.empty(), MArray.splitAtFromRight(3)), [[], []]);
    });

    it('Any array with n within bounds', () => {
      assert.deepStrictEqual(pipe(Array.make(1, 2, 3), MArray.splitAtFromRight(2)), [[1], [2, 3]]);
    });

    it('Any array with n beyond bounds', () => {
      assert.deepStrictEqual(pipe(Array.make(1, 2, 3), MArray.splitAtFromRight(5)), [
        [],
        [1, 2, 3],
      ]);
    });
  });

  describe('splitNonEmptyAtFromRight', () => {
    it('Non-empty array', () => {
      assert.deepStrictEqual(pipe(Array.make(1, 2, 3), MArray.splitNonEmptyAtFromRight(2)), [
        [1],
        [2, 3],
      ]);
    });
  });

  describe('removeEmptyAndJoin', () => {
    it('With all non-empty parts', () => {
      assert.strictEqual(pipe(['a', 'b', 'c'], MArray.removeEmptyAndJoin(',')), 'a,b,c');
    });

    it('Filters out empty parts', () => {
      assert.strictEqual(pipe(['a', '', 'b', ''], MArray.removeEmptyAndJoin('-')), 'a-b');
    });

    it('Works with generic iterables', () => {
      assert.strictEqual(pipe(new Set(['x', '', 'y']), MArray.removeEmptyAndJoin('|')), 'x|y');
    });
  });

  describe('mapUnlessNone', () => {
    const f = flow(
      Option.liftPredicate(Number.isGreaterThanOrEqualTo(3)),
      Option.map(Number.multiply(2)),
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
      Result.liftPredicate(Number.isGreaterThanOrEqualTo(3), () => new Error('boom')),
      Result.map(Number.multiply(2)),
    );
    it('Empty array', () => {
      TestUtils.assertSuccess(pipe(Array.empty(), MArray.mapUnlessLeft(f)), Array.empty());
    });

    it('Array with all matching elements', () => {
      TestUtils.assertSuccess(
        pipe(Array.make(3, 4, 6, 5), MArray.mapUnlessLeft(f)),
        Array.make(6, 8, 12, 10),
      );
    });

    it('Array with some non matching element', () => {
      TestUtils.assertFailure(pipe(Array.make(3, 4, 2, 5), MArray.mapUnlessLeft(f)));
    });
  });

  describe('reduceUnlessNone', () => {
    const f = (z: number, current: number) =>
      pipe(
        current,
        Option.liftPredicate(Number.isGreaterThanOrEqualTo(3)),
        Option.map(Number.sum(z)),
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
        Result.liftPredicate(Number.isGreaterThanOrEqualTo(3), () => new Error('boom')),
        Result.map(Number.sum(z)),
      );

    it('Empty array', () => {
      TestUtils.assertSuccess(pipe(Array.empty(), MArray.reduceUnlessLeft(0, f)), 0);
    });

    it('Array with all matching elements', () => {
      TestUtils.assertSuccess(pipe(Array.make(3, 4, 6, 5), MArray.reduceUnlessLeft(0, f)), 18);
    });

    it('Array with some non matching element', () => {
      TestUtils.assertFailure(pipe(Array.make(3, 4, 2, 5), MArray.reduceUnlessLeft(0, f)));
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

    const mergeSortedAs = MArray.mergeSorted(byKey);

    it('Empty arrays', () => {
      assert.isTrue(pipe(Array.empty<A>(), mergeSortedAs(Array.empty<A>()), Array.isArrayEmpty));
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
    const substractSortedNumbers = MArray.differenceSorted(Number.Order);
    it('Subtract non-empty array from empty array', () => {
      assert.isTrue(
        pipe(
          Array.empty<number>(),
          substractSortedNumbers(Array.make(1, 2, 3)),
          Array.isArrayEmpty,
        ),
      );
    });

    it('that finishes first', () => {
      assert.deepStrictEqual(
        pipe(Array.make(1, 2, 4, 6, 6, 6, 7, 8), substractSortedNumbers(Array.make(2, 6, 6))),
        Array.make(1, 4, 6, 7, 8),
      );
    });

    it('self finishes first', () => {
      assert.deepStrictEqual(
        pipe(Array.make(1, 2, 4, 6, 6, 7, 8), substractSortedNumbers(Array.make(2, 6, 6, 10))),
        Array.make(1, 4, 7, 8),
      );
    });
  });

  describe('pad', () => {
    it('Array shorter than target length', () => {
      assert.deepStrictEqual(MArray.pad(3, 0)([1, 2]), [1, 2, 0]);
    });
  });
});
