import * as ASItalicStyleCharacteristic from '@parischap/ansi-styles/ASItalicStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

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
