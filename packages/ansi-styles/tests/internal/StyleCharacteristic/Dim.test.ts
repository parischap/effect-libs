import * as ASStyleCharacteristicDim from '@parischap/ansi-styles/ASStyleCharacteristicDim';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristicDim', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristicDim.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
  it('.toString()', () => {
    TestUtils.assertEquals(ASStyleCharacteristicDim.on.toString(), 'Dim');
    TestUtils.assertEquals(ASStyleCharacteristicDim.off.toString(), 'NotDim');
    TestUtils.assertEquals(ASStyleCharacteristicDim.missing.toString(), '');
  });
});
