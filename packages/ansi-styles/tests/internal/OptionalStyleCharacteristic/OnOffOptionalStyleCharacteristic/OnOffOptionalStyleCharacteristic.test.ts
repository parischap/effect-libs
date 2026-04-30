import * as Option from 'effect/Option';

import * as ASOnOffOptionalStyleCharacteristic from '@parischap/ansi-styles/ASOnOffOptionalStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';

import { describe, it } from 'vitest';

describe('ASOnOffOptionalStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASOnOffOptionalStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
