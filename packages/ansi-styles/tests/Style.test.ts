import { ASStyle, ASStyleCharacteristics, ASText } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { pipe } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyle', () => {
  const { red, bold } = ASStyle;
  const boldRed1 = pipe(red, ASStyle.mergeOver(bold));
  const boldRed2 = pipe(bold, ASStyle.mergeOver(red));

  describe('Tag, prototype and guards', () => {
    it('moduleTag', () => {
      TestUtils.assertSome(TestUtils.moduleTagFromTestFilePath(__filename), ASStyle.moduleTag);
    });

    describe('Equal.equals', () => {
      it('Matching', () => {
        TestUtils.assertEquals(ASStyle.none, ASStyle.none);
        TestUtils.assertEquals(boldRed1, boldRed2);
      });

      it('Non-matching', () => {
        TestUtils.assertNotEquals(boldRed2, bold);
      });
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
        TestUtils.strictEqual(ASStyle.Bg.defaultColor.toString(), 'InDefaultColor');
      });
    });

    it('.pipe()', () => {
      TestUtils.strictEqual(boldRed1.pipe(ASStyle.toString), 'BoldRed');
    });

    describe('has', () => {
      it('Matching', () => {
        TestUtils.assertTrue(ASStyle.has(boldRed2));
      });
      it('Non matching', () => {
        TestUtils.assertFalse(ASStyle.has(new Date()));
      });
    });
  });

  it('mergeOver', () => {
    TestUtils.strictEqual(
      pipe(
        ASStyle.green,
        ASStyle.mergeOver(ASStyle.blinking),
        ASStyle.mergeOver(ASStyle.Bright.black),
      ).toString(),
      'BlinkingBrightBlack',
    );
  });

  it('mergeUnder', () => {
    TestUtils.strictEqual(
      pipe(
        ASStyle.green,
        ASStyle.mergeUnder(ASStyle.blinking),
        ASStyle.mergeUnder(ASStyle.Bright.black),
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
