import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVInteger from '@parischap/conversions/CVInteger'
import * as CVReal from '@parischap/conversions/CVReal'
import * as BigDecimal from 'effect/BigDecimal'
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('CVInteger', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(CVInteger.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Conversions from number', () => {
    const notPassing1 = -Infinity;
    const notPassing2 = -15.4;
    const passing = -15 as CVInteger.Type;

    describe('unsafeFromNumber', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVInteger.unsafeFromNumber(notPassing1));
        TestUtils.doesNotThrow(() => CVInteger.unsafeFromNumber(notPassing2));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVInteger.unsafeFromNumber(passing), passing);
      });
    });

    describe('fromNumberOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVInteger.fromNumberOption(notPassing1));
        TestUtils.assertNone(CVInteger.fromNumberOption(notPassing2));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVInteger.fromNumberOption(passing), passing);
      });
    });

    describe('fromNumber', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVInteger.fromNumber(notPassing1));
        TestUtils.assertLeft(CVInteger.fromNumber(notPassing2));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVInteger.fromNumber(passing), passing);
      });
    });

    describe('fromNumberOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVInteger.fromNumberOrThrow(notPassing1));
        TestUtils.throws(() => CVInteger.fromNumberOrThrow(notPassing2));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVInteger.fromNumberOrThrow(passing), passing);
      });
    });
  });

  describe('Conversions from BigDecimal', () => {
    const notPassing1 = BigDecimal.make(1n, -500);
    const notPassing2 = BigDecimal.make(-154n, 1);
    const passing = BigDecimal.make(154n, 0);
    const integer = 154 as CVInteger.Type;

    describe('unsafeFromBigDecimal', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVInteger.unsafeFromBigDecimal(notPassing1));
        TestUtils.doesNotThrow(() => CVInteger.unsafeFromBigDecimal(notPassing2));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVInteger.unsafeFromBigDecimal(passing), integer);
      });
    });

    describe('fromBigDecimalOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVInteger.fromBigDecimalOption(notPassing1));
        TestUtils.assertNone(CVInteger.fromBigDecimalOption(notPassing2));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVInteger.fromBigDecimalOption(passing), integer);
      });
    });

    describe('fromBigDecimal', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVInteger.fromBigDecimal(notPassing1));
        TestUtils.assertLeft(CVInteger.fromBigDecimal(notPassing2));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVInteger.fromBigDecimal(passing), integer);
      });
    });

    describe('fromBigDecimalOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVInteger.fromBigDecimalOrThrow(notPassing1));
        TestUtils.throws(() => CVInteger.fromBigDecimalOrThrow(notPassing2));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVInteger.fromBigDecimalOrThrow(passing), integer);
      });
    });
  });

  describe('Conversions from BigInt', () => {
    const notPassing = 10n ** 500n;
    const passing = 154n;
    const integer = 154 as CVInteger.Type;

    describe('unsafeFromBigInt', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVInteger.unsafeFromBigInt(notPassing));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVInteger.unsafeFromBigInt(passing), integer);
      });
    });

    describe('fromBigIntOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVInteger.fromBigIntOption(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVInteger.fromBigIntOption(passing), integer);
      });
    });

    describe('fromBigInt', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVInteger.fromBigInt(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVInteger.fromBigInt(passing), integer);
      });
    });

    describe('fromBigIntOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVInteger.fromBigIntOrThrow(notPassing));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVInteger.fromBigIntOrThrow(passing), integer);
      });
    });
  });

  describe('Conversions from Real', () => {
    const notPassing = CVReal.unsafeFromNumber(-15.4);
    const passing = CVReal.unsafeFromNumber(-15);
    const integer = -15 as CVInteger.Type;

    describe('unsafeFromReal', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVInteger.unsafeFromReal(notPassing));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVInteger.unsafeFromReal(passing), integer);
      });
    });

    describe('fromRealOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVInteger.fromRealOption(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVInteger.fromRealOption(passing), integer);
      });
    });

    describe('fromReal', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVInteger.fromReal(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVInteger.fromReal(passing), integer);
      });
    });

    describe('fromRealOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVInteger.fromRealOrThrow(notPassing));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVInteger.fromRealOrThrow(passing), integer);
      });
    });
  });
});
