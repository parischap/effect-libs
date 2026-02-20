import * as ASContextStyler from '@parischap/ansi-styles/ASContextStyler'
import * as TestUtils from '@parischap/configs/TestUtils';
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('ASContextStyler', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASContextStyler.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
