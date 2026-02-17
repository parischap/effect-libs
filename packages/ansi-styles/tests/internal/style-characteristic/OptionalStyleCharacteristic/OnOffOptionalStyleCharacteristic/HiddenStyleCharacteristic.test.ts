import * as ASHiddenStyleCharacteristic from '@parischap/ansi-styles/ASHiddenStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('ASHiddenStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASHiddenStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASHiddenStyleCharacteristic.on.toString(), 'Hidden');
    TestUtils.assertEquals(ASHiddenStyleCharacteristic.off.toString(), 'NotHidden');
    TestUtils.assertEquals(ASHiddenStyleCharacteristic.missing.toString(), '');
  });
});
