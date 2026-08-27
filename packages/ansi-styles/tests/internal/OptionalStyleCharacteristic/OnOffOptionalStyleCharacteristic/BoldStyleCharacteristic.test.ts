import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as ASBoldStyleCharacteristic from '@parischap/ansi-styles/ASBoldStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';

describe('ASBoldStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASBoldStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
  it('.toString()', () => {
    TestUtils.assertEquals(ASBoldStyleCharacteristic.on.toString(), 'Bold');
    TestUtils.assertEquals(ASBoldStyleCharacteristic.off.toString(), 'NotBold');
    TestUtils.assertEquals(ASBoldStyleCharacteristic.missing.toString(), '');
  });
});
