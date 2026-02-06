import * as ASDimStyleCharacteristic from '@parischap/ansi-styles/ASDimStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASDimStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASDimStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
  it('.toString()', () => {
    TestUtils.assertEquals(ASDimStyleCharacteristic.on.toString(), 'Dim');
    TestUtils.assertEquals(ASDimStyleCharacteristic.off.toString(), 'NotDim');
    TestUtils.assertEquals(ASDimStyleCharacteristic.missing.toString(), '');
  });
});
