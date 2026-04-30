import * as Option from 'effect/Option';

import * as ASContextStyler from '@parischap/ansi-styles/ASContextStyler';
import * as ASPalette from '@parischap/ansi-styles/ASPalette';
import * as ASStyleCharacteristics from '@parischap/ansi-styles/ASStyleCharacteristics';
import * as TestUtils from '@parischap/configs/TestUtils';

import { describe, it } from 'vitest';

describe('ASContextStyler', () => {
  interface Value {
    readonly pos1: number;
    readonly otherStuff: string;
  }

  const value1: Value = {
    pos1: 2,
    otherStuff: 'dummy',
  };

  const value2: Value = {
    pos1: 9,
    otherStuff: 'dummy',
  };

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASContextStyler.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('makeConstant', () => {
    const { red }: { readonly red: ASContextStyler.Type<Value> } = ASContextStyler;

    it('.toString()', () => {
      TestUtils.strictEqual(red.toString(), 'RedStyler');
    });

    it('toStyle', () => {
      TestUtils.assertEquals(ASContextStyler.style(red)(value1).style, ASStyleCharacteristics.red);
    });
  });

  describe('makePaletteBased', () => {
    const pos1 = (value: Value): number => value.pos1;

    const pos1BasedAllColorsFormatter = ASContextStyler.makePaletteBased({
      indexFromContext: pos1,
      palette: ASPalette.allStandardOriginalColors,
    });

    const pos1BasedAllColorsFormatterInValue1Context = ASContextStyler.style(
      pos1BasedAllColorsFormatter,
    )(value1);
    const pos1BasedAllColorsFormatterInValue2Context = ASContextStyler.style(
      pos1BasedAllColorsFormatter,
    )(value2);

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
});
