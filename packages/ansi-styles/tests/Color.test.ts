import { ASColor } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('Color', () => {
  describe('Tag and guards', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(ASColor.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    describe('isThreeBit', () => {
      it('Matching', () => {
        TestUtils.assertTrue(ASColor.isThreeBit(ASColor.threeBitRed));
      });
      it('Non matching', () => {
        TestUtils.assertFalse(ASColor.isThreeBit(ASColor.eightBitRed));
        TestUtils.assertFalse(ASColor.isThreeBit(ASColor.rgbRed));
      });
    });

    describe('isEightBit', () => {
      it('Matching', () => {
        TestUtils.assertTrue(ASColor.isEightBit(ASColor.eightBitRed));
      });
      it('Non matching', () => {
        TestUtils.assertFalse(ASColor.isEightBit(ASColor.threeBitRed));
        TestUtils.assertFalse(ASColor.isEightBit(ASColor.rgbRed));
      });
    });

    describe('isRgb', () => {
      it('Matching', () => {
        TestUtils.assertTrue(ASColor.isRgb(ASColor.rgbRed));
      });
      it('Non matching', () => {
        TestUtils.assertFalse(ASColor.isRgb(ASColor.threeBitRed));
        TestUtils.assertFalse(ASColor.isRgb(ASColor.eightBitRed));
      });
    });
  });

  describe('equivalence', () => {
    it('Matching', () => {
      TestUtils.assertTrue(ASColor.equivalence(ASColor.threeBitBlack, ASColor.threeBitBlack));
      TestUtils.assertTrue(ASColor.equivalence(ASColor.eightBitBlack, ASColor.eightBitBlack));
      TestUtils.assertTrue(
        ASColor.equivalence(ASColor.rgbBlack, ASColor.Rgb.make({ red: 0, green: 0, blue: 0 })),
      );
    });

    it('Non-matching', () => {
      TestUtils.assertFalse(ASColor.equivalence(ASColor.threeBitBlack, ASColor.eightBitBlack));
      TestUtils.assertFalse(ASColor.equivalence(ASColor.eightBitBlack, ASColor.rgbBlack));
      TestUtils.assertFalse(ASColor.equivalence(ASColor.threeBitBlack, ASColor.rgbBlack));
    });
  });

  describe('toString', () => {
    it('ThreeBit', () => {
      TestUtils.strictEqual(ASColor.toString(ASColor.threeBitGreen), 'Green');
    });
    it('ThreeBit.Bright', () => {
      TestUtils.strictEqual(ASColor.toString(ASColor.threeBitBrightGreen), 'BrightGreen');
    });
    it('EightBit', () => {
      TestUtils.strictEqual(ASColor.toString(ASColor.eightBitGreen), 'EightBitGreen');
    });
    it('Rgb predefined', () => {
      TestUtils.strictEqual(ASColor.toString(ASColor.rgbGreen), 'RgbGreen');
    });
    it('Rgb user-defined', () => {
      TestUtils.strictEqual(
        ASColor.toString(ASColor.Rgb.make({ red: 127, green: 18, blue: 12 })),
        'Rgb127/18/12',
      );
    });
  });

  describe('toSequence', () => {
    it('ThreeBit', () => {
      TestUtils.deepStrictEqual(ASColor.toSequence(ASColor.threeBitGreen), [32]);
    });
    it('ThreeBit.Bright', () => {
      TestUtils.deepStrictEqual(ASColor.toSequence(ASColor.threeBitBrightGreen), [92]);
    });
    it('EightBit', () => {
      TestUtils.deepStrictEqual(ASColor.toSequence(ASColor.eightBitGreen), [38, 5, 2]);
    });
    it('Rgb predefined', () => {
      TestUtils.deepStrictEqual(ASColor.toSequence(ASColor.rgbGreen), [38, 2, 0, 128, 0]);
    });
    it('Rgb user-defined', () => {
      TestUtils.deepStrictEqual(
        ASColor.toSequence(ASColor.Rgb.make({ red: 127, green: 18, blue: 12 })),
        [38, 2, 127, 18, 12],
      );
    });
  });
});
