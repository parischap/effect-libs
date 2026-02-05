import { ASStyle, ASText } from '@parischap/ansi-styles';
import * as ASStyleCharacteristics from '@parischap/ansi-styles/ASStyleCharacteristics';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyle', () => {
  const { red, bold } = ASStyle;

  const boldRed1 = pipe(red, ASStyle.mergeOver(bold));
  const boldRed2 = pipe(bold, ASStyle.mergeOver(red));

  describe('Tag, prototype and guards', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(ASStyle.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    describe('.toString()', () => {
      it('red before bold', () => {
        TestUtils.strictEqual(boldRed1.toString(), 'BoldRed');
      });
      it('bold before red', () => {
        TestUtils.strictEqual(boldRed2.toString(), 'BoldRed');
      });
      it('Other than color', () => {
        TestUtils.strictEqual(ASStyle.struckThrough.toString(), 'StruckThrough');
      });
      it('Default foreground color', () => {
        TestUtils.strictEqual(ASStyle.defaultColor.toString(), 'DefaultColor');
      });
      it('Default background color', () => {
        TestUtils.strictEqual(ASStyle.bgDefaultColor.toString(), 'InDefaultColor');
      });
    });
  });

  it('mergeOver', () => {
    TestUtils.strictEqual(
      pipe(
        ASStyle.green,
        ASStyle.mergeOver(ASStyle.blinking),
        ASStyle.mergeOver(ASStyle.brightBlack),
      ).toString(),
      'BlinkingBrightBlack',
    );
  });

  it('mergeUnder', () => {
    TestUtils.strictEqual(
      pipe(
        ASStyle.green,
        ASStyle.mergeUnder(ASStyle.blinking),
        ASStyle.mergeUnder(ASStyle.brightBlack),
      ).toString(),
      'BlinkingGreen',
    );
  });

  it('Action', () => {
    TestUtils.assertEquals(
      bold('foo'),
      ASText.fromStyleAndElems(ASStyleCharacteristics.bold)('foo'),
    );
  });
});
