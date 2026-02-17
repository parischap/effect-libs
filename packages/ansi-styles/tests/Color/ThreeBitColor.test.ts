import * as ASColor from '@parischap/ansi-styles/ASColor'
import * as ASThreeBitColor from '@parischap/ansi-styles/ASThreeBitColor'
import * as TestUtils from '@parischap/configs/TestUtils';
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('ASThreeBitColor', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASThreeBitColor.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('foregroundSequence', () => {
    TestUtils.deepStrictEqual(ASColor.foregroundSequence(ASThreeBitColor.green), [32]);
    TestUtils.deepStrictEqual(ASColor.foregroundSequence(ASThreeBitColor.brightGreen), [92]);
  });

  it('backgroundSequence', () => {
    TestUtils.deepStrictEqual(ASColor.backgroundSequence(ASThreeBitColor.green), [42]);
    TestUtils.deepStrictEqual(ASColor.backgroundSequence(ASThreeBitColor.brightGreen), [102]);
  });

  it('foregroundId', () => {
    TestUtils.deepStrictEqual(ASColor.foregroundId(ASThreeBitColor.green), 'Green');
    TestUtils.deepStrictEqual(ASColor.foregroundId(ASThreeBitColor.brightGreen), 'BrightGreen');
  });

  it('backgroundId', () => {
    TestUtils.deepStrictEqual(ASColor.backgroundId(ASThreeBitColor.green), 'InGreen');
    TestUtils.deepStrictEqual(ASColor.backgroundId(ASThreeBitColor.brightGreen), 'InBrightGreen');
  });
});
