import { pipe } from 'effect';
import * as Option from 'effect/Option';

import * as ASStyle from '@parischap/ansi-styles/ASStyle';
import * as ASStyleCharacteristics from '@parischap/ansi-styles/ASStyleCharacteristics';
import * as ASText from '@parischap/ansi-styles/ASText';
import * as ASThreeBitColor from '@parischap/ansi-styles/ASThreeBitColor';
import * as TestUtils from '@parischap/configs/TestUtils';

import { assert, describe, it } from '@effect/vitest';

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
        assert.strictEqual(boldRed1.toString(), 'BoldRed');
      });
      it('bold before red', () => {
        assert.strictEqual(boldRed2.toString(), 'BoldRed');
      });
      it('Other than color', () => {
        assert.strictEqual(ASStyle.struckThrough.toString(), 'StruckThrough');
      });
      it('Default foreground color', () => {
        assert.strictEqual(ASStyle.defaultColor.toString(), 'DefaultColor');
      });
      it('Default background color', () => {
        assert.strictEqual(ASStyle.bgDefaultColor.toString(), 'InDefaultColor');
      });
    });
  });

  it('mergeOver', () => {
    assert.strictEqual(
      pipe(
        ASStyle.green,
        ASStyle.mergeOver(ASStyle.blinking),
        ASStyle.mergeOver(ASStyle.brightBlack),
      ).toString(),
      'BlinkingBrightBlack',
    );
  });

  it('mergeUnder', () => {
    assert.strictEqual(
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
    assert.isTrue(ASStyle.equivalence(boldRed1, boldRed2));
    assert.isFalse(ASStyle.equivalence(ASStyle.red, ASStyle.bold));
    assert.isTrue(ASStyle.equivalence(ASStyle.none, ASStyle.none));
  });

  it('Action', () => {
    TestUtils.assertEquals(
      bold('foo'),
      ASText.fromStyleAndElems(ASStyleCharacteristics.bold)('foo'),
    );
  });

  it('toString on none', () => {
    assert.strictEqual(ASStyle.none.toString(), 'NoStyle');
  });

  it('color constructor', () => {
    const greenStyle = ASStyle.color(ASThreeBitColor.green);
    assert.strictEqual(greenStyle.toString(), 'Green');
    assert.isTrue(ASText.isNotEmpty(greenStyle('foo')));
  });

  it('bgColor constructor', () => {
    const bgGreenStyle = ASStyle.bgColor(ASThreeBitColor.green);
    assert.strictEqual(bgGreenStyle.toString(), 'InGreen');
    assert.isTrue(ASText.isNotEmpty(bgGreenStyle('foo')));
  });
});
