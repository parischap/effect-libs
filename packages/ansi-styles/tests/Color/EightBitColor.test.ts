import { assert, describe, it } from '@effect/vitest';
import * as Option from 'effect/Option';

import * as ASColor from '@parischap/ansi-styles/ASColor';
import * as ASEightBitColor from '@parischap/ansi-styles/ASEightBitColor';
import * as TestUtils from '@parischap/configs/TestUtils';

describe('ASEightBitColor', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASEightBitColor.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('foregroundSequence', () => {
    assert.deepStrictEqual(ASColor.foregroundSequence(ASEightBitColor.green), [38, 5, 2]);
  });

  it('backgroundSequence', () => {
    assert.deepStrictEqual(ASColor.backgroundSequence(ASEightBitColor.green), [48, 5, 2]);
  });

  it('toForegroundId', () => {
    assert.deepStrictEqual(ASColor.foregroundId(ASEightBitColor.green), 'EightBitGreen');
  });

  it('toBackgroundId', () => {
    assert.deepStrictEqual(ASColor.backgroundId(ASEightBitColor.green), 'InEightBitGreen');
  });

  describe('equivalence', () => {
    it('Same color', () => {
      assert.isTrue(ASEightBitColor.equivalence(ASEightBitColor.green, ASEightBitColor.green));
    });
    it('Different color', () => {
      assert.isFalse(ASEightBitColor.equivalence(ASEightBitColor.green, ASEightBitColor.red));
    });
  });

  it('code', () => {
    assert.strictEqual(ASEightBitColor.code(ASEightBitColor.green), 2);
    assert.strictEqual(ASEightBitColor.code(ASEightBitColor.red), 9);
  });
});
