import * as TestUtils from '@parischap/configs/TestUtils';
import { CVInteger, CVPositiveInteger, CVPositiveReal, CVReal } from '@parischap/conversions';
import { BigDecimal, Option } from 'effect';
import { describe, it } from 'vitest';

describe('CVPositiveInteger', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(CVPositiveInteger.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Conversions from number', () => {
    const notPassing1 = Infinity;
    const notPassing2 = 15.4;
    const notPassing3 = -15;
    const passing = 15 as CVPositiveInteger.Type;

    describe('unsafeFromNumber', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromNumber(notPassing1));
        TestUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromNumber(notPassing2));
        TestUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromNumber(notPassing3));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveInteger.unsafeFromNumber(passing), passing);
      });
    });

    describe('fromNumberOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVPositiveInteger.fromNumberOption(notPassing1));
        TestUtils.assertNone(CVPositiveInteger.fromNumberOption(notPassing2));
        TestUtils.assertNone(CVPositiveInteger.fromNumberOption(notPassing3));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVPositiveInteger.fromNumberOption(passing), passing);
      });
    });

    describe('fromNumber', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVPositiveInteger.fromNumber(notPassing1));
        TestUtils.assertLeft(CVPositiveInteger.fromNumber(notPassing2));
        TestUtils.assertLeft(CVPositiveInteger.fromNumber(notPassing3));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVPositiveInteger.fromNumber(passing), passing);
      });
    });

    describe('fromNumberOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVPositiveInteger.fromNumberOrThrow(notPassing1));
        TestUtils.throws(() => CVPositiveInteger.fromNumberOrThrow(notPassing2));
        TestUtils.throws(() => CVPositiveInteger.fromNumberOrThrow(notPassing3));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveInteger.fromNumberOrThrow(passing), passing);
      });
    });
  });

  describe('Conversions from BigDecimal', () => {
    const notPassing1 = BigDecimal.make(1n, -500);
    const notPassing2 = BigDecimal.make(154n, 1);
    const notPassing3 = BigDecimal.make(-154n, 0);
    const passing = BigDecimal.make(154n, 0);
    const integer = 154 as CVPositiveInteger.Type;

    describe('unsafeFromBigDecimal', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromBigDecimal(notPassing1));
        TestUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromBigDecimal(notPassing2));
        TestUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromBigDecimal(notPassing3));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveInteger.unsafeFromBigDecimal(passing), integer);
      });
    });

    describe('fromBigDecimalOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVPositiveInteger.fromBigDecimalOption(notPassing1));
        TestUtils.assertNone(CVPositiveInteger.fromBigDecimalOption(notPassing2));
        TestUtils.assertNone(CVPositiveInteger.fromBigDecimalOption(notPassing3));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVPositiveInteger.fromBigDecimalOption(passing), integer);
      });
    });

    describe('fromBigDecimal', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVPositiveInteger.fromBigDecimal(notPassing1));
        TestUtils.assertLeft(CVPositiveInteger.fromBigDecimal(notPassing2));
        TestUtils.assertLeft(CVPositiveInteger.fromBigDecimal(notPassing3));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVPositiveInteger.fromBigDecimal(passing), integer);
      });
    });

    describe('fromBigDecimalOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVPositiveInteger.fromBigDecimalOrThrow(notPassing1));
        TestUtils.throws(() => CVPositiveInteger.fromBigDecimalOrThrow(notPassing2));
        TestUtils.throws(() => CVPositiveInteger.fromBigDecimalOrThrow(notPassing3));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveInteger.fromBigDecimalOrThrow(passing), integer);
      });
    });
  });

  describe('Conversions from BigInt', () => {
    const notPassing1 = 10n ** 500n;
    const notPassing2 = -154n;
    const passing = 154n;
    const integer = 154 as CVPositiveInteger.Type;

    describe('unsafeFromBigInt', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromBigInt(notPassing1));
        TestUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromBigInt(notPassing2));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveInteger.unsafeFromBigInt(passing), integer);
      });
    });

    describe('fromBigIntOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVPositiveInteger.fromBigIntOption(notPassing1));
        TestUtils.assertNone(CVPositiveInteger.fromBigIntOption(notPassing2));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVPositiveInteger.fromBigIntOption(passing), integer);
      });
    });

    describe('fromBigInt', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVPositiveInteger.fromBigInt(notPassing1));
        TestUtils.assertLeft(CVPositiveInteger.fromBigInt(notPassing2));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVPositiveInteger.fromBigInt(passing), integer);
      });
    });

    describe('fromBigIntOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVPositiveInteger.fromBigIntOrThrow(notPassing1));
        TestUtils.throws(() => CVPositiveInteger.fromBigIntOrThrow(notPassing2));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveInteger.fromBigIntOrThrow(passing), integer);
      });
    });
  });

  describe('Conversions from Real', () => {
    const notPassing1 = CVReal.unsafeFromNumber(-15);
    const notPassing2 = CVReal.unsafeFromNumber(15.4);
    const passing = CVReal.unsafeFromNumber(15);
    const integer = 15 as CVPositiveInteger.Type;

    describe('unsafeFromReal', () => {
      it('Not passing', () => {
        TestUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromReal(notPassing1));
        TestUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromReal(notPassing2));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveInteger.unsafeFromReal(passing), integer);
      });
    });

    describe('fromRealOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVPositiveInteger.fromRealOption(notPassing1));
        TestUtils.assertNone(CVPositiveInteger.fromRealOption(notPassing2));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVPositiveInteger.fromRealOption(passing), integer);
      });
    });

    describe('fromReal', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVPositiveInteger.fromReal(notPassing1));
        TestUtils.assertLeft(CVPositiveInteger.fromReal(notPassing2));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVPositiveInteger.fromReal(passing), integer);
      });
    });

    describe('fromRealOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVPositiveInteger.fromRealOrThrow(notPassing1));
        TestUtils.throws(() => CVPositiveInteger.fromRealOrThrow(notPassing2));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveInteger.fromRealOrThrow(passing), integer);
      });
    });
  });

  describe('Conversions from Integer', () => {
    const notPassing = CVInteger.unsafeFromNumber(-15);
    const passing = CVInteger.unsafeFromNumber(15);
    const integer = 15 as CVPositiveInteger.Type;

    describe('fromIntegerOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVPositiveInteger.fromIntegerOption(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVPositiveInteger.fromIntegerOption(passing), integer);
      });
    });

    describe('fromInteger', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVPositiveInteger.fromInteger(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVPositiveInteger.fromInteger(passing), integer);
      });
    });

    describe('fromIntegerOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVPositiveInteger.fromIntegerOrThrow(notPassing));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveInteger.fromIntegerOrThrow(passing), integer);
      });
    });
  });

  describe('Conversions from PositiveReal', () => {
    const notPassing = CVPositiveReal.unsafeFromNumber(15.4);
    const passing = CVPositiveReal.unsafeFromNumber(15);
    const integer = 15 as CVPositiveInteger.Type;

    describe('fromPositiveRealOption', () => {
      it('Not passing', () => {
        TestUtils.assertNone(CVPositiveInteger.fromPositiveRealOption(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertSome(CVPositiveInteger.fromPositiveRealOption(passing), integer);
      });
    });

    describe('fromPositiveReal', () => {
      it('Not passing', () => {
        TestUtils.assertLeft(CVPositiveInteger.fromPositiveReal(notPassing));
      });
      it('Passing', () => {
        TestUtils.assertRight(CVPositiveInteger.fromPositiveReal(passing), integer);
      });
    });

    describe('fromPositiveRealOrThrow', () => {
      it('Not passing', () => {
        TestUtils.throws(() => CVPositiveInteger.fromPositiveRealOrThrow(notPassing));
      });
      it('Passing', () => {
        TestUtils.strictEqual(CVPositiveInteger.fromPositiveRealOrThrow(passing), integer);
      });
    });
  });
});
