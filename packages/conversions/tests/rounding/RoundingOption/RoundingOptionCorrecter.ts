import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVRoundingOption from '@parischap/conversions/CVRoundingOption';
import * as CVRoundingOptionCorrecter from '@parischap/conversions/CVRoundingOptionCorrecter';

import { describe, it } from 'vitest';

describe('CVRoundingOptionCorrecter', () => {
  it('Ceil', () => {
    const correcter = CVRoundingOptionCorrecter.fromRoundingOption(CVRoundingOption.Type.Ceil);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 0, isEven: false }), 0);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 1, isEven: false }), 1);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -1, isEven: false }), 0);
  });

  it('Floor', () => {
    const correcter = CVRoundingOptionCorrecter.fromRoundingOption(CVRoundingOption.Type.Floor);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 0, isEven: false }), 0);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 1, isEven: false }), 0);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -1, isEven: false }), -1);
  });

  it('Expand', () => {
    const correcter = CVRoundingOptionCorrecter.fromRoundingOption(CVRoundingOption.Type.Expand);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 0, isEven: false }), 0);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 1, isEven: false }), 1);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -1, isEven: false }), -1);
  });

  it('Trunc', () => {
    const correcter = CVRoundingOptionCorrecter.fromRoundingOption(CVRoundingOption.Type.Trunc);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 0, isEven: false }), 0);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 1, isEven: false }), 0);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -1, isEven: false }), 0);
  });

  it('HalfCeil', () => {
    const correcter = CVRoundingOptionCorrecter.fromRoundingOption(CVRoundingOption.Type.HalfCeil);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: false }), 1);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 4, isEven: false }), 0);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: false }), 0);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -6, isEven: false }), -1);
  });

  it('HalfFloor', () => {
    const correcter = CVRoundingOptionCorrecter.fromRoundingOption(CVRoundingOption.Type.HalfFloor);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: false }), 0);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 6, isEven: false }), 1);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: false }), -1);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -4, isEven: false }), 0);
  });

  it('HalfExpand', () => {
    const correcter = CVRoundingOptionCorrecter.fromRoundingOption(
      CVRoundingOption.Type.HalfExpand,
    );
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: false }), 1);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 4, isEven: false }), 0);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: false }), -1);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -4, isEven: false }), 0);
  });

  it('HalfEven', () => {
    const correcter = CVRoundingOptionCorrecter.fromRoundingOption(CVRoundingOption.Type.HalfEven);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 6, isEven: true }), 1);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: true }), 0);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 4, isEven: true }), 0);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -6, isEven: true }), -1);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: true }), 0);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -4, isEven: true }), 0);

    TestUtils.strictEqual(correcter({ firstFollowingDigit: 6, isEven: false }), 1);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: false }), 1);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: 4, isEven: false }), 0);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -6, isEven: false }), -1);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: false }), -1);
    TestUtils.strictEqual(correcter({ firstFollowingDigit: -4, isEven: false }), 0);
  });
});
