import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as ASItalicStyleCharacteristic from '@parischap/ansi-styles/ASItalicStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';

describe('ASItalicStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASItalicStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASItalicStyleCharacteristic.on.toString(), 'Italic');
    TestUtils.assertEquals(ASItalicStyleCharacteristic.off.toString(), 'NotItalic');
    TestUtils.assertEquals(ASItalicStyleCharacteristic.missing.toString(), '');
  });
});
