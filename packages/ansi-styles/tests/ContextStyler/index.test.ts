import { ASContextStyler } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASContextStyler', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASContextStyler.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
