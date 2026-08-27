import * as assert from '@effect/vitest/assert';
import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import type * as MTypes from '@parischap/effect-lib/MTypes';
import * as PPNonPrimitiveParameters from '@parischap/pretty-print/PPNonPrimitiveParameters';

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
    assert.strictEqual(
      PPNonPrimitiveParameters.utilInspectLikeFunction.toString(),
      'UtilInspectLikeFunction',
    );
  });

  it('.pipe()', () => {
    assert.strictEqual(
      PPNonPrimitiveParameters.utilInspectLikeFunction.pipe(PPNonPrimitiveParameters.id),
      'UtilInspectLikeFunction',
    );
  });

  describe('isApplicableTo', () => {
    it('utilInspectLikeFunction applies to functions', () => {
      assert.isTrue(
        PPNonPrimitiveParameters.utilInspectLikeFunction.isApplicableTo(
          () => 42 as unknown as MTypes.AnyFunction,
        ),
      );
    });

    it('utilInspectLikeFunction does not apply to plain objects', () => {
      assert.isFalse(
        PPNonPrimitiveParameters.utilInspectLikeFunction.isApplicableTo({
          a: 1,
        }),
      );
    });

    it('utilInspectLikeArray applies to arrays', () => {
      assert.isTrue(PPNonPrimitiveParameters.utilInspectLikeArray.isApplicableTo([1, 2, 3]));
    });
  });
});
