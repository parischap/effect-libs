import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStyleMap from '@parischap/pretty-print/PPStyleMap';

import { describe, it } from 'vitest';

describe('PPParameters', () => {
  it('moduleTag', () => {
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
    TestUtils.strictEqual(PPParameters.utilInspectLike.toString(), 'UtilInspectLike');
  });

  it('.pipe()', () => {
    TestUtils.strictEqual(
      PPParameters.utilInspectLike.pipe(PPParameters.styleMap),
      PPStyleMap.none,
    );
  });
});
