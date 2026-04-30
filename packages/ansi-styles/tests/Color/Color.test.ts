import * as Option from 'effect/Option';

import * as ASColor from '@parischap/ansi-styles/ASColor';
import * as ASThreeBitColor from '@parischap/ansi-styles/ASThreeBitColor';
import * as TestUtils from '@parischap/configs/TestUtils';

import { describe, it } from 'vitest';

describe('ASColor', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASColor.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('equivalence', () => {
    it('Same color', () => {
      TestUtils.assertTrue(ASColor.equivalence(ASThreeBitColor.green, ASThreeBitColor.green));
    });
    it('Different color', () => {
      TestUtils.assertFalse(ASColor.equivalence(ASThreeBitColor.green, ASThreeBitColor.red));
    });
  });

  it('toString', () => {
    TestUtils.strictEqual(ASColor.toString(ASThreeBitColor.green), 'Green');
    TestUtils.strictEqual(ASColor.toString(ASThreeBitColor.brightRed), 'BrightRed');
  });
});
