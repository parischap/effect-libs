import * as TestUtils from '@parischap/configs/TestUtils';
import * as MTreeLeaf from '@parischap/effect-lib/MTreeLeaf'
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('MTreeLeaf', () => {
  describe('Tag', () => {
    it('moduleTag', () => {
      console.log(TestUtils.moduleTagFromTestFilePath(import.meta.filename));
      TestUtils.assertEquals(
        Option.some(MTreeLeaf.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });
  });
});
