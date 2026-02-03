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

  it('foregroundSequence', () => {
    TestUtils.deepStrictEqual(ASColorBase.foregroundSequence(ASColorRgb.green), [38, 2, 0, 128, 0]);
    TestUtils.deepStrictEqual(ASColorBase.foregroundSequence(anRgbColor), [38, 2, 127, 18, 12]);
  });

  it('backgroundSequence', () => {
    TestUtils.deepStrictEqual(ASColorBase.backgroundSequence(ASColorRgb.green), [48, 2, 0, 128, 0]);
    TestUtils.deepStrictEqual(ASColorBase.backgroundSequence(anRgbColor), [48, 2, 127, 18, 12]);
  });

  it('foregroundId', () => {
    TestUtils.deepStrictEqual(ASColorBase.foregroundId(ASColorRgb.green), 'RgbGreen');
    TestUtils.deepStrictEqual(ASColorBase.foregroundId(anRgbColor), 'Rgb127/18/12');
  });

  it('backgroundId', () => {
    TestUtils.deepStrictEqual(ASColorBase.backgroundId(ASColorRgb.green), 'InRgbGreen');
    TestUtils.deepStrictEqual(ASColorBase.backgroundId(anRgbColor), 'InRgb127/18/12');
  });
});
