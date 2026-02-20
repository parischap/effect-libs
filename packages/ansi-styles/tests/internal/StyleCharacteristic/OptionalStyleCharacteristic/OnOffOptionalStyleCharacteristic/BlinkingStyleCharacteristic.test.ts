import * as ASBlinkingStyleCharacteristic from '@parischap/ansi-styles/ASBlinkingStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('ASBlinkingStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASBlinkingStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASBlinkingStyleCharacteristic.on.toString(), 'Blinking');
    TestUtils.assertEquals(ASBlinkingStyleCharacteristic.off.toString(), 'NotBlinking');
    TestUtils.assertEquals(ASBlinkingStyleCharacteristic.missing.toString(), '');
  });
});
