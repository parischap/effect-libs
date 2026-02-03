import { ASColorBase, ASColorEightBit } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASColorThreeBit', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASColorEightBit.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('foregroundSequence', () => {
    TestUtils.deepStrictEqual(ASColorBase.foregroundSequence(ASColorEightBit.green), [38, 5, 2]);
  });

  it('backgroundSequence', () => {
    TestUtils.deepStrictEqual(ASColorBase.backgroundSequence(ASColorEightBit.green), [48, 5, 2]);
  });

  it('toForegroundId', () => {
    TestUtils.deepStrictEqual(ASColorBase.foregroundId(ASColorEightBit.green), 'EightBitGreen');
  });

  it('toBackgroundId', () => {
    TestUtils.deepStrictEqual(ASColorBase.backgroundId(ASColorEightBit.green), 'InEightBitGreen');
  });
});
