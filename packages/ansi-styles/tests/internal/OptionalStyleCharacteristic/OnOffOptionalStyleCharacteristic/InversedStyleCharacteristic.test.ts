import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as ASInversedStyleCharacteristic from '@parischap/ansi-styles/ASInversedStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';

describe('ASInversedStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASInversedStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASInversedStyleCharacteristic.on.toString(), 'Inversed');
    TestUtils.assertEquals(ASInversedStyleCharacteristic.off.toString(), 'NotInversed');
    TestUtils.assertEquals(ASInversedStyleCharacteristic.missing.toString(), '');
  });
});
