import * as ASOnOffOptionalStyleCharacteristic from '@parischap/ansi-styles/ASOnOffOptionalStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('ASOnOffOptionalStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASOnOffOptionalStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
