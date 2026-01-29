import { ASStyleCharacteristicHidden } from '@parischap/ansi-styles/tests';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristicHidden', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristicHidden.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASStyleCharacteristicHidden.on.toString(), 'Hidden');
    TestUtils.assertEquals(ASStyleCharacteristicHidden.off.toString(), 'NotHidden');
    TestUtils.assertEquals(ASStyleCharacteristicHidden.missing.toString(), '');
  });
});
