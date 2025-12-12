import { ASColor } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { describe, it } from 'vitest';

describe('Color', () => {
  describe('Tag and guards', () => {
    it('moduleTag', () => {
      TestUtils.assertSome(TestUtils.moduleTagFromTestFilePath(__filename), ASColor.moduleTag);
    });

    describe('has', () => {
      it('Matching', () => {
        TestUtils.assertTrue(ASColor.has(ASColor.threeBitRed));
        TestUtils.assertTrue(ASColor.has(ASColor.eightBitRed));
        TestUtils.assertTrue(ASColor.has(ASColor.rgbRed));
      });
      it('Non matching', () => {
        TestUtils.assertFalse(ASColor.has(new Date()));
      });
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

  describe('ThreeBit', () => {
    describe('Prototype and guards', () => {
      describe('Equal.equals', () => {
        it('Matching', () => {
          TestUtils.assertEquals(ASColor.threeBitBlack, ASColor.threeBitBlack);
        });

        it('Non-matching', () => {
          TestUtils.assertNotEquals(ASColor.threeBitBlack, new Date());
          TestUtils.assertNotEquals(ASColor.threeBitBlack, ASColor.threeBitRed);
          TestUtils.assertNotEquals(ASColor.threeBitBlack, ASColor.eightBitBlack);
        });
      });

      it('.pipe()', () => {
        TestUtils.assertTrue(ASColor.threeBitBlack.pipe(ASColor.ThreeBit.has));
      });

      describe('has', () => {
        it('Matching', () => {
          TestUtils.assertTrue(ASColor.ThreeBit.has(ASColor.threeBitBlack));
        });
        it('Non matching', () => {
          TestUtils.assertFalse(ASColor.ThreeBit.has(new Date()));
          TestUtils.assertFalse(ASColor.ThreeBit.has(ASColor.eightBitBlack));
        });
      });
    });
  });

  describe('EightBit', () => {
    describe('Prototype and guards', () => {
      describe('Equal.equals', () => {
        it('Matching', () => {
          TestUtils.assertEquals(ASColor.eightBitBlack, ASColor.eightBitBlack);
        });

        it('Non-matching', () => {
          TestUtils.assertNotEquals(ASColor.eightBitBlack, new Date());
          TestUtils.assertNotEquals(ASColor.eightBitBlack, ASColor.eightBitRed);
          TestUtils.assertNotEquals(ASColor.eightBitBlack, ASColor.threeBitBlack);
        });
      });

      it('.pipe()', () => {
        TestUtils.assertTrue(ASColor.eightBitBlack.pipe(ASColor.EightBit.has));
      });

      describe('has', () => {
        it('Matching', () => {
          TestUtils.assertTrue(ASColor.EightBit.has(ASColor.eightBitBlack));
        });
        it('Non matching', () => {
          TestUtils.assertFalse(ASColor.EightBit.has(new Date()));
          TestUtils.assertFalse(ASColor.EightBit.has(ASColor.threeBitBlack));
        });
      });
    });
  });

  describe('Rgb', () => {
    describe('Prototype and guards', () => {
      describe('Equal.equals', () => {
        it('Matching', () => {
          TestUtils.assertEquals(ASColor.rgbBlack, ASColor.rgbBlack);
        });

        it('Non-matching', () => {
          TestUtils.assertNotEquals(ASColor.rgbBlack, new Date());
          TestUtils.assertNotEquals(ASColor.rgbBlack, ASColor.rgbRed);
          TestUtils.assertNotEquals(ASColor.rgbBlack, ASColor.eightBitBlack);
        });
      });

      it('.pipe()', () => {
        TestUtils.assertTrue(ASColor.rgbBlack.pipe(ASColor.Rgb.has));
      });

      describe('has', () => {
        it('Matching', () => {
          TestUtils.assertTrue(ASColor.Rgb.has(ASColor.rgbBlack));
        });
        it('Non matching', () => {
          TestUtils.assertFalse(ASColor.Rgb.has(new Date()));
          TestUtils.assertFalse(ASColor.Rgb.has(ASColor.eightBitBlack));
        });
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

  describe('toId', () => {
    it('ThreeBit', () => {
      TestUtils.strictEqual(ASColor.toId(ASColor.threeBitGreen), 'Green');
    });
    it('ThreeBit.Bright', () => {
      TestUtils.strictEqual(ASColor.toId(ASColor.threeBitBrightGreen), 'BrightGreen');
    });
    it('EightBit', () => {
      TestUtils.strictEqual(ASColor.toId(ASColor.eightBitGreen), 'EightBitGreen');
    });
    it('Rgb predefined', () => {
      TestUtils.strictEqual(ASColor.toId(ASColor.rgbGreen), 'RgbGreen');
    });
    it('Rgb user-defined', () => {
      TestUtils.strictEqual(
        ASColor.toId(ASColor.Rgb.make({ red: 127, green: 18, blue: 12 })),
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
