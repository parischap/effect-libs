import { ASColor, ASEightBitColor } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASThreeBitColor', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASEightBitColor.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('foregroundSequence', () => {
    TestUtils.deepStrictEqual(ASColor.foregroundSequence(ASEightBitColor.green), [38, 5, 2]);
  });

  it('backgroundSequence', () => {
    TestUtils.deepStrictEqual(ASColor.backgroundSequence(ASEightBitColor.green), [48, 5, 2]);
  });

  it('toForegroundId', () => {
    TestUtils.deepStrictEqual(ASColor.foregroundId(ASEightBitColor.green), 'EightBitGreen');
  });

  it('toBackgroundId', () => {
    TestUtils.deepStrictEqual(ASColor.backgroundId(ASEightBitColor.green), 'InEightBitGreen');
  });
});
