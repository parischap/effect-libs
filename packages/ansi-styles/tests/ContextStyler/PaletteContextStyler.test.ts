import * as ASContextStyler from '@parischap/ansi-styles/ASContextStyler'
import * as ASPalette from '@parischap/ansi-styles/ASPalette'
import * as ASPaletteContextStyler from '@parischap/ansi-styles/ASPaletteContextStyler'
import * as ASStyleCharacteristics from '@parischap/ansi-styles/ASStyleCharacteristics';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('ASContextStylerWheel', () => {
  interface Value {
    readonly pos1: number;
    readonly otherStuff: string;
  }

  const pos1 = (value: Value): number => value.pos1;

  const pos1BasedAllColorsFormatter = ASPaletteContextStyler.make({
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

  const pos1BasedAllColorsFormatterInValue1Context = ASContextStyler.toStyle(
    pos1BasedAllColorsFormatter,
  )(value1);
  const pos1BasedAllColorsFormatterInValue2Context = ASContextStyler.toStyle(
    pos1BasedAllColorsFormatter,
  )(value2);

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASPaletteContextStyler.moduleTag),
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
