import { assert, describe, it } from '@effect/vitest';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVRounderParams from '@parischap/conversions/CVRounderParams';
import * as CVRoundingOption from '@parischap/conversions/CVRoundingOption';

describe('CVRounderParams', () => {
  const rounderParams = CVRounderParams.make({
    precision: 3,
    roundingOption: CVRoundingOption.Type.HalfEven,
  });
  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVRounderParams.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      assert.strictEqual(rounderParams.toString(), 'HalfEvenRounderWith3Precision');
    });
  });
});
