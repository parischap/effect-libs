import { ASColorEightBit, ASColorRgb, ASColorThreeBit, ASSequence } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { describe, it } from 'vitest';

describe('ASSequence', () => {
  it('fromForegroundColor', () => {
    TestUtils.deepStrictEqual(ASSequence.fromForegroundColor(ASColorThreeBit.Green), [32]);
    TestUtils.deepStrictEqual(ASSequence.fromForegroundColor(ASColorThreeBit.BrightGreen), [92]);
    TestUtils.deepStrictEqual(ASSequence.fromForegroundColor(ASColorEightBit.Green), [38, 5, 2]);
    TestUtils.deepStrictEqual(ASSequence.fromForegroundColor(ASColorRgb.Green), [38, 2, 0, 128, 0]);
    TestUtils.deepStrictEqual(
      ASSequence.fromForegroundColor(ASColorRgb.make({ red: 127, green: 18, blue: 12 })),
      [38, 2, 127, 18, 12],
    );
  });

  it('fromBackgroundColor', () => {
    TestUtils.deepStrictEqual(ASSequence.fromBackgroundColor(ASColorThreeBit.Green), [42]);
    TestUtils.deepStrictEqual(ASSequence.fromBackgroundColor(ASColorThreeBit.BrightGreen), [102]);
    TestUtils.deepStrictEqual(ASSequence.fromBackgroundColor(ASColorEightBit.Green), [48, 5, 2]);
    TestUtils.deepStrictEqual(ASSequence.fromBackgroundColor(ASColorRgb.Green), [48, 2, 0, 128, 0]);
    TestUtils.deepStrictEqual(
      ASSequence.fromBackgroundColor(ASColorRgb.make({ red: 127, green: 18, blue: 12 })),
      [48, 2, 127, 18, 12],
    );
  });
});
