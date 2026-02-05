import * as TestUtils from '@parischap/configs/TestUtils';
import * as MCacheValueContainer from '@parischap/effect-lib/MCacheValueContainer';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('MCacheValueContainer', () => {
  describe('Tag', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(MCacheValueContainer.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });
  });
});
