import * as ASInversedStyleCharacteristic from '@parischap/ansi-styles/ASInversedStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

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
