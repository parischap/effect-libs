import { pipe } from 'effect';
import * as Option from 'effect/Option';

import * as ASEightBitColor from '@parischap/ansi-styles/ASEightBitColor';
import * as ASStyleCharacteristics from '@parischap/ansi-styles/ASStyleCharacteristics';
import * as ASThreeBitColor from '@parischap/ansi-styles/ASThreeBitColor';
import * as TestUtils from '@parischap/configs/TestUtils';

import { assert, describe, it } from '@effect/vitest';

describe('ASStyleCharacteristics', () => {
  const boldItalic = pipe(
    ASStyleCharacteristics.bold,
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.italic),
  );
  const boldItalicBrightGreenInBlue = pipe(
    boldItalic,
    ASStyleCharacteristics.mergeUnder(
      ASStyleCharacteristics.fromColorAsForegroundColor(ASThreeBitColor.brightGreen),
    ),
    ASStyleCharacteristics.mergeUnder(
      ASStyleCharacteristics.fromColorAsBackgroundColor(ASEightBitColor.blue),
    ),
  );

  const notBoldNotDimRed = pipe(
    ASStyleCharacteristics.fromColorAsForegroundColor(ASThreeBitColor.red),
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notBold),
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notDim),
  );
  const boldNotDimRed = pipe(
    ASStyleCharacteristics.fromColorAsForegroundColor(ASThreeBitColor.red),
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.bold),
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notDim),
  );
  const notBoldDimRed = pipe(
    ASStyleCharacteristics.fromColorAsForegroundColor(ASThreeBitColor.red),
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notBold),
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.dim),
  );

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASStyleCharacteristics.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('hasBold', () => {
    assert.isTrue(ASStyleCharacteristics.hasBold(boldItalic));
    assert.isFalse(ASStyleCharacteristics.hasBold(ASStyleCharacteristics.none));
    assert.isFalse(ASStyleCharacteristics.hasBold(notBoldNotDimRed));
  });

  it('hasNotBold', () => {
    assert.isTrue(ASStyleCharacteristics.hasNotBold(notBoldNotDimRed));
    assert.isFalse(ASStyleCharacteristics.hasNotBold(boldItalic));
    assert.isFalse(ASStyleCharacteristics.hasNotBold(ASStyleCharacteristics.none));
  });

  it('hasDim', () => {
    assert.isTrue(ASStyleCharacteristics.hasDim(notBoldDimRed));
    assert.isFalse(ASStyleCharacteristics.hasDim(ASStyleCharacteristics.none));
    assert.isFalse(ASStyleCharacteristics.hasDim(notBoldNotDimRed));
  });

  it('hasNotDim', () => {
    assert.isTrue(ASStyleCharacteristics.hasNotDim(notBoldNotDimRed));
    assert.isFalse(ASStyleCharacteristics.hasNotDim(boldItalic));
    assert.isFalse(ASStyleCharacteristics.hasNotDim(ASStyleCharacteristics.none));
  });

  describe('toSequence', () => {
    it('none', () => {
      assert.deepStrictEqual(ASStyleCharacteristics.toSequence(ASStyleCharacteristics.none), []);
    });

    it('bold italic', () => {
      assert.deepStrictEqual(ASStyleCharacteristics.toSequence(boldItalic), [1, 3]);
    });

    it('Not bold not dim red', () => {
      assert.deepStrictEqual(ASStyleCharacteristics.toSequence(notBoldNotDimRed), [22, 31]);
    });

    it('Bold not dim red', () => {
      assert.deepStrictEqual(ASStyleCharacteristics.toSequence(boldNotDimRed), [22, 1, 31]);
    });

    it('Not bold dim red', () => {
      assert.deepStrictEqual(ASStyleCharacteristics.toSequence(notBoldDimRed), [22, 2, 31]);
    });

    it('Bold default background color', () => {
      assert.deepStrictEqual(
        pipe(
          ASStyleCharacteristics.bold,
          ASStyleCharacteristics.mergeOver(ASStyleCharacteristics.backgroundDefaultColor),
          ASStyleCharacteristics.toSequence,
        ),
        [1, 49],
      );
    });
  });

  it('mergeUnder', () => {
    assert.strictEqual(
      pipe(
        notBoldDimRed,
        ASStyleCharacteristics.mergeUnder(boldItalic),
        ASStyleCharacteristics.toString,
      ),
      'NotBoldDimItalicRed',
    );
  });

  it('mergeOver', () => {
    assert.strictEqual(
      pipe(
        notBoldDimRed,
        ASStyleCharacteristics.mergeOver(boldItalic),
        ASStyleCharacteristics.toString,
      ),
      'BoldDimItalicRed',
    );
  });

  describe('difference', () => {
    it('None with none', () => {
      assert.strictEqual(
        pipe(
          ASStyleCharacteristics.none,
          ASStyleCharacteristics.difference(ASStyleCharacteristics.none),
          ASStyleCharacteristics.toString,
        ),
        'NoStyle',
      );
    });

    it('Complex case 1', () => {
      assert.strictEqual(
        pipe(
          boldItalicBrightGreenInBlue,
          ASStyleCharacteristics.difference(boldNotDimRed),
          ASStyleCharacteristics.toString,
        ),
        'ItalicBrightGreenInEightBitBlue',
      );
    });

    it('Complex case 2', () => {
      assert.strictEqual(
        pipe(
          notBoldNotDimRed,
          ASStyleCharacteristics.difference(boldNotDimRed),
          ASStyleCharacteristics.toString,
        ),
        'NotBold',
      );
    });
  });

  it('substractContext', () => {
    assert.strictEqual(
      pipe(
        ASStyleCharacteristics.bold,
        ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notDim),
        ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.italic),
        ASStyleCharacteristics.subtractContext(ASStyleCharacteristics.bold),
        ASStyleCharacteristics.toString,
      ),
      'BoldNotDimItalic',
    );
  });
});
