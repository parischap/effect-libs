import * as assert from '@effect/vitest/assert';
import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStyleMap from '@parischap/pretty-print/PPStyleMap';

describe('PPParameters', () => {
  it('moduleTag', () => {
    console.log(TestUtils.moduleTagFromTestFilePath(import.meta.filename));
    TestUtils.assertEquals(
      Option.some(PPParameters.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Equal.equals', () => {
    it('Matching', () => {
      TestUtils.assertEquals(PPParameters.utilInspectLike, PPParameters.utilInspectLike);
    });

    it('Non-matching', () => {
      TestUtils.assertNotEquals(PPParameters.utilInspectLike, PPParameters.treeify);
    });
  });

  it('.toString()', () => {
    assert.strictEqual(PPParameters.utilInspectLike.toString(), 'UtilInspectLike');
  });

  it('.pipe()', () => {
    assert.strictEqual(PPParameters.utilInspectLike.pipe(PPParameters.styleMap), PPStyleMap.none);
  });
});
