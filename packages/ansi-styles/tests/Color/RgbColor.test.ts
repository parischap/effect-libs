import * as Option from 'effect/Option';

import * as ASColor from '@parischap/ansi-styles/ASColor';
import * as ASRgbColor from '@parischap/ansi-styles/ASRgbColor';
import * as TestUtils from '@parischap/configs/TestUtils';

import { describe, it } from 'vitest';

describe('ASRgbColor', () => {
  const anRgbColor = ASRgbColor.make({ red: 127, green: 18, blue: 12 });

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASRgbColor.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('foregroundSequence', () => {
    TestUtils.deepStrictEqual(ASColor.foregroundSequence(ASRgbColor.green), [38, 2, 0, 128, 0]);
    TestUtils.deepStrictEqual(ASColor.foregroundSequence(anRgbColor), [38, 2, 127, 18, 12]);
  });

  it('backgroundSequence', () => {
    TestUtils.deepStrictEqual(ASColor.backgroundSequence(ASRgbColor.green), [48, 2, 0, 128, 0]);
    TestUtils.deepStrictEqual(ASColor.backgroundSequence(anRgbColor), [48, 2, 127, 18, 12]);
  });

  it('foregroundId', () => {
    TestUtils.deepStrictEqual(ASColor.foregroundId(ASRgbColor.green), 'RgbGreen');
    TestUtils.deepStrictEqual(ASColor.foregroundId(anRgbColor), 'Rgb127/18/12');
  });

  it('backgroundId', () => {
    TestUtils.deepStrictEqual(ASColor.backgroundId(ASRgbColor.green), 'InRgbGreen');
    TestUtils.deepStrictEqual(ASColor.backgroundId(anRgbColor), 'InRgb127/18/12');
  });

  describe('equivalence', () => {
    it('Same color', () => {
      TestUtils.assertTrue(ASRgbColor.equivalence(ASRgbColor.green, ASRgbColor.green));
    });
    it('Different color', () => {
      TestUtils.assertFalse(ASRgbColor.equivalence(ASRgbColor.green, ASRgbColor.red));
    });
    it('Same RGB values', () => {
      const color1 = ASRgbColor.make({ red: 100, green: 200, blue: 50 });
      const color2 = ASRgbColor.make({ red: 100, green: 200, blue: 50 });
      TestUtils.assertTrue(ASRgbColor.equivalence(color1, color2));
    });
  });

  describe('make edge cases', () => {
    it('Clamps negative values to 0', () => {
      const color = ASRgbColor.make({ red: -10, green: -5, blue: -1 });
      TestUtils.deepStrictEqual(ASColor.foregroundSequence(color), [38, 2, 0, 0, 0]);
    });
    it('Clamps values above 255', () => {
      const color = ASRgbColor.make({ red: 300, green: 500, blue: 256 });
      TestUtils.deepStrictEqual(ASColor.foregroundSequence(color), [38, 2, 255, 255, 255]);
    });
    it('Rounds fractional values', () => {
      const color = ASRgbColor.make({ red: 127.6, green: 18.3, blue: 12.5 });
      TestUtils.deepStrictEqual(ASColor.foregroundSequence(color), [38, 2, 128, 18, 13]);
    });
  });
});
