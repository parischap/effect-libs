import { describe, it } from '@effect/vitest';
import * as Option from 'effect/Option';

import * as ASColorOptionalStyleCharacteristic from '@parischap/ansi-styles/ASColorOptionalStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';

describe('ASColorOptionalStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASColorOptionalStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
