import * as TestUtils from '@parischap/configs/TestUtils';
import { MTreeLeaf } from '@parischap/effect-lib';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('MTreeLeaf', () => {
  describe('Tag', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(MTreeLeaf.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });
  });
});
