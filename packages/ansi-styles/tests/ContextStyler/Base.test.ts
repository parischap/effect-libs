import { ASContextStylerBase } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASContextStylerBase', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASContextStylerBase.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
