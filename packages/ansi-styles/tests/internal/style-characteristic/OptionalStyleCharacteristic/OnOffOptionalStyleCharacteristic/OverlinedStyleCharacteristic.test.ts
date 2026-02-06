import * as ASOverlinedStyleCharacteristic from '@parischap/ansi-styles/ASOverlinedStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

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
