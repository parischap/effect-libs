/* eslint-disable functional/no-expression-statements */
import { CVBrand } from '@parischap/formatting';
import { TEUtils } from '@parischap/test-utils';
import { Either, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVBrand', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVBrand.moduleTag);
	});

	describe('Email', () => {
		it('unsafeFromString', () => {
			TEUtils.strictEqual(CVBrand.Email.unsafeFromString('foo'), 'foo');
		});

		describe('fromString', () => {
			it('Not passing', () => {
				TEUtils.assertTrue(pipe('foo', CVBrand.Email.fromString, Either.isLeft));
			});
			it('Passing', () => {
				TEUtils.assertTrue(pipe('foo@bar.baz', CVBrand.Email.fromString, Either.isRight));
			});
		});
	});

	describe('SemVer', () => {
		it('unsafeFromString', () => {
			TEUtils.strictEqual(CVBrand.SemVer.unsafeFromString('foo'), 'foo');
		});

		describe('fromString', () => {
			it('Not passing', () => {
				TEUtils.assertTrue(pipe('foo', CVBrand.SemVer.fromString, Either.isLeft));
			});
			it('Passing', () => {
				TEUtils.assertTrue(pipe('1.0.1', CVBrand.SemVer.fromString, Either.isRight));
			});
		});
	});

	describe('Real', () => {
		it('unsafeFromNumber', () => {
			TEUtils.strictEqual(CVBrand.Real.unsafeFromNumber(NaN), NaN);
			TEUtils.strictEqual(CVBrand.Real.unsafeFromNumber(15.4), 15.4);
		});

		describe('fromNumber', () => {
			it('Not passing', () => {
				TEUtils.assertTrue(pipe(NaN, CVBrand.Real.fromNumber, Either.isLeft));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVBrand.Real.fromNumber(18.4), CVBrand.Real.unsafeFromNumber(18.4));
			});
		});
	});

	describe('RealInt', () => {
		describe('unsafeFromNumber', () => {
			TEUtils.strictEqual(CVBrand.RealInt.unsafeFromNumber(NaN), NaN);
			TEUtils.strictEqual(CVBrand.RealInt.unsafeFromNumber(15), 15);
		});

		describe('fromNumber', () => {
			it('Not passing: not finite', () => {
				TEUtils.assertTrue(pipe(NaN, CVBrand.RealInt.fromNumber, Either.isLeft));
			});
			it('Not passing: not integer', () => {
				TEUtils.assertTrue(pipe(18.4, CVBrand.RealInt.fromNumber, Either.isLeft));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVBrand.RealInt.fromNumber(18), CVBrand.RealInt.unsafeFromNumber(18));
			});
		});

		describe('fromReal', () => {
			it('Not passing', () => {
				TEUtils.assertTrue(
					pipe(18.4, CVBrand.Real.unsafeFromNumber, CVBrand.RealInt.fromReal, Either.isLeft)
				);
			});
			it('Passing', () => {
				TEUtils.assertRight(
					pipe(18, CVBrand.Real.unsafeFromNumber, CVBrand.RealInt.fromReal),
					CVBrand.RealInt.unsafeFromNumber(18)
				);
			});
		});
	});

	describe('PositiveRealInt', () => {
		it('unsafeFromNumber', () => {
			TEUtils.strictEqual(CVBrand.PositiveRealInt.unsafeFromNumber(NaN), NaN);
			TEUtils.strictEqual(CVBrand.PositiveRealInt.unsafeFromNumber(15), 15);
		});

		describe('fromNumber', () => {
			it('Not passing: not finite', () => {
				TEUtils.assertTrue(pipe(NaN, CVBrand.PositiveRealInt.fromNumber, Either.isLeft));
			});
			it('Not passing: not positive', () => {
				TEUtils.assertTrue(pipe(-18, CVBrand.PositiveRealInt.fromNumber, Either.isLeft));
			});
			it('Not passing: not an integer', () => {
				TEUtils.assertTrue(pipe(18.4, CVBrand.PositiveRealInt.fromNumber, Either.isLeft));
			});
			it('Passing', () => {
				TEUtils.assertRight(
					CVBrand.PositiveRealInt.fromNumber(18),
					CVBrand.PositiveRealInt.unsafeFromNumber(18)
				);
			});
		});

		describe('fromInt', () => {
			it('Not passing: not positive', () => {
				TEUtils.assertTrue(
					pipe(
						-18,
						CVBrand.RealInt.unsafeFromNumber,
						CVBrand.PositiveRealInt.fromInt,
						Either.isLeft
					)
				);
			});
			it('Passing', () => {
				TEUtils.assertRight(
					pipe(18, CVBrand.RealInt.unsafeFromNumber, CVBrand.PositiveRealInt.fromInt),
					CVBrand.PositiveRealInt.unsafeFromNumber(18)
				);
			});
		});

		describe('fromReal', () => {
			it('Not passing: not an integer', () => {
				TEUtils.assertTrue(
					pipe(18.4, CVBrand.Real.unsafeFromNumber, CVBrand.PositiveRealInt.fromReal, Either.isLeft)
				);
			});
			it('Not passing: not positive', () => {
				TEUtils.assertTrue(
					pipe(-18, CVBrand.Real.unsafeFromNumber, CVBrand.PositiveRealInt.fromReal, Either.isLeft)
				);
			});
			it('Passing', () => {
				TEUtils.assertRight(
					pipe(18, CVBrand.Real.unsafeFromNumber, CVBrand.PositiveRealInt.fromReal),
					CVBrand.PositiveRealInt.unsafeFromNumber(18)
				);
			});
		});
	});
});
