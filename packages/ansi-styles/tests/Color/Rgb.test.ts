import { ASColorBase, ASColorRgb } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASColorRgb', () => {
  const anRgbColor = ASColorRgb.make({ red: 127, green: 18, blue: 12 });

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASColorRgb.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('toForegroundSequence', () => {
    TestUtils.deepStrictEqual(
      ASColorBase.toForegroundSequence(ASColorRgb.Green),
      [38, 2, 0, 128, 0],
    );
    TestUtils.deepStrictEqual(ASColorBase.toForegroundSequence(anRgbColor), [38, 2, 127, 18, 12]);
  });

  it('toBackgroundSequence', () => {
    TestUtils.deepStrictEqual(
      ASColorBase.toBackgroundSequence(ASColorRgb.Green),
      [48, 2, 0, 128, 0],
    );
    TestUtils.deepStrictEqual(ASColorBase.toBackgroundSequence(anRgbColor), [48, 2, 127, 18, 12]);
  });

  it('toForegroundId', () => {
    TestUtils.deepStrictEqual(ASColorBase.toForegroundId(ASColorRgb.Green), 'RgbGreen');
    TestUtils.deepStrictEqual(ASColorBase.toForegroundId(anRgbColor), 'Rgb127/18/12');
  });

  it('toBackgroundId', () => {
    TestUtils.deepStrictEqual(ASColorBase.toBackgroundId(ASColorRgb.Green), 'InRgbGreen');
    TestUtils.deepStrictEqual(ASColorBase.toBackgroundId(anRgbColor), 'InRgb127/18/12');
  });
});
