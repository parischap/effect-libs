import * as TestUtils from '@parischap/configs/TestUtils';
import { MPortError } from '@parischap/effect-lib';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('MPortError', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(MPortError.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
