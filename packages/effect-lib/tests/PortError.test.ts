import * as TestUtils from '@parischap/configs/TestUtils';
import { MPortError } from '@parischap/effect-lib';
import { describe, it } from 'vitest';

describe('MPortError', () => {
  it('moduleTag', () => {
    TestUtils.assertSome(TestUtils.moduleTagFromTestFilePath(__filename), MPortError.moduleTag);
  });
});
