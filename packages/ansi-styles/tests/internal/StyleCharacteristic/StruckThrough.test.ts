import { ASStyleCharacteristicStruckThrough } from '@parischap/ansi-styles/tests';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristicStruckThrough', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristicStruckThrough.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASStyleCharacteristicStruckThrough.on.toString(), 'StruckThrough');
    TestUtils.assertEquals(ASStyleCharacteristicStruckThrough.off.toString(), 'NotStruckThrough');
    TestUtils.assertEquals(ASStyleCharacteristicStruckThrough.missing.toString(), '');
  });
});
