import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as ASHiddenStyleCharacteristic from '@parischap/ansi-styles/ASHiddenStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';

describe('ASHiddenStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASHiddenStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASHiddenStyleCharacteristic.on.toString(), 'Hidden');
    TestUtils.assertEquals(ASHiddenStyleCharacteristic.off.toString(), 'NotHidden');
    TestUtils.assertEquals(ASHiddenStyleCharacteristic.missing.toString(), '');
  });
});
