import * as TestUtils from '@parischap/configs/TestUtils';
import { MTreeNode } from '@parischap/effect-lib';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('MNode', () => {
  describe('Tag', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(MTreeNode.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });
  });
});
