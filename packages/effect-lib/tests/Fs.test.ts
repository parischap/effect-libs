import * as TestUtils from '@parischap/configs/TestUtils';
import { MFs } from '@parischap/effect-lib';
import { describe, it } from 'vitest';

describe('MFs', () => {
  it('moduleTag', () => {
    TestUtils.assertSome(TestUtils.moduleTagFromTestFilePath(__filename), MFs.moduleTag);
  });
});
