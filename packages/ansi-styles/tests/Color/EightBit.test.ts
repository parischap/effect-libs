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

  it('toForegroundSequence', () => {
    TestUtils.deepStrictEqual(ASColorBase.toForegroundSequence(ASColorEightBit.Green), [38, 5, 2]);
  });

  it('toBackgroundSequence', () => {
    TestUtils.deepStrictEqual(ASColorBase.toBackgroundSequence(ASColorEightBit.Green), [48, 5, 2]);
  });

  it('toForegroundId', () => {
    TestUtils.deepStrictEqual(ASColorBase.toForegroundId(ASColorEightBit.Green), 'EightBitGreen');
  });

  it('toBackgroundId', () => {
    TestUtils.deepStrictEqual(ASColorBase.toBackgroundId(ASColorEightBit.Green), 'InEightBitGreen');
  });
});
