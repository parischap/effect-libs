import { ASColorBase } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASColorBase', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASColorBase.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
