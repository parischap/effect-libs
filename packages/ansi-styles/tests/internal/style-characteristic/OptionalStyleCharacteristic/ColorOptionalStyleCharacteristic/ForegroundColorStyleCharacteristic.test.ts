import { ASRgbColor } from '@parischap/ansi-styles';
import * as ASForegroundColorStyleCharacteristic from '@parischap/ansi-styles/ASForegroundColorStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
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
