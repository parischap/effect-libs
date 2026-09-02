import { assert, describe, it } from '@effect/vitest';
import { pipe } from 'effect';
import * as Number from 'effect/Number';
import * as Predicate from 'effect/Predicate';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MPredicate from '@parischap/effect-lib/MPredicate';
import type * as MTypes from '@parischap/effect-lib/MTypes';

const unknown = null as unknown;

const testNumber = 5;
const testSymbol: unique symbol = Symbol.for('testSymbol');

const testArray0: Array<number> = [];
const testArray1 = [5];
const testArray2 = [5, 6];
const testArray3 = [5, 6, 7];

const testOneArgFunction = Number.increment;
const testFunction = (n: number, m?: number) => n + (m ?? 0);

/** Source */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<MPredicate.Source<Predicate.Predicate<number>>, number>(),
);
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<MPredicate.Source<Predicate.Refinement<number, 5>>, number>(),
);

/** Target */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<MPredicate.Target<Predicate.Predicate<number>>, number>(),
);

TestUtils.assertTrueType(
  TestUtils.areEqualTypes<MPredicate.Target<Predicate.Refinement<number, 5>>, 5>(),
);

/** Coverage */

TestUtils.assertTrueType(
  TestUtils.areEqualTypes<MPredicate.Coverage<Predicate.Predicate<number>>, never>(),
);

TestUtils.assertTrueType(
  TestUtils.areEqualTypes<MPredicate.Target<Predicate.Refinement<number, 5>>, 5>(),
);

/** PredicatesToSources */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MPredicate.PredicatesToSources<
      readonly [Predicate.Predicate<number>, Predicate.Refinement<boolean, true>]
    >,
    readonly [number, boolean]
  >(),
);

/** PredicatesToTargets */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MPredicate.PredicatesToTargets<
      readonly [Predicate.Predicate<number>, Predicate.Refinement<boolean, true>]
    >,
    readonly [number, true]
  >(),
);

/** PredicatesToCoverages */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MPredicate.PredicatesToCoverages<
      readonly [Predicate.Predicate<number>, Predicate.Refinement<boolean, true>]
    >,
    readonly [never, true]
  >(),
);

/** SourcesToPredicates */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MPredicate.SourcesToPredicates<readonly [number, boolean]>,
    readonly [Predicate.Predicate<number>, Predicate.Predicate<boolean>]
  >(),
);

TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MPredicate.SourcesToPredicates<{ readonly a: number; readonly b: boolean }>,
    { readonly a: Predicate.Predicate<number>; readonly b: Predicate.Predicate<boolean> }
  >(),
);

describe('MPredicate', () => {
  describe('struct', () => {
    it('Type error expected', () => {
      /* @ts-expect-error c not present in object */
      assert.isFalse(pipe({ a: 0, b: 1 }, MPredicate.Struct({ c: Predicate.isNumber })));
    });

    it('Passing', () => {
      assert.isTrue(
        pipe(
          { a: 0, b: 1, c: 2 },
          MPredicate.Struct({ b: Predicate.isNumber, c: Predicate.isNumber }),
        ),
      );
    });

    it('Failing', () => {
      assert.isFalse(
        pipe(
          { a: 0, b: 1, c: 2 },
          MPredicate.Struct({ b: Predicate.isNumber, c: Predicate.isString }),
        ),
      );
    });
  });

  describe('strictEquals', () => {
    it('Matching', () => {
      assert.isTrue(pipe(5, MPredicate.strictEquals(5)));
    });

    it('Non matching', () => {
      assert.isFalse(pipe(5, MPredicate.strictEquals(2)));
    });
  });

  describe('isPrimitive', () => {
    if (MPredicate.isPrimitive(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, MTypes.Primitive>());

    it('Number', () => {
      assert.isTrue(MPredicate.isPrimitive(testNumber));
    });

    it('Undefined', () => {
      assert.isTrue(MPredicate.isPrimitive(undefined));
    });

    it('Array', () => {
      assert.isFalse(MPredicate.isPrimitive(testArray2));
    });

    it('Function', () => {
      assert.isFalse(MPredicate.isPrimitive(testOneArgFunction));
    });
  });

  describe('isNonPrimitive', () => {
    it('Array', () => {
      assert.isTrue(MPredicate.isNonPrimitive(testArray2));
    });

    it('Function', () => {
      assert.isTrue(MPredicate.isNonPrimitive(testOneArgFunction));
    });

    it('Non matching', () => {
      assert.isFalse(MPredicate.isNonPrimitive(testSymbol));
    });
  });

  describe('isFunction', () => {
    it('Matching', () => {
      assert.isTrue(MPredicate.isFunction(testOneArgFunction));
    });

    it('Non matching', () => {
      assert.isFalse(MPredicate.isFunction(testNumber));
    });
  });

  describe('isNoArgFunction', () => {
    it('Matching', () => {
      assert.isTrue(MPredicate.isNoArgFunction(() => 1));
    });

    it('Non matching', () => {
      assert.isFalse(MPredicate.isNoArgFunction(testOneArgFunction));
    });
  });

  describe('isOneArgFunction', () => {
    it('Matching', () => {
      assert.isTrue(MPredicate.isOneArgFunction(testOneArgFunction));
    });

    it('Non matching', () => {
      assert.isFalse(MPredicate.isOneArgFunction(testFunction));
    });
  });

  describe('isTwoArgFunction', () => {
    it('Matching', () => {
      assert.isTrue(MPredicate.isTwoArgFunction((a: number, b: number) => a + b));
    });

    it('Non matching', () => {
      assert.isFalse(MPredicate.isTwoArgFunction(testOneArgFunction));
    });
  });

  describe('isOverOne', () => {
    it('Singleton array', () => {
      assert.isTrue(MPredicate.isOverOne(testArray1));
    });

    it('Two-element array', () => {
      assert.isTrue(MPredicate.isOverOne(testArray2));
    });

    it('Non matching', () => {
      assert.isFalse(MPredicate.isOverOne(testArray0));
    });
  });

  describe('isReadonlyOverOne', () => {
    it('Singleton array', () => {
      assert.isTrue(MPredicate.isReadonlyOverOne(testArray1));
    });

    it('Two-element array', () => {
      assert.isTrue(MPredicate.isReadonlyOverOne(testArray2));
    });

    it('Non matching', () => {
      assert.isFalse(MPredicate.isReadonlyOverOne(testArray0));
    });
  });

  describe('isOverTwo', () => {
    it('Two-element array', () => {
      assert.isTrue(MPredicate.isOverTwo(testArray2));
    });

    it('Three-element array', () => {
      assert.isTrue(MPredicate.isOverTwo(testArray3));
    });

    it('Non matching', () => {
      assert.isFalse(MPredicate.isOverTwo(testArray1));
    });
  });

  describe('isReadonlyOverTwo', () => {
    it('Two-element array', () => {
      assert.isTrue(MPredicate.isReadonlyOverTwo(testArray2));
    });

    it('Three-element array', () => {
      assert.isTrue(MPredicate.isReadonlyOverTwo(testArray3));
    });

    it('Non matching', () => {
      assert.isFalse(MPredicate.isReadonlyOverTwo(testArray0));
    });
  });

  describe('isSingleton', () => {
    it('Matching', () => {
      assert.isTrue(MPredicate.isSingleton(testArray1));
    });

    it('Empty array', () => {
      assert.isFalse(MPredicate.isSingleton(testArray0));
    });

    it('Two-element array', () => {
      assert.isFalse(MPredicate.isSingleton(testArray2));
    });
  });

  describe('isReadonlySingleton', () => {
    it('Matching', () => {
      assert.isTrue(MPredicate.isReadonlySingleton(testArray1));
    });

    it('Empty array', () => {
      assert.isFalse(MPredicate.isReadonlySingleton(testArray0));
    });

    it('Two-element array', () => {
      assert.isFalse(MPredicate.isReadonlySingleton(testArray2));
    });
  });

  describe('isPair', () => {
    it('Matching', () => {
      assert.isTrue(MPredicate.isPair(testArray2));
    });

    it('Singleton array', () => {
      assert.isFalse(MPredicate.isPair(testArray1));
    });

    it('Three-element array', () => {
      assert.isFalse(MPredicate.isPair(testArray3));
    });
  });

  describe('isReadonlyPair', () => {
    it('Matching', () => {
      assert.isTrue(MPredicate.isReadonlyPair(testArray2));
    });

    it('Empty array', () => {
      assert.isFalse(MPredicate.isReadonlyPair(testArray0));
    });

    it('Three-element array', () => {
      assert.isFalse(MPredicate.isReadonlyPair(testArray3));
    });
  });
});
