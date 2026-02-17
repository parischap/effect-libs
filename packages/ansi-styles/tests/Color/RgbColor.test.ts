import * as ASColor from '@parischap/ansi-styles/ASColor'
import * as ASRgbColor from '@parischap/ansi-styles/ASRgbColor'
import * as TestUtils from '@parischap/configs/TestUtils';
import * as Option from 'effect/Option'
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
});
