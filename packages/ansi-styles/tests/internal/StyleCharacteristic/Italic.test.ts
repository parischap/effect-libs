import { ASStyleCharacteristicItalic } from '@parischap/ansi-styles/tests';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristicItalic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristicItalic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASStyleCharacteristicItalic.on.toString(), 'Italic');
    TestUtils.assertEquals(ASStyleCharacteristicItalic.off.toString(), 'NotItalic');
    TestUtils.assertEquals(ASStyleCharacteristicItalic.missing.toString(), '');
  });
});
