import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import type * as MTypes from '@parischap/effect-lib/MTypes';
import * as PPNonPrimitiveParameters from '@parischap/pretty-print/PPNonPrimitiveParameters';

import { describe, it } from 'vitest';

describe('PPNonPrimitiveParameters', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(PPNonPrimitiveParameters.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Equal.equals', () => {
    it('Matching', () => {
      TestUtils.assertEquals(
        PPNonPrimitiveParameters.utilInspectLikeArray,
        PPNonPrimitiveParameters.utilInspectLikeArray,
      );
    });

    it('Non-matching', () => {
      TestUtils.assertNotEquals(
        PPNonPrimitiveParameters.utilInspectLikeArray,
        PPNonPrimitiveParameters.utilInspectLikeFunction,
      );
    });
  });

  it('.toString()', () => {
    TestUtils.strictEqual(
      PPNonPrimitiveParameters.utilInspectLikeFunction.toString(),
      'UtilInspectLikeFunction',
    );
  });

  it('.pipe()', () => {
    TestUtils.strictEqual(
      PPNonPrimitiveParameters.utilInspectLikeFunction.pipe(PPNonPrimitiveParameters.id),
      'UtilInspectLikeFunction',
    );
  });

  describe('isApplicableTo', () => {
    it('utilInspectLikeFunction applies to functions', () => {
      TestUtils.assertTrue(
        PPNonPrimitiveParameters.utilInspectLikeFunction.isApplicableTo(
          () => 42 as unknown as MTypes.AnyFunction,
        ),
      );
    });

    it('utilInspectLikeFunction does not apply to plain objects', () => {
      TestUtils.assertFalse(
        PPNonPrimitiveParameters.utilInspectLikeFunction.isApplicableTo({
          a: 1,
        } as unknown as MTypes.AnyFunction),
      );
    });

    it('utilInspectLikeArray applies to arrays', () => {
      TestUtils.assertTrue(PPNonPrimitiveParameters.utilInspectLikeArray.isApplicableTo([1, 2, 3]));
    });
  });
});
