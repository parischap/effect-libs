import * as TestUtils from '@parischap/configs/TestUtils';
import { MFs } from '@parischap/effect-lib';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('MFs', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(MFs.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
