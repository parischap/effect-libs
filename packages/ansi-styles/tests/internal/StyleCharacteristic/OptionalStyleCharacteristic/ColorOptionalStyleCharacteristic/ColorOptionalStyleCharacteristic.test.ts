import * as ASColorOptionalStyleCharacteristic from '@parischap/ansi-styles/ASColorOptionalStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as Option from 'effect/Option';
import { describe, it } from 'vitest';

describe('ASColorOptionalStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASColorOptionalStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
