import { ASColor, ASStyleCharacteristics } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { pipe } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyleCharacteristics', () => {
  const boldItalic = pipe(
    ASStyleCharacteristics.bold,
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.italic),
  );
  const boldItalicBrightGreenInBlue = pipe(
    boldItalic,
    ASStyleCharacteristics.mergeUnder(
      ASStyleCharacteristics.fromColorAsForegroundColor(ASColor.threeBitBrightGreen),
    ),
    ASStyleCharacteristics.mergeUnder(
      ASStyleCharacteristics.fromColorAsBackgroundColor(ASColor.eightBitBlue),
    ),
  );
  const bold1 = pipe(boldItalic, ASStyleCharacteristics.difference(ASStyleCharacteristics.italic));
  const notBoldNotDimRed = pipe(
    ASStyleCharacteristics.fromColorAsForegroundColor(ASColor.threeBitRed),
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notBold),
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notDim),
  );
  const boldNotDimRed = pipe(
    ASStyleCharacteristics.fromColorAsForegroundColor(ASColor.threeBitRed),
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.bold),
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notDim),
  );
  const notBoldDimRed = pipe(
    ASStyleCharacteristics.fromColorAsForegroundColor(ASColor.threeBitRed),
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notBold),
    ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.dim),
  );

  describe('Tag, prototype and guards', () => {
    it('moduleTag', () => {
      TestUtils.assertSome(
        TestUtils.moduleTagFromTestFilePath(__filename),
        ASStyleCharacteristics.moduleTag,
      );
    });

    describe('Equal.equals', () => {
      it('Matching', () => {
        TestUtils.assertEquals(ASStyleCharacteristics.bold, bold1);
        TestUtils.assertEquals(ASStyleCharacteristics.none, ASStyleCharacteristics.none);
      });
      it('Non matching', () => {
        TestUtils.assertNotEquals(ASStyleCharacteristics.bold, boldItalic);
        TestUtils.assertNotEquals(ASStyleCharacteristics.bold, new Date());
      });
    });

    it('.toString()', () => {
      TestUtils.strictEqual(ASStyleCharacteristics.none.toString(), 'NoStyle');
      TestUtils.strictEqual(
        boldItalicBrightGreenInBlue.toString(),
        'BoldItalicBrightGreenInEightBitBlue',
      );
      TestUtils.strictEqual(ASStyleCharacteristics.fgDefaultColor.toString(), 'DefaultColor');
      TestUtils.strictEqual(ASStyleCharacteristics.bgDefaultColor.toString(), 'InDefaultColor');
    });

    it('.pipe()', () => {
      TestUtils.strictEqual(bold1.pipe(ASStyleCharacteristics.toId), 'Bold');
    });

    describe('has', () => {
      it('Matching', () => {
        TestUtils.assertTrue(ASStyleCharacteristics.has(boldItalic));
      });
      it('Non matching', () => {
        TestUtils.assertFalse(ASStyleCharacteristics.has(new Date()));
      });
    });
  });

  it('italicState', () => {
    TestUtils.assertSome(ASStyleCharacteristics.italicState(boldItalic), true);
    TestUtils.assertNone(ASStyleCharacteristics.italicState(bold1));
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
          ASStyleCharacteristics.mergeOver(ASStyleCharacteristics.bgDefaultColor),
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
        ASStyleCharacteristics.toId,
      ),
      'NotBoldDimItalicRed',
    );
  });

  it('mergeOver', () => {
    TestUtils.strictEqual(
      pipe(
        notBoldDimRed,
        ASStyleCharacteristics.mergeOver(boldItalic),
        ASStyleCharacteristics.toId,
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
          ASStyleCharacteristics.toId,
        ),
        'NoStyle',
      );
    });

    it('Complex case 1', () => {
      TestUtils.strictEqual(
        pipe(
          boldItalicBrightGreenInBlue,
          ASStyleCharacteristics.difference(boldNotDimRed),
          ASStyleCharacteristics.toId,
        ),
        'ItalicBrightGreenInEightBitBlue',
      );
    });

    it('Complex case 2', () => {
      TestUtils.strictEqual(
        pipe(
          notBoldNotDimRed,
          ASStyleCharacteristics.difference(boldNotDimRed),
          ASStyleCharacteristics.toId,
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
        ASStyleCharacteristics.toId,
      ),
      'BoldNotDimItalic',
    );
  });
});
