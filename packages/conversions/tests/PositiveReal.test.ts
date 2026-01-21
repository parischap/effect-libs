import * as TestUtils from '@parischap/configs/TestUtils';
import { CVPositiveReal, CVReal } from '@parischap/conversions';
import { BigDecimal, Option } from 'effect';
import { describe, it } from 'vitest';

describe('CVPositiveReal', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(CVPositiveReal.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Conversions from number', () => {
    const notPassing1 = Number.NaN;
    const notPassing2 = -15.4;
    const passing = 15.4 as CVPositiveReal.Type;

    describe('unsafeFromNumber', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVPositiveReal.unsafeFromNumber(notPassing1));
        TestUtils.doesNotThrow(() => CVPositiveReal.unsafeFromNumber(notPassing2));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveReal.unsafeFromNumber(passing), passing);
      });
    });

    describe('fromNumberOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVPositiveReal.fromNumberOption(notPassing1));
        TestUtils.assertNone(CVPositiveReal.fromNumberOption(notPassing2));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVPositiveReal.fromNumberOption(passing), passing);
      });
    });

    describe('fromNumber', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVPositiveReal.fromNumber(notPassing1));
        TestUtils.assertLeft(CVPositiveReal.fromNumber(notPassing2));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVPositiveReal.fromNumber(passing), passing);
      });
    });

    describe('fromNumberOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVPositiveReal.fromNumberOrThrow(notPassing1));
        TestUtils.throws(() => CVPositiveReal.fromNumberOrThrow(notPassing2));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveReal.fromNumberOrThrow(passing), passing);
      });
    });
  });

  describe('Conversions from BigDecimal', () => {
    const notPassing1 = BigDecimal.make(1n, -500);
    const notPassing2 = BigDecimal.make(-154n, 1);
    const passing = BigDecimal.make(154n, 0);
    const real = 154 as CVPositiveReal.Type;

    describe('unsafeFromBigDecimal', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVPositiveReal.unsafeFromBigDecimal(notPassing1));
        TestUtils.doesNotThrow(() => CVPositiveReal.unsafeFromBigDecimal(notPassing2));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveReal.unsafeFromBigDecimal(passing), real);
      });
    });

    describe('fromBigDecimalOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVPositiveReal.fromBigDecimalOption(notPassing1));
        TestUtils.assertNone(CVPositiveReal.fromBigDecimalOption(notPassing2));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVPositiveReal.fromBigDecimalOption(passing), real);
      });
    });

    describe('fromBigDecimal', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVPositiveReal.fromBigDecimal(notPassing1));
        TestUtils.assertLeft(CVPositiveReal.fromBigDecimal(notPassing2));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVPositiveReal.fromBigDecimal(passing), real);
      });
    });

    describe('fromBigDecimalOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVPositiveReal.fromBigDecimalOrThrow(notPassing1));
        TestUtils.throws(() => CVPositiveReal.fromBigDecimalOrThrow(notPassing2));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveReal.fromBigDecimalOrThrow(passing), real);
      });
    });
  });

  describe('Conversions from BigInt', () => {
    const notPassing1 = 10n ** 500n;
    const notPassing2 = -154n;
    const passing = 154n;
    const real = 154 as CVPositiveReal.Type;

    describe('unsafeFromBigInt', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVPositiveReal.unsafeFromBigInt(notPassing1));
        TestUtils.doesNotThrow(() => CVPositiveReal.unsafeFromBigInt(notPassing2));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveReal.unsafeFromBigInt(passing), real);
      });
    });

    describe('fromBigIntOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVPositiveReal.fromBigIntOption(notPassing1));
        TestUtils.assertNone(CVPositiveReal.fromBigIntOption(notPassing2));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVPositiveReal.fromBigIntOption(passing), real);
      });
    });

    describe('fromBigInt', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVPositiveReal.fromBigInt(notPassing1));
        TestUtils.assertLeft(CVPositiveReal.fromBigInt(notPassing2));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVPositiveReal.fromBigInt(passing), real);
      });
    });

    describe('fromBigIntOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVPositiveReal.fromBigIntOrThrow(notPassing1));
        TestUtils.throws(() => CVPositiveReal.fromBigIntOrThrow(notPassing2));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveReal.fromBigIntOrThrow(passing), real);
      });
    });
  });

  describe('Conversions from Real', () => {
    const notPassing = CVReal.unsafeFromNumber(-15.4);
    const passing = CVReal.unsafeFromNumber(15.4);
    const real = 15.4 as CVPositiveReal.Type;

    describe('unsafeFromReal', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVPositiveReal.unsafeFromReal(notPassing));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveReal.unsafeFromReal(passing), real);
      });
    });

    describe('fromRealOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVPositiveReal.fromRealOption(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVPositiveReal.fromRealOption(passing), real);
      });
    });

    describe('fromReal', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVPositiveReal.fromReal(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVPositiveReal.fromReal(passing), real);
      });
    });

    describe('fromRealOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVPositiveReal.fromRealOrThrow(notPassing));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveReal.fromRealOrThrow(passing), real);
      });
    });
  });
});
