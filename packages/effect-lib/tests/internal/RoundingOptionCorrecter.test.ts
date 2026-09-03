import { describe, it } from '@effect/vitest';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MRoundingOptionCorrecter from '@parischap/effect-lib/MRoundingOptionCorrecter';

describe('MRoundingOptionCorrecter', () => {
  describe('fromRoundingOption', () => {
    describe('Ceil', () => {
      const correcter = MRoundingOptionCorrecter.fromRoundingOption(
        MNumberBase10Format.RoundingOption.Ceil,
      );
      it('Positive first following digit', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 3, isEven: true }), 1);
      });
      it('Zero first following digit', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 0, isEven: true }), 0);
      });
      it('Negative first following digit', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -3, isEven: true }), 0);
      });
    });

    describe('Floor', () => {
      const correcter = MRoundingOptionCorrecter.fromRoundingOption(
        MNumberBase10Format.RoundingOption.Floor,
      );
      it('Positive first following digit', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 3, isEven: true }), 0);
      });
      it('Zero first following digit', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 0, isEven: true }), 0);
      });
      it('Negative first following digit', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -3, isEven: true }), -1);
      });
    });

    describe('Expand', () => {
      const correcter = MRoundingOptionCorrecter.fromRoundingOption(
        MNumberBase10Format.RoundingOption.Expand,
      );
      it('Positive first following digit', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 3, isEven: true }), 1);
      });
      it('Zero first following digit', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 0, isEven: true }), 0);
      });
      it('Negative first following digit', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -3, isEven: true }), -1);
      });
    });

    describe('Trunc', () => {
      const correcter = MRoundingOptionCorrecter.fromRoundingOption(
        MNumberBase10Format.RoundingOption.Trunc,
      );
      it('Any digit', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 7, isEven: true }), 0);
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -7, isEven: false }), 0);
      });
    });

    describe('HalfCeil', () => {
      const correcter = MRoundingOptionCorrecter.fromRoundingOption(
        MNumberBase10Format.RoundingOption.HalfCeil,
      );
      it('Above half', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 7, isEven: true }), 1);
      });
      it('At half positive', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 5, isEven: true }), 1);
      });
      it('Below half positive', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 3, isEven: true }), 0);
      });
      it('At half negative', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -5, isEven: true }), 0);
      });
      it('Below half negative', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -7, isEven: true }), -1);
      });
    });

    describe('HalfFloor', () => {
      const correcter = MRoundingOptionCorrecter.fromRoundingOption(
        MNumberBase10Format.RoundingOption.HalfFloor,
      );
      it('Above half', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 7, isEven: true }), 1);
      });
      it('At half positive', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 5, isEven: true }), 0);
      });
      it('Below half positive', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 3, isEven: true }), 0);
      });
      it('At half negative', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -5, isEven: true }), -1);
      });
      it('Below half negative', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -3, isEven: true }), 0);
      });
    });

    describe('HalfExpand', () => {
      const correcter = MRoundingOptionCorrecter.fromRoundingOption(
        MNumberBase10Format.RoundingOption.HalfExpand,
      );
      it('Above half', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 7, isEven: true }), 1);
      });
      it('At half positive', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 5, isEven: true }), 1);
      });
      it('Below half positive', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 3, isEven: true }), 0);
      });
      it('At half negative', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -5, isEven: true }), -1);
      });
      it('Below half negative', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -3, isEven: true }), 0);
      });
    });

    describe('HalfTrunc', () => {
      const correcter = MRoundingOptionCorrecter.fromRoundingOption(
        MNumberBase10Format.RoundingOption.HalfTrunc,
      );
      it('Above half', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 7, isEven: true }), 1);
      });
      it('At half positive', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 5, isEven: true }), 0);
      });
      it('Below half positive', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 3, isEven: true }), 0);
      });
      it('At half negative', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -5, isEven: true }), 0);
      });
      it('Below half negative', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -7, isEven: true }), -1);
      });
    });

    describe('HalfEven', () => {
      const correcter = MRoundingOptionCorrecter.fromRoundingOption(
        MNumberBase10Format.RoundingOption.HalfEven,
      );
      it('Above half', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 7, isEven: true }), 1);
      });
      it('At half positive, even', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 5, isEven: true }), 0);
      });
      it('At half positive, odd', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 5, isEven: false }), 1);
      });
      it('Below half positive', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 3, isEven: true }), 0);
      });
      it('At half negative, even', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -5, isEven: true }), 0);
      });
      it('At half negative, odd', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -5, isEven: false }), -1);
      });
      it('Below half negative', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -7, isEven: true }), -1);
      });
    });
  });
});
