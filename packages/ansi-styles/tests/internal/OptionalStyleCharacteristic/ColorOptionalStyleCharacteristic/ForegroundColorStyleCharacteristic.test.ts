import * as Option from 'effect/Option';

import * as ASForegroundColorStyleCharacteristic from '@parischap/ansi-styles/ASForegroundColorStyleCharacteristic';
import * as ASRgbColor from '@parischap/ansi-styles/ASRgbColor';
import * as TestUtils from '@parischap/configs/TestUtils';

import { describe, it } from 'vitest';

describe('ASForegroundColorStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASForegroundColorStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(
      ASForegroundColorStyleCharacteristic.fromColor(ASRgbColor.red).toString(),
      'RgbRed',
    );
    TestUtils.assertEquals(
      ASForegroundColorStyleCharacteristic.defaultColor.toString(),
      'DefaultColor',
    );
    TestUtils.assertEquals(ASForegroundColorStyleCharacteristic.missing.toString(), '');
  });
});
