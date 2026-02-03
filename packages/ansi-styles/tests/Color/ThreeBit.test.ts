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

  it('foregroundSequence', () => {
    TestUtils.deepStrictEqual(ASColorBase.foregroundSequence(ASColorThreeBit.green), [32]);
    TestUtils.deepStrictEqual(ASColorBase.foregroundSequence(ASColorThreeBit.brightGreen), [92]);
  });

  it('backgroundSequence', () => {
    TestUtils.deepStrictEqual(ASColorBase.backgroundSequence(ASColorThreeBit.green), [42]);
    TestUtils.deepStrictEqual(ASColorBase.backgroundSequence(ASColorThreeBit.brightGreen), [102]);
  });

  it('foregroundId', () => {
    TestUtils.deepStrictEqual(ASColorBase.foregroundId(ASColorThreeBit.green), 'Green');
    TestUtils.deepStrictEqual(ASColorBase.foregroundId(ASColorThreeBit.brightGreen), 'BrightGreen');
  });

  it('backgroundId', () => {
    TestUtils.deepStrictEqual(ASColorBase.backgroundId(ASColorThreeBit.green), 'InGreen');
    TestUtils.deepStrictEqual(
      ASColorBase.backgroundId(ASColorThreeBit.brightGreen),
      'InBrightGreen',
    );
  });
});
