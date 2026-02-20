import * as ASUnderlinedStyleCharacteristic from '@parischap/ansi-styles/ASUnderlinedStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('ASUnderlinedStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASUnderlinedStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASUnderlinedStyleCharacteristic.on.toString(), 'Underlined');
    TestUtils.assertEquals(ASUnderlinedStyleCharacteristic.off.toString(), 'NotUnderlined');
    TestUtils.assertEquals(ASUnderlinedStyleCharacteristic.missing.toString(), '');
  });
});
