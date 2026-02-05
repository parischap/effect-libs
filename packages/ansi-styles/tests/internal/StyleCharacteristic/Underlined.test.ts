import * as ASStyleCharacteristicUnderlined from '@parischap/ansi-styles/ASStyleCharacteristicUnderlined';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristicUnderlined', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristicUnderlined.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASStyleCharacteristicUnderlined.on.toString(), 'Underlined');
    TestUtils.assertEquals(ASStyleCharacteristicUnderlined.off.toString(), 'NotUnderlined');
    TestUtils.assertEquals(ASStyleCharacteristicUnderlined.missing.toString(), '');
  });
});
