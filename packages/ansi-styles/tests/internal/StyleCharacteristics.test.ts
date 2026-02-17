import * as ASEightBitColor from '@parischap/ansi-styles/ASEightBitColor'
import * as ASThreeBitColor from '@parischap/ansi-styles/ASThreeBitColor'
import * as ASStyleCharacteristics from '@parischap/ansi-styles/ASStyleCharacteristics';
import * as TestUtils from '@parischap/configs/TestUtils';
import {pipe} from 'effect'
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

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
    TestUtils.assertTrue(ASStyleCharacteristics.hasBold(boldItalic));
    TestUtils.assertFalse(ASStyleCharacteristics.hasBold(ASStyleCharacteristics.none));
    TestUtils.assertFalse(ASStyleCharacteristics.hasBold(notBoldNotDimRed));
  });

  it('hasNotBold', () => {
    TestUtils.assertTrue(ASStyleCharacteristics.hasNotBold(notBoldNotDimRed));
    TestUtils.assertFalse(ASStyleCharacteristics.hasNotBold(boldItalic));
    TestUtils.assertFalse(ASStyleCharacteristics.hasNotBold(ASStyleCharacteristics.none));
  });

  it('hasDim', () => {
    TestUtils.assertTrue(ASStyleCharacteristics.hasDim(notBoldDimRed));
    TestUtils.assertFalse(ASStyleCharacteristics.hasDim(ASStyleCharacteristics.none));
    TestUtils.assertFalse(ASStyleCharacteristics.hasDim(notBoldNotDimRed));
  });

  it('hasNotDim', () => {
    TestUtils.assertTrue(ASStyleCharacteristics.hasNotDim(notBoldNotDimRed));
    TestUtils.assertFalse(ASStyleCharacteristics.hasNotDim(boldItalic));
    TestUtils.assertFalse(ASStyleCharacteristics.hasNotDim(ASStyleCharacteristics.none));
  });

  describe('toSequence', () => {
    it('none', () => {
      TestUtils.deepStrictEqual(ASStyleCharacteristics.toSequence(ASStyleCharacteristics.none), []);
    });

    it('bold italic', () => {
      TestUtils.deepStrictEqual(ASStyleCharacteristics.toSequence(boldItalic), [1, 3]);
    });

    it('Not bold not dim red', () => {
      TestUtils.deepStrictEqual(ASStyleCharacteristics.toSequence(notBoldNotDimRed), [22, 31]);
    });

    it('Bold not dim red', () => {
      TestUtils.deepStrictEqual(ASStyleCharacteristics.toSequence(boldNotDimRed), [22, 1, 31]);
    });

    it('Not bold dim red', () => {
      TestUtils.deepStrictEqual(ASStyleCharacteristics.toSequence(notBoldDimRed), [22, 2, 31]);
    });

    it('Bold default background color', () => {
      TestUtils.deepStrictEqual(
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
    TestUtils.strictEqual(
      pipe(
        notBoldDimRed,
        ASStyleCharacteristics.mergeUnder(boldItalic),
        ASStyleCharacteristics.toString,
      ),
      'NotBoldDimItalicRed',
    );
  });

  it('mergeOver', () => {
    TestUtils.strictEqual(
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
      TestUtils.strictEqual(
        pipe(
          ASStyleCharacteristics.none,
          ASStyleCharacteristics.difference(ASStyleCharacteristics.none),
          ASStyleCharacteristics.toString,
        ),
        'NoStyle',
      );
    });

    it('Complex case 1', () => {
      TestUtils.strictEqual(
        pipe(
          boldItalicBrightGreenInBlue,
          ASStyleCharacteristics.difference(boldNotDimRed),
          ASStyleCharacteristics.toString,
        ),
        'ItalicBrightGreenInEightBitBlue',
      );
    });

    it('Complex case 2', () => {
      TestUtils.strictEqual(
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
    TestUtils.strictEqual(
      pipe(
        ASStyleCharacteristics.bold,
        ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notDim),
        ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.italic),
        ASStyleCharacteristics.substractContext(ASStyleCharacteristics.bold),
        ASStyleCharacteristics.toString,
      ),
      'BoldNotDimItalic',
    );
  });
});
