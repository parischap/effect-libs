import { ASStyleCharacteristicColor } from '@parischap/ansi-styles/tests';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristicColor', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristicColor.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
