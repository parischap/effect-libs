import { ASColor } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASColor', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASColor.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
