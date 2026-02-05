import * as ASStyleCharacteristicOnOffOrMissing from '@parischap/ansi-styles/ASStyleCharacteristicOnOffOrMissing';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristicOnOffOrMissing', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristicOnOffOrMissing.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
