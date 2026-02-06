import { ASRgbColor } from '@parischap/ansi-styles';
import * as ASBackgroundColorStyleCharacteristic from '@parischap/ansi-styles/ASBackgroundColorStyleCharacteristic';
import * as ASBlinkingStyleCharacteristic from '@parischap/ansi-styles/ASBlinkingStyleCharacteristic';
import * as ASBoldStyleCharacteristic from '@parischap/ansi-styles/ASBoldStyleCharacteristic';
import * as ASDimStyleCharacteristic from '@parischap/ansi-styles/ASDimStyleCharacteristic';
import * as ASForegroundColorStyleCharacteristic from '@parischap/ansi-styles/ASForegroundColorStyleCharacteristic';
import * as ASHiddenStyleCharacteristic from '@parischap/ansi-styles/ASHiddenStyleCharacteristic';
import * as ASInversedStyleCharacteristic from '@parischap/ansi-styles/ASInversedStyleCharacteristic';
import * as ASItalicStyleCharacteristic from '@parischap/ansi-styles/ASItalicStyleCharacteristic';
import * as ASOptionalStyleCharacteristic from '@parischap/ansi-styles/ASOptionalStyleCharacteristic';
import * as ASOverlinedStyleCharacteristic from '@parischap/ansi-styles/ASOverlinedStyleCharacteristic';
import * as ASSequence from '@parischap/ansi-styles/ASSequence';
import * as ASStruckThroughStyleCharacteristic from '@parischap/ansi-styles/ASStruckThroughStyleCharacteristic';
import * as ASUnderlinedStyleCharacteristic from '@parischap/ansi-styles/ASUnderlinedStyleCharacteristic';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASOptionalStyleCharacteristic', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASOptionalStyleCharacteristic.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('toSequence', () => {
    it('ASBlinkingStyleCharacteristic', () => {
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASBlinkingStyleCharacteristic.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASBlinkingStyleCharacteristic.on),
        ASSequence.blinking,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASBlinkingStyleCharacteristic.off),
        ASSequence.notBlinking,
      );
    });
    it('ASBoldStyleCharacteristic', () => {
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASBoldStyleCharacteristic.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASBoldStyleCharacteristic.on),
        ASSequence.bold,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASBoldStyleCharacteristic.off),
        ASSequence.notBoldNotDim,
      );
    });
    it('ASDimStyleCharacteristic', () => {
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASDimStyleCharacteristic.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASDimStyleCharacteristic.on),
        ASSequence.dim,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASDimStyleCharacteristic.off),
        ASSequence.notBoldNotDim,
      );
    });
    it('ASHiddenStyleCharacteristic', () => {
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASHiddenStyleCharacteristic.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASHiddenStyleCharacteristic.on),
        ASSequence.hidden,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASHiddenStyleCharacteristic.off),
        ASSequence.notHidden,
      );
    });
    it('ASInversedStyleCharacteristic', () => {
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASInversedStyleCharacteristic.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASInversedStyleCharacteristic.on),
        ASSequence.inversed,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASInversedStyleCharacteristic.off),
        ASSequence.notInversed,
      );
    });
    it('ASItalicStyleCharacteristic', () => {
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASItalicStyleCharacteristic.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASItalicStyleCharacteristic.on),
        ASSequence.italic,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASItalicStyleCharacteristic.off),
        ASSequence.notItalic,
      );
    });
    it('ASOverlinedStyleCharacteristic', () => {
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASOverlinedStyleCharacteristic.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASOverlinedStyleCharacteristic.on),
        ASSequence.overlined,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASOverlinedStyleCharacteristic.off),
        ASSequence.notOverlined,
      );
    });
    it('ASStruckThroughStyleCharacteristic', () => {
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASStruckThroughStyleCharacteristic.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASStruckThroughStyleCharacteristic.on),
        ASSequence.struckThrough,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASStruckThroughStyleCharacteristic.off),
        ASSequence.notStruckThrough,
      );
    });
    it('ASUnderlinedStyleCharacteristic', () => {
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASUnderlinedStyleCharacteristic.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASUnderlinedStyleCharacteristic.on),
        ASSequence.underlined,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASUnderlinedStyleCharacteristic.off),
        ASSequence.notUnderlined,
      );
    });
    it('ASForegroundColorStyleCharacteristic', () => {
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASForegroundColorStyleCharacteristic.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASForegroundColorStyleCharacteristic.defaultColor),
        ASSequence.defaultForegroundColor,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(
          ASForegroundColorStyleCharacteristic.fromColor(ASRgbColor.red),
        ),
        [38, 2, 255, 0, 0],
      );
    });
    it('ASBackgroundColorStyleCharacteristic', () => {
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASBackgroundColorStyleCharacteristic.missing),
        ASSequence.empty,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(ASBackgroundColorStyleCharacteristic.defaultColor),
        ASSequence.defaultBackgroundColor,
      );
      TestUtils.assertEquals(
        ASOptionalStyleCharacteristic.toSequence(
          ASBackgroundColorStyleCharacteristic.fromColor(ASRgbColor.red),
        ),
        [48, 2, 255, 0, 0],
      );
    });
  });

  it('PresentOrElse', () => {
    TestUtils.assertEquals(
      ASOptionalStyleCharacteristic.PresentOrElse(
        ASBoldStyleCharacteristic.on,
        ASBoldStyleCharacteristic.off,
      ),
      ASBoldStyleCharacteristic.on,
    );
    TestUtils.assertEquals(
      ASOptionalStyleCharacteristic.PresentOrElse(
        ASBoldStyleCharacteristic.off,
        ASBoldStyleCharacteristic.missing,
      ),
      ASBoldStyleCharacteristic.off,
    );
    TestUtils.assertEquals(
      ASOptionalStyleCharacteristic.PresentOrElse(
        ASBoldStyleCharacteristic.missing,
        ASBoldStyleCharacteristic.off,
      ),
      ASBoldStyleCharacteristic.off,
    );
    TestUtils.assertEquals(
      ASOptionalStyleCharacteristic.PresentOrElse(
        ASBoldStyleCharacteristic.missing,
        ASBoldStyleCharacteristic.missing,
      ),
      ASBoldStyleCharacteristic.missing,
    );
  });
  it('orWhenEquals', () => {
    TestUtils.assertEquals(
      ASOptionalStyleCharacteristic.orWhenEquals(
        ASBoldStyleCharacteristic.on,
        ASBoldStyleCharacteristic.off,
        ASBoldStyleCharacteristic.missing,
      ),
      ASBoldStyleCharacteristic.on,
    );
    TestUtils.assertEquals(
      ASOptionalStyleCharacteristic.orWhenEquals(
        ASBoldStyleCharacteristic.on,
        ASBoldStyleCharacteristic.on,
        ASBoldStyleCharacteristic.missing,
      ),
      ASBoldStyleCharacteristic.missing,
    );
    TestUtils.assertEquals(
      ASOptionalStyleCharacteristic.orWhenEquals(
        ASBoldStyleCharacteristic.off,
        ASBoldStyleCharacteristic.off,
        ASBoldStyleCharacteristic.missing,
      ),
      ASBoldStyleCharacteristic.missing,
    );
    TestUtils.assertEquals(
      ASOptionalStyleCharacteristic.orWhenEquals(
        ASBoldStyleCharacteristic.missing,
        ASBoldStyleCharacteristic.off,
        ASBoldStyleCharacteristic.off,
      ),
      ASBoldStyleCharacteristic.missing,
    );
  });
});
