import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVReal from '@parischap/conversions/CVReal'
import * as BigDecimal from 'effect/BigDecimal'
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('CVReal', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(CVReal.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Conversions from number', () => {
    const notPassing = Infinity;
    const passing = 15.4 as CVReal.Type;

    describe('unsafeFromNumber', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVReal.unsafeFromNumber(notPassing));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVReal.unsafeFromNumber(passing), passing);
      });
    });

    describe('fromNumberOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVReal.fromNumberOption(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVReal.fromNumberOption(passing), passing);
      });
    });

    describe('fromNumber', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVReal.fromNumber(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVReal.fromNumber(passing), passing);
      });
    });

    describe('fromNumberOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVReal.fromNumberOrThrow(notPassing));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVReal.fromNumberOrThrow(passing), passing);
      });
    });
  });

  describe('Conversions from BigDecimal', () => {
    const notPassing = BigDecimal.make(1n, -500);
    const passing = BigDecimal.make(154n, 0);
    const real = 154 as CVReal.Type;

    describe('unsafeFromBigDecimal', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVReal.unsafeFromBigDecimal(notPassing));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVReal.unsafeFromBigDecimal(passing), real);
      });
    });

    describe('fromBigDecimalOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVReal.fromBigDecimalOption(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVReal.fromBigDecimalOption(passing), real);
      });
    });

    describe('fromBigDecimal', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVReal.fromBigDecimal(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVReal.fromBigDecimal(passing), real);
      });
    });

    describe('fromBigDecimalOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVReal.fromBigDecimalOrThrow(notPassing));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVReal.fromBigDecimalOrThrow(passing), real);
      });
    });
  });

  describe('Conversions from BigInt', () => {
    const notPassing = 10n ** 500n;
    const passing = 154n;
    const real = 154 as CVReal.Type;

    describe('unsafeFromBigInt', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVReal.unsafeFromBigInt(notPassing));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVReal.unsafeFromBigInt(passing), real);
      });
    });

    describe('fromBigIntOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVReal.fromBigIntOption(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVReal.fromBigIntOption(passing), real);
      });
    });

    describe('fromBigInt', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVReal.fromBigInt(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVReal.fromBigInt(passing), real);
      });
    });

    describe('fromBigIntOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVReal.fromBigIntOrThrow(notPassing));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVReal.fromBigIntOrThrow(passing), real);
      });
    });
  });
});
