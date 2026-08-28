import { describe, it } from '@effect/vitest';
import * as Option from 'effect/Option';

import * as ASStruckThroughStyleCharacteristic from '@parischap/ansi-styles/ASStruckThroughStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';

describe('ASStruckThroughStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStruckThroughStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(ASStruckThroughStyleCharacteristic.on.toString(), 'StruckThrough');
    TestUtils.assertEquals(ASStruckThroughStyleCharacteristic.off.toString(), 'NotStruckThrough');
    TestUtils.assertEquals(ASStruckThroughStyleCharacteristic.missing.toString(), '');
  });
});
