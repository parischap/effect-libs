import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
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
