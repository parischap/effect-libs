import { ASRgbColor } from '@parischap/ansi-styles';
import * as ASBackgroundColorStyleCharacteristic from '@parischap/ansi-styles/ASBackgroundColorStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASBackgroundColorStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASBackgroundColorStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(
      ASBackgroundColorStyleCharacteristic.fromColor(ASRgbColor.red).toString(),
      'InRgbRed',
    );
    TestUtils.assertEquals(
      ASBackgroundColorStyleCharacteristic.defaultColor.toString(),
      'InDefaultColor',
    );
    TestUtils.assertEquals(ASBackgroundColorStyleCharacteristic.missing.toString(), '');
  });
});
