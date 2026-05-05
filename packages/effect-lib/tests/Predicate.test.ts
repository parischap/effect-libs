import { pipe } from 'effect';
import * as Number from 'effect/Number';
import * as Predicate from 'effect/Predicate';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MPredicate from '@parischap/effect-lib/MPredicate';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import { describe, it } from 'vitest';

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
      TestUtils.assertFalse(pipe({ a: 0, b: 1 }, MPredicate.struct({ c: Predicate.isNumber })));
    });

    it('Passing', () => {
      TestUtils.assertTrue(
        pipe(
          { a: 0, b: 1, c: 2 },
          MPredicate.struct({ b: Predicate.isNumber, c: Predicate.isNumber }),
        ),
      );
    });

    it('Failing', () => {
      TestUtils.assertFalse(
        pipe(
          { a: 0, b: 1, c: 2 },
          MPredicate.struct({ b: Predicate.isNumber, c: Predicate.isString }),
        ),
      );
    });
  });

  describe('strictEquals', () => {
    it('Matching', () => {
      TestUtils.assertTrue(pipe(5, MPredicate.strictEquals(5)));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(pipe(5, MPredicate.strictEquals(2)));
    });
  });

  describe('isPrimitive', () => {
    if (MPredicate.isPrimitive(unknown))
      TestUtils.assertTrueType(TestUtils.areEqualTypes<typeof unknown, MTypes.Primitive>());

    it('Number', () => {
      TestUtils.assertTrue(MPredicate.isPrimitive(testNumber));
    });

    it('Undefined', () => {
      TestUtils.assertTrue(MPredicate.isPrimitive(undefined));
    });

    it('Array', () => {
      TestUtils.assertFalse(MPredicate.isPrimitive(testArray2));
    });

    it('Function', () => {
      TestUtils.assertFalse(MPredicate.isPrimitive(testOneArgFunction));
    });
  });

  describe('isNonPrimitive', () => {
    it('Array', () => {
      TestUtils.assertTrue(MPredicate.isNonPrimitive(testArray2));
    });

    it('Function', () => {
      TestUtils.assertTrue(MPredicate.isNonPrimitive(testOneArgFunction));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MPredicate.isNonPrimitive(testSymbol));
    });
  });

  describe('isOneArgFunction', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MPredicate.isOneArgFunction(testOneArgFunction));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MPredicate.isOneArgFunction(testFunction));
    });
  });

  describe('isTwoArgFunction', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MPredicate.isTwoArgFunction((a: number, b: number) => a + b));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MPredicate.isTwoArgFunction(testOneArgFunction));
    });
  });

  describe('isOverOne', () => {
    it('Singleton array', () => {
      TestUtils.assertTrue(MPredicate.isOverOne(testArray1));
    });

    it('Two-element array', () => {
      TestUtils.assertTrue(MPredicate.isOverOne(testArray2));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MPredicate.isOverOne(testArray0));
    });
  });

  describe('isReadonlyOverOne', () => {
    it('Singleton array', () => {
      TestUtils.assertTrue(MPredicate.isReadonlyOverOne(testArray1));
    });

    it('Two-element array', () => {
      TestUtils.assertTrue(MPredicate.isReadonlyOverOne(testArray2));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MPredicate.isReadonlyOverOne(testArray0));
    });
  });

  describe('isOverTwo', () => {
    it('Two-element array', () => {
      TestUtils.assertTrue(MPredicate.isOverTwo(testArray2));
    });

    it('Three-element array', () => {
      TestUtils.assertTrue(MPredicate.isOverTwo(testArray3));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MPredicate.isOverTwo(testArray1));
    });
  });

  describe('isReadonlyOverTwo', () => {
    it('Two-element array', () => {
      TestUtils.assertTrue(MPredicate.isReadonlyOverTwo(testArray2));
    });

    it('Three-element array', () => {
      TestUtils.assertTrue(MPredicate.isReadonlyOverTwo(testArray3));
    });

    it('Non matching', () => {
      TestUtils.assertFalse(MPredicate.isReadonlyOverTwo(testArray0));
    });
  });

  describe('isSingleton', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MPredicate.isSingleton(testArray1));
    });

    it('Empty array', () => {
      TestUtils.assertFalse(MPredicate.isSingleton(testArray0));
    });

    it('Two-element array', () => {
      TestUtils.assertFalse(MPredicate.isSingleton(testArray2));
    });
  });

  describe('isReadonlySingleton', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MPredicate.isReadonlySingleton(testArray1));
    });

    it('Empty array', () => {
      TestUtils.assertFalse(MPredicate.isReadonlySingleton(testArray0));
    });

    it('Two-element array', () => {
      TestUtils.assertFalse(MPredicate.isReadonlySingleton(testArray2));
    });
  });

  describe('isPair', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MPredicate.isPair(testArray2));
    });

    it('Singleton array', () => {
      TestUtils.assertFalse(MPredicate.isPair(testArray1));
    });

    it('Three-element array', () => {
      TestUtils.assertFalse(MPredicate.isPair(testArray3));
    });
  });

  describe('isReadonlyPair', () => {
    it('Matching', () => {
      TestUtils.assertTrue(MPredicate.isReadonlyPair(testArray2));
    });

    it('Empty array', () => {
      TestUtils.assertFalse(MPredicate.isReadonlyPair(testArray0));
    });

    it('Three-element array', () => {
      TestUtils.assertFalse(MPredicate.isReadonlyPair(testArray3));
    });
  });
});
