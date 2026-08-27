import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as ASForegroundColorStyleCharacteristic from '@parischap/ansi-styles/ASForegroundColorStyleCharacteristic';
import * as ASRgbColor from '@parischap/ansi-styles/ASRgbColor';
import * as TestUtils from '@parischap/configs/TestUtils';

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
