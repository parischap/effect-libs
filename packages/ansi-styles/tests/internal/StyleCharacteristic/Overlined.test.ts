import * as ASStyleCharacteristicOverlined from '@parischap/ansi-styles/ASStyleCharacteristicOverlined';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristicOverlined', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristicOverlined.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASStyleCharacteristicOverlined.on.toString(), 'Overlined');
    TestUtils.assertEquals(ASStyleCharacteristicOverlined.off.toString(), 'NotOverlined');
    TestUtils.assertEquals(ASStyleCharacteristicOverlined.missing.toString(), '');
  });
});
