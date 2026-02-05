import * as ASStyleCharacteristicInversed from '@parischap/ansi-styles/ASStyleCharacteristicInversed';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristicInversed', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristicInversed.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASStyleCharacteristicInversed.on.toString(), 'Inversed');
    TestUtils.assertEquals(ASStyleCharacteristicInversed.off.toString(), 'NotInversed');
    TestUtils.assertEquals(ASStyleCharacteristicInversed.missing.toString(), '');
  });
});
