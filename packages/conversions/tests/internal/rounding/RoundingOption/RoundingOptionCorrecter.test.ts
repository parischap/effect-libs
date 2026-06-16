import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVRoundingOption from '@parischap/conversions/CVRoundingOption';
import * as CVRoundingOptionCorrecter from '@parischap/conversions/CVRoundingOptionCorrecter';

import { describe, it } from 'vitest';

describe('CVRoundingOptionCorrecter', () => {
  describe('fromRoundingOption', () => {
    describe('Ceil', () => {
      const correcter = CVRoundingOptionCorrecter.fromRoundingOption(CVRoundingOption.Type.Ceil);
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
      const correcter = CVRoundingOptionCorrecter.fromRoundingOption(CVRoundingOption.Type.Floor);
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
      const correcter = CVRoundingOptionCorrecter.fromRoundingOption(CVRoundingOption.Type.Expand);
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
      const correcter = CVRoundingOptionCorrecter.fromRoundingOption(CVRoundingOption.Type.Trunc);
      it('Any digit', () => {
        TestUtils.assertEquals(correcter({ firstFollowingDigit: 7, isEven: true }), 0);
        TestUtils.assertEquals(correcter({ firstFollowingDigit: -7, isEven: false }), 0);
      });
    });

    describe('HalfCeil', () => {
      const correcter = CVRoundingOptionCorrecter.fromRoundingOption(
        CVRoundingOption.Type.HalfCeil,
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
      const correcter = CVRoundingOptionCorrecter.fromRoundingOption(
        CVRoundingOption.Type.HalfFloor,
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
      const correcter = CVRoundingOptionCorrecter.fromRoundingOption(
        CVRoundingOption.Type.HalfExpand,
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
      const correcter = CVRoundingOptionCorrecter.fromRoundingOption(
        CVRoundingOption.Type.HalfTrunc,
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
      const correcter = CVRoundingOptionCorrecter.fromRoundingOption(
        CVRoundingOption.Type.HalfEven,
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
