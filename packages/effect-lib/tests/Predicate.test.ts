import * as TestUtils from '@parischap/configs/TestUtils';
import * as MPredicate from '@parischap/effect-lib/MPredicate'
import {pipe} from 'effect'
import * as Predicate from 'effect/Predicate'
import { describe, it } from 'vitest';

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
});
