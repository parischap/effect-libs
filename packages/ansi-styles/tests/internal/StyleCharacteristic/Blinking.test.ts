import { ASStyleCharacteristicBlinking } from '@parischap/ansi-styles/tests';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristicBlinking', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristicBlinking.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASStyleCharacteristicBlinking.on.toString(), 'Blinking');
    TestUtils.assertEquals(ASStyleCharacteristicBlinking.off.toString(), 'NotBlinking');
    TestUtils.assertEquals(ASStyleCharacteristicBlinking.missing.toString(), '');
  });
});
