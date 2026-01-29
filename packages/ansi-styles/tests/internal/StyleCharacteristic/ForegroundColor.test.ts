import { ASColorRgb } from '@parischap/ansi-styles';
import { ASStyleCharacteristicForegroundColor } from '@parischap/ansi-styles/tests';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristicForegroundColor', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristicForegroundColor.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.assertEquals(
      ASStyleCharacteristicForegroundColor.fromColor(ASColorRgb.Red).toString(),
      'RgbRed',
    );
    TestUtils.assertEquals(
      ASStyleCharacteristicForegroundColor.defaultColor.toString(),
      'DefaultColor',
    );
    TestUtils.assertEquals(ASStyleCharacteristicForegroundColor.missing.toString(), '');
  });
});
