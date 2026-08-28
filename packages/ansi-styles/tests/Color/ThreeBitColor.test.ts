import { assert, describe, it } from '@effect/vitest';
import * as Option from 'effect/Option';

import * as ASColor from '@parischap/ansi-styles/ASColor';
import * as ASThreeBitColor from '@parischap/ansi-styles/ASThreeBitColor';
import * as TestUtils from '@parischap/configs/TestUtils';

describe('ASThreeBitColor', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(ASThreeBitColor.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('foregroundSequence', () => {
    assert.deepStrictEqual(ASColor.foregroundSequence(ASThreeBitColor.green), [32]);
    assert.deepStrictEqual(ASColor.foregroundSequence(ASThreeBitColor.brightGreen), [92]);
  });

  it('backgroundSequence', () => {
    assert.deepStrictEqual(ASColor.backgroundSequence(ASThreeBitColor.green), [42]);
    assert.deepStrictEqual(ASColor.backgroundSequence(ASThreeBitColor.brightGreen), [102]);
  });

  it('foregroundId', () => {
    assert.deepStrictEqual(ASColor.foregroundId(ASThreeBitColor.green), 'Green');
    assert.deepStrictEqual(ASColor.foregroundId(ASThreeBitColor.brightGreen), 'BrightGreen');
  });

  it('backgroundId', () => {
    assert.deepStrictEqual(ASColor.backgroundId(ASThreeBitColor.green), 'InGreen');
    assert.deepStrictEqual(ASColor.backgroundId(ASThreeBitColor.brightGreen), 'InBrightGreen');
  });

  describe('equivalence', () => {
    it('Same color', () => {
      assert.isTrue(ASThreeBitColor.equivalence(ASThreeBitColor.green, ASThreeBitColor.green));
    });
    it('Different color', () => {
      assert.isFalse(ASThreeBitColor.equivalence(ASThreeBitColor.green, ASThreeBitColor.red));
    });
    it('Same offset different brightness', () => {
      assert.isFalse(
        ASThreeBitColor.equivalence(ASThreeBitColor.green, ASThreeBitColor.brightGreen),
      );
    });
  });

  it('offset', () => {
    assert.strictEqual(ASThreeBitColor.offset(ASThreeBitColor.green), 2);
    assert.strictEqual(ASThreeBitColor.offset(ASThreeBitColor.black), 0);
  });

  it('isBright', () => {
    assert.isFalse(ASThreeBitColor.isBright(ASThreeBitColor.green));
    assert.isTrue(ASThreeBitColor.isBright(ASThreeBitColor.brightGreen));
  });

  describe('Constructors', () => {
    it('make', () => {
      const color = ASThreeBitColor.make(2);
      assert.isTrue(ASThreeBitColor.equivalence(color, ASThreeBitColor.green));
    });
    it('makeBright', () => {
      const color = ASThreeBitColor.makeBright(2);
      assert.isTrue(ASThreeBitColor.equivalence(color, ASThreeBitColor.brightGreen));
    });
  });
});
