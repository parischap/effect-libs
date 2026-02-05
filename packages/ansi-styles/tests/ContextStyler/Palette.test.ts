import { ASContextStylerBase, ASContextStylerPalette, ASPalette } from '@parischap/ansi-styles';
import * as ASStyleCharacteristics from '@parischap/ansi-styles/ASStyleCharacteristics';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASContextStylerWheel', () => {
  interface Value {
    readonly pos1: number;
    readonly otherStuff: string;
  }

  const pos1 = (value: Value): number => value.pos1;

  const pos1BasedAllColorsFormatter = ASContextStylerPalette.make({
    indexFromContext: pos1,
    palette: ASPalette.allStandardOriginalColors,
  });

  const value1: Value = {
    pos1: 2,
    otherStuff: 'dummy',
  };

  const value2: Value = {
    pos1: 9,
    otherStuff: 'dummy',
  };

  const pos1BasedAllColorsFormatterInValue1Context = ASContextStylerBase.toStyle(
    pos1BasedAllColorsFormatter,
  )(value1);
  const pos1BasedAllColorsFormatterInValue2Context = ASContextStylerBase.toStyle(
    pos1BasedAllColorsFormatter,
  )(value2);

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASContextStylerPalette.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('.toString()', () => {
    TestUtils.strictEqual(
      pos1BasedAllColorsFormatter.toString(),
      'Pos1BasedBlack/Red/Green/Yellow/Blue/Magenta/Cyan/WhitePaletteStyler',
    );
  });

  describe('toStyle', () => {
    it('Within bounds', () => {
      TestUtils.assertEquals(
        pos1BasedAllColorsFormatterInValue1Context.style,
        ASStyleCharacteristics.green,
      );
    });

    it('Out of bounds', () => {
      TestUtils.assertEquals(
        pos1BasedAllColorsFormatterInValue2Context.style,
        ASStyleCharacteristics.red,
      );
    });
  });
});
