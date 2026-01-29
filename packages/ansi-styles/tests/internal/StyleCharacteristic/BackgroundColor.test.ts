import { ASColorRgb } from '@parischap/ansi-styles';
import { ASStyleCharacteristicBackgroundColor } from '@parischap/ansi-styles/tests';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristicBackgroundColor', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristicBackgroundColor.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(
      ASStyleCharacteristicBackgroundColor.fromColor(ASColorRgb.Red).toString(),
      'InRgbRed',
    );
    TestUtils.assertEquals(
      ASStyleCharacteristicBackgroundColor.defaultColor.toString(),
      'InDefaultColor',
    );
    TestUtils.assertEquals(ASStyleCharacteristicBackgroundColor.missing.toString(), '');
  });
});
