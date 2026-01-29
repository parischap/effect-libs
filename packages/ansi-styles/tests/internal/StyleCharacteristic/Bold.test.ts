import { ASStyleCharacteristicBold } from '@parischap/ansi-styles/tests';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristicBold', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristicBold.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
  it('.toString()', () => {
    TestUtils.assertEquals(ASStyleCharacteristicBold.on.toString(), 'Bold');
    TestUtils.assertEquals(ASStyleCharacteristicBold.off.toString(), 'NotBold');
    TestUtils.assertEquals(ASStyleCharacteristicBold.missing.toString(), '');
  });
});
