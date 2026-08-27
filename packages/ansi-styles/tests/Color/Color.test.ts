import * as Option from 'effect/Option';

import * as ASColor from '@parischap/ansi-styles/ASColor';
import * as ASThreeBitColor from '@parischap/ansi-styles/ASThreeBitColor';
import * as TestUtils from '@parischap/configs/TestUtils';

import { assert, describe, it } from '@effect/vitest';

describe('ASColor', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASColor.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('equivalence', () => {
    it('Same color', () => {
      assert.isTrue(ASColor.equivalence(ASThreeBitColor.green, ASThreeBitColor.green));
    });
    it('Different color', () => {
      assert.isFalse(ASColor.equivalence(ASThreeBitColor.green, ASThreeBitColor.red));
    });
  });

  it('toString', () => {
    assert.strictEqual(ASColor.toString(ASThreeBitColor.green), 'Green');
    assert.strictEqual(ASColor.toString(ASThreeBitColor.brightRed), 'BrightRed');
  });
});
