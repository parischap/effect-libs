import { pipe } from 'effect';
import * as Option from 'effect/Option';

import * as ASStyle from '@parischap/ansi-styles/ASStyle';
import * as ASStyleCharacteristics from '@parischap/ansi-styles/ASStyleCharacteristics';
import * as ASText from '@parischap/ansi-styles/ASText';
import * as ASThreeBitColor from '@parischap/ansi-styles/ASThreeBitColor';
import * as TestUtils from '@parischap/configs/TestUtils';

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

  it('style getter', () => {
    TestUtils.assertEquals(ASStyle.style(ASStyle.bold), ASStyleCharacteristics.bold);
    TestUtils.assertEquals(
      ASStyle.style(boldRed1),
      ASStyleCharacteristics.mergeOver(ASStyleCharacteristics.bold)(ASStyleCharacteristics.red),
    );
  });

  it('equivalence', () => {
    TestUtils.assertTrue(ASStyle.equivalence(boldRed1, boldRed2));
    TestUtils.assertFalse(ASStyle.equivalence(ASStyle.red, ASStyle.bold));
    TestUtils.assertTrue(ASStyle.equivalence(ASStyle.none, ASStyle.none));
  });

  it('Action', () => {
    TestUtils.assertEquals(
      bold('foo'),
      ASText.fromStyleAndElems(ASStyleCharacteristics.bold)('foo'),
    );
  });

  it('toString on none', () => {
    TestUtils.strictEqual(ASStyle.none.toString(), 'NoStyle');
  });

  it('color constructor', () => {
    const greenStyle = ASStyle.color(ASThreeBitColor.green);
    TestUtils.strictEqual(greenStyle.toString(), 'Green');
    TestUtils.assertTrue(ASText.isNotEmpty(greenStyle('foo')));
  });

  it('bgColor constructor', () => {
    const bgGreenStyle = ASStyle.bgColor(ASThreeBitColor.green);
    TestUtils.strictEqual(bgGreenStyle.toString(), 'InGreen');
    TestUtils.assertTrue(ASText.isNotEmpty(bgGreenStyle('foo')));
  });
});
