import { ASColorBase, ASColorThreeBit } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASColorThreeBit', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASColorThreeBit.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('toForegroundSequence', () => {
    TestUtils.deepStrictEqual(ASColorBase.toForegroundSequence(ASColorThreeBit.Green), [32]);
    TestUtils.deepStrictEqual(ASColorBase.toForegroundSequence(ASColorThreeBit.BrightGreen), [92]);
  });

  it('toBackgroundSequence', () => {
    TestUtils.deepStrictEqual(ASColorBase.toBackgroundSequence(ASColorThreeBit.Green), [42]);
    TestUtils.deepStrictEqual(ASColorBase.toBackgroundSequence(ASColorThreeBit.BrightGreen), [102]);
  });

  it('toForegroundId', () => {
    TestUtils.deepStrictEqual(ASColorBase.toForegroundId(ASColorThreeBit.Green), 'Green');
    TestUtils.deepStrictEqual(
      ASColorBase.toForegroundId(ASColorThreeBit.BrightGreen),
      'BrightGreen',
    );
  });

  it('toBackgroundId', () => {
    TestUtils.deepStrictEqual(ASColorBase.toBackgroundId(ASColorThreeBit.Green), 'InGreen');
    TestUtils.deepStrictEqual(
      ASColorBase.toBackgroundId(ASColorThreeBit.BrightGreen),
      'InBrightGreen',
    );
  });
});
