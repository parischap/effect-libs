import * as TestUtils from '@parischap/configs/TestUtils';
import { MTreeNonLeaf } from '@parischap/effect-lib';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('MTreeNonLeaf', () => {
  describe('Tag', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(MTreeNonLeaf.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });
  });
});
