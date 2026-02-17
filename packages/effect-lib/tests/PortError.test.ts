import * as TestUtils from '@parischap/configs/TestUtils';
import * as MPortError from '@parischap/effect-lib/MPortError'
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('MPortError', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(MPortError.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
