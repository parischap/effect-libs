import { ASColorRgb } from '@parischap/ansi-styles';
import {
  ASSequence,
  ASStyleCharacteristicBackgroundColor,
  ASStyleCharacteristicBlinking,
  ASStyleCharacteristicBold,
  ASStyleCharacteristicDim,
  ASStyleCharacteristicForegroundColor,
  ASStyleCharacteristicHidden,
  ASStyleCharacteristicInversed,
  ASStyleCharacteristicItalic,
  ASStyleCharacteristicOverlined,
  ASStyleCharacteristicPresentOrMissing,
  ASStyleCharacteristicStruckThrough,
  ASStyleCharacteristicUnderlined,
} from '@parischap/ansi-styles/tests';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristicPresentOrMissing', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristicPresentOrMissing.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('toSequence', () => {
    it('ASStyleCharacteristicBlinking', () => {
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicBlinking.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicBlinking.on),
        ASSequence.blinking,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicBlinking.off),
        ASSequence.notBlinking,
      );
    });
    it('ASStyleCharacteristicBold', () => {
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicBold.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicBold.on),
        ASSequence.bold,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicBold.off),
        ASSequence.notBoldNotDim,
      );
    });
    it('ASStyleCharacteristicDim', () => {
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicDim.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicDim.on),
        ASSequence.dim,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicDim.off),
        ASSequence.notBoldNotDim,
      );
    });
    it('ASStyleCharacteristicHidden', () => {
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicHidden.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicHidden.on),
        ASSequence.hidden,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicHidden.off),
        ASSequence.notHidden,
      );
    });
    it('ASStyleCharacteristicInversed', () => {
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicInversed.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicInversed.on),
        ASSequence.inversed,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicInversed.off),
        ASSequence.notInversed,
      );
    });
    it('ASStyleCharacteristicItalic', () => {
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicItalic.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicItalic.on),
        ASSequence.italic,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicItalic.off),
        ASSequence.notItalic,
      );
    });
    it('ASStyleCharacteristicOverlined', () => {
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicOverlined.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicOverlined.on),
        ASSequence.overlined,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicOverlined.off),
        ASSequence.notOverlined,
      );
    });
    it('ASStyleCharacteristicStruckThrough', () => {
      (TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(
          ASStyleCharacteristicStruckThrough.missing,
        ),
        ASSequence.empty,
      ),
        TestUtils.assertEquals(
          ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicStruckThrough.on),
          ASSequence.struckThrough,
        ));
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicStruckThrough.off),
        ASSequence.notStruckThrough,
      );
    });
    it('ASStyleCharacteristicUnderlined', () => {
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicUnderlined.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicUnderlined.on),
        ASSequence.underlined,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(ASStyleCharacteristicUnderlined.off),
        ASSequence.notUnderlined,
      );
    });
    it('ASStyleCharacteristicForegroundColor', () => {
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(
          ASStyleCharacteristicForegroundColor.missing,
        ),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(
          ASStyleCharacteristicForegroundColor.defaultColor,
        ),
        ASSequence.defaultForegroundColor,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(
          ASStyleCharacteristicForegroundColor.fromColor(ASColorRgb.Red),
        ),
        [38, 2, 255, 0, 0],
      );
    });
    it('ASStyleCharacteristicBackgroundColor', () => {
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(
          ASStyleCharacteristicBackgroundColor.missing,
        ),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(
          ASStyleCharacteristicBackgroundColor.defaultColor,
        ),
        ASSequence.defaultBackgroundColor,
      );
      TestUtils.assertEquals(
        ASStyleCharacteristicPresentOrMissing.toSequence(
          ASStyleCharacteristicBackgroundColor.fromColor(ASColorRgb.Red),
        ),
        [48, 2, 255, 0, 0],
      );
    });
  });

  it('PresentOrElse', () => {
    TestUtils.assertEquals(
      ASStyleCharacteristicPresentOrMissing.PresentOrElse(
        ASStyleCharacteristicBold.on,
        ASStyleCharacteristicBold.off,
      ),
      ASStyleCharacteristicBold.on,
    );
    TestUtils.assertEquals(
      ASStyleCharacteristicPresentOrMissing.PresentOrElse(
        ASStyleCharacteristicBold.off,
        ASStyleCharacteristicBold.missing,
      ),
      ASStyleCharacteristicBold.off,
    );
    TestUtils.assertEquals(
      ASStyleCharacteristicPresentOrMissing.PresentOrElse(
        ASStyleCharacteristicBold.missing,
        ASStyleCharacteristicBold.off,
      ),
      ASStyleCharacteristicBold.off,
    );
    TestUtils.assertEquals(
      ASStyleCharacteristicPresentOrMissing.PresentOrElse(
        ASStyleCharacteristicBold.missing,
        ASStyleCharacteristicBold.missing,
      ),
      ASStyleCharacteristicBold.missing,
    );
  });
  it('orWhenEquals', () => {
    TestUtils.assertEquals(
      ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        ASStyleCharacteristicBold.on,
        ASStyleCharacteristicBold.off,
        ASStyleCharacteristicBold.missing,
      ),
      ASStyleCharacteristicBold.on,
    );
    TestUtils.assertEquals(
      ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        ASStyleCharacteristicBold.on,
        ASStyleCharacteristicBold.on,
        ASStyleCharacteristicBold.missing,
      ),
      ASStyleCharacteristicBold.missing,
    );
    TestUtils.assertEquals(
      ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        ASStyleCharacteristicBold.off,
        ASStyleCharacteristicBold.off,
        ASStyleCharacteristicBold.missing,
      ),
      ASStyleCharacteristicBold.missing,
    );
    TestUtils.assertEquals(
      ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        ASStyleCharacteristicBold.missing,
        ASStyleCharacteristicBold.off,
        ASStyleCharacteristicBold.off,
      ),
      ASStyleCharacteristicBold.missing,
    );
  });
});
