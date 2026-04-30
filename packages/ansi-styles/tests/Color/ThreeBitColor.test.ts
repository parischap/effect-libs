import * as Option from 'effect/Option';

import * as ASColor from '@parischap/ansi-styles/ASColor';
import * as ASThreeBitColor from '@parischap/ansi-styles/ASThreeBitColor';
import * as TestUtils from '@parischap/configs/TestUtils';

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

  describe('equivalence', () => {
    it('Same color', () => {
      TestUtils.assertTrue(
        ASThreeBitColor.equivalence(ASThreeBitColor.green, ASThreeBitColor.green),
      );
    });
    it('Different color', () => {
      TestUtils.assertFalse(
        ASThreeBitColor.equivalence(ASThreeBitColor.green, ASThreeBitColor.red),
      );
    });
    it('Same offset different brightness', () => {
      TestUtils.assertFalse(
        ASThreeBitColor.equivalence(ASThreeBitColor.green, ASThreeBitColor.brightGreen),
      );
    });
  });

  it('offset', () => {
    TestUtils.strictEqual(ASThreeBitColor.offset(ASThreeBitColor.green), 2);
    TestUtils.strictEqual(ASThreeBitColor.offset(ASThreeBitColor.black), 0);
  });

  it('isBright', () => {
    TestUtils.assertFalse(ASThreeBitColor.isBright(ASThreeBitColor.green));
    TestUtils.assertTrue(ASThreeBitColor.isBright(ASThreeBitColor.brightGreen));
  });

  describe('Constructors', () => {
    it('make', () => {
      const color = ASThreeBitColor.make(2);
      TestUtils.assertTrue(ASThreeBitColor.equivalence(color, ASThreeBitColor.green));
    });
    it('makeBright', () => {
      const color = ASThreeBitColor.makeBright(2);
      TestUtils.assertTrue(ASThreeBitColor.equivalence(color, ASThreeBitColor.brightGreen));
    });
  });
});
