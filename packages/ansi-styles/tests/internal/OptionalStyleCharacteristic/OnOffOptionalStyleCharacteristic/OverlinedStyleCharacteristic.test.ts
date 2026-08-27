import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as ASOverlinedStyleCharacteristic from '@parischap/ansi-styles/ASOverlinedStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';

describe('ASOverlinedStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASOverlinedStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASOverlinedStyleCharacteristic.on.toString(), 'Overlined');
    TestUtils.assertEquals(ASOverlinedStyleCharacteristic.off.toString(), 'NotOverlined');
    TestUtils.assertEquals(ASOverlinedStyleCharacteristic.missing.toString(), '');
  });
});
