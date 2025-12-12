import * as TestUtils from '@parischap/configs/TestUtils';
import { MInspectable } from '@parischap/effect-lib';
import { describe, it } from 'vitest';

describe('MInspectable', () => {
  it('moduleTag', () => {
    TestUtils.assertSome(TestUtils.moduleTagFromTestFilePath(__filename), MInspectable.moduleTag);
  });
});
