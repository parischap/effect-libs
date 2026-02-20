import * as ASColor from '@parischap/ansi-styles/ASColor'
import * as TestUtils from '@parischap/configs/TestUtils';
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('ASColor', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASColor.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
