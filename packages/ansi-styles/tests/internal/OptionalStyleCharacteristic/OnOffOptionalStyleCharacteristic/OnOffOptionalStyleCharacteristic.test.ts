import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as ASOnOffOptionalStyleCharacteristic from '@parischap/ansi-styles/ASOnOffOptionalStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';

describe('ASOnOffOptionalStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASOnOffOptionalStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
