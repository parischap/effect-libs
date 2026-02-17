import * as ASColor from '@parischap/ansi-styles/ASColor'
import * as ASEightBitColor from '@parischap/ansi-styles/ASEightBitColor'
import * as TestUtils from '@parischap/configs/TestUtils';
import * as Option from 'effect/Option'
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
