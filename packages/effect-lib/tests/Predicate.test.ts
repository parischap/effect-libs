import { MPredicate } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { pipe, Predicate } from 'effect';
import { describe, it } from 'vitest';

/** Source */
TEUtils.assertTrueType(
  TEUtils.areEqualTypes<MPredicate.Source<Predicate.Predicate<number>>, number>(),
);
TEUtils.assertTrueType(
  TEUtils.areEqualTypes<MPredicate.Source<Predicate.Refinement<number, 5>>, number>(),
);

/** Target */
TEUtils.assertTrueType(
  TEUtils.areEqualTypes<MPredicate.Target<Predicate.Predicate<number>>, number>(),
);

TEUtils.assertTrueType(
  TEUtils.areEqualTypes<MPredicate.Target<Predicate.Refinement<number, 5>>, 5>(),
);

/** Coverage */

TEUtils.assertTrueType(
  TEUtils.areEqualTypes<MPredicate.Coverage<Predicate.Predicate<number>>, never>(),
);

TEUtils.assertTrueType(
  TEUtils.areEqualTypes<MPredicate.Target<Predicate.Refinement<number, 5>>, 5>(),
);

/** PredicatesToSources */
TEUtils.assertTrueType(
  TEUtils.areEqualTypes<
    MPredicate.PredicatesToSources<
      readonly [Predicate.Predicate<number>, Predicate.Refinement<boolean, true>]
    >,
    readonly [number, boolean]
  >(),
);

/** PredicatesToTargets */
TEUtils.assertTrueType(
  TEUtils.areEqualTypes<
    MPredicate.PredicatesToTargets<
      readonly [Predicate.Predicate<number>, Predicate.Refinement<boolean, true>]
    >,
    readonly [number, true]
  >(),
);

/** PredicatesToCoverages */
TEUtils.assertTrueType(
  TEUtils.areEqualTypes<
    MPredicate.PredicatesToCoverages<
      readonly [Predicate.Predicate<number>, Predicate.Refinement<boolean, true>]
    >,
    readonly [never, true]
  >(),
);

/** SourcesToPredicates */
TEUtils.assertTrueType(
  TEUtils.areEqualTypes<
    MPredicate.SourcesToPredicates<readonly [number, boolean]>,
    readonly [Predicate.Predicate<number>, Predicate.Predicate<boolean>]
  >(),
);

TEUtils.assertTrueType(
  TEUtils.areEqualTypes<
    MPredicate.SourcesToPredicates<{ readonly a: number; readonly b: boolean }>,
    { readonly a: Predicate.Predicate<number>; readonly b: Predicate.Predicate<boolean> }
  >(),
);

describe('MPredicate', () => {
  describe('struct', () => {
    it('Type error expected', () => {
      /* @ts-expect-error c not present in object */
      TEUtils.assertFalse(pipe({ a: 0, b: 1 }, MPredicate.struct({ c: Predicate.isNumber })));
    });

    it('Passing', () => {
      TEUtils.assertTrue(
        pipe(
          { a: 0, b: 1, c: 2 },
          MPredicate.struct({ b: Predicate.isNumber, c: Predicate.isNumber }),
        ),
      );
    });

    it('Failing', () => {
      TEUtils.assertFalse(
        pipe(
          { a: 0, b: 1, c: 2 },
          MPredicate.struct({ b: Predicate.isNumber, c: Predicate.isString }),
        ),
      );
    });
  });

  describe('strictEquals', () => {
    it('Matching', () => {
      TEUtils.assertTrue(pipe(5, MPredicate.strictEquals(5)));
    });

    it('Non matching', () => {
      TEUtils.assertFalse(pipe(5, MPredicate.strictEquals(2)));
    });
  });
});
