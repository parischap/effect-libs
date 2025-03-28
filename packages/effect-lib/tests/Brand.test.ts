/* eslint-disable functional/no-expression-statements */
import { MBrand } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { pipe } from 'effect';
import { describe, it } from 'vitest';

describe('MBrand', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), MBrand.moduleTag);
	});

	describe('Email', () => {
		it('unsafeFromString', () => {
			TEUtils.strictEqual(MBrand.Email.unsafeFromString('foo'), 'foo');
		});

		describe('fromString', () => {
			it('Not passing', () => {
				TEUtils.assertNone(MBrand.Email.fromString.option('foo'));
			});
			it('Passing', () => {
				TEUtils.strictEqual(MBrand.Email.fromString('foo@bar.baz'), 'foo@bar.baz');
			});
		});
	});

	describe('SemVer', () => {
		it('unsafeFromString', () => {
			TEUtils.strictEqual(MBrand.SemVer.unsafeFromString('foo'), 'foo');
		});

		describe('fromString', () => {
			it('Not passing', () => {
				TEUtils.assertNone(MBrand.SemVer.fromString.option('foo'));
			});
			it('Passing', () => {
				TEUtils.strictEqual(MBrand.SemVer.fromString('1.0.1'), '1.0.1');
			});
		});
	});

	describe('Real', () => {
		it('unsafeFromNumber', () => {
			TEUtils.strictEqual(MBrand.Real.unsafeFromNumber(NaN), NaN);
		});

		describe('fromNumber', () => {
			it('Not passing', () => {
				TEUtils.assertNone(MBrand.Real.fromNumber.option(NaN));
			});
			it('Passing', () => {
				TEUtils.strictEqual(MBrand.Real.fromNumber(18.4), 18.4);
			});
		});
	});

	describe('Int', () => {
		it('unsafeFromNumber', () => {
			TEUtils.strictEqual(MBrand.Int.unsafeFromNumber(NaN), NaN);
		});

		describe('fromNumber', () => {
			it('Not passing', () => {
				TEUtils.assertNone(MBrand.Int.fromNumber.option(NaN));
			});
			it('Not passing', () => {
				TEUtils.assertNone(MBrand.Int.fromNumber.option(18.4));
			});
			it('Passing', () => {
				TEUtils.strictEqual(MBrand.Int.fromNumber(18), 18);
			});
		});

		describe('fromReal', () => {
			it('Not passing', () => {
				TEUtils.assertNone(pipe(18.4, MBrand.Real.fromNumber, MBrand.Int.fromReal.option));
			});
			it('Passing', () => {
				TEUtils.strictEqual(pipe(18, MBrand.Real.fromNumber, MBrand.Int.fromReal), 18);
			});
		});
	});

	describe('PositiveInt', () => {
		it('unsafeFromNumber', () => {
			TEUtils.strictEqual(MBrand.PositiveInt.unsafeFromNumber(NaN), NaN);
		});

		describe('fromNumber', () => {
			it('Not passing', () => {
				TEUtils.assertNone(MBrand.PositiveInt.fromNumber.option(NaN));
			});
			it('Not passing', () => {
				TEUtils.assertNone(MBrand.PositiveInt.fromNumber.option(-18));
			});
			it('Passing', () => {
				TEUtils.strictEqual(MBrand.PositiveInt.fromNumber(18), 18);
			});
		});

		describe('fromReal', () => {
			it('Not passing', () => {
				TEUtils.assertNone(pipe(18.4, MBrand.Real.fromNumber, MBrand.PositiveInt.fromReal.option));
			});
			it('Passing', () => {
				TEUtils.strictEqual(pipe(18, MBrand.Real.fromNumber, MBrand.PositiveInt.fromReal), 18);
			});
		});

		describe('fromInt', () => {
			it('Not passing', () => {
				TEUtils.assertNone(pipe(-18, MBrand.Int.fromNumber, MBrand.PositiveInt.fromInt.option));
			});
			it('Passing', () => {
				TEUtils.strictEqual(pipe(18, MBrand.Int.fromNumber, MBrand.PositiveInt.fromInt), 18);
			});
		});

		describe('fromBase10String', () => {
			describe('Integer with no sep', () => {
				const unsignedBase10IntToNumber = MBrand.PositiveInt.fromBase10String('');
				it('Passing', () => {
					TEUtils.assertSome(
						unsignedBase10IntToNumber('10000'),
						MBrand.PositiveInt.unsafeFromNumber(10000)
					);
				});

				it('Not passing', () => {
					TEUtils.assertNone(unsignedBase10IntToNumber('10 000'));
				});
			});

			describe('Integer with space sep', () => {
				const unsignedBase10IntToNumber = MBrand.PositiveInt.fromBase10String(' ');
				it('Passing', () => {
					TEUtils.assertSome(
						unsignedBase10IntToNumber('16 342 124'),
						MBrand.PositiveInt.unsafeFromNumber(16342124)
					);
				});

				it('Not passing', () => {
					TEUtils.assertNone(unsignedBase10IntToNumber('10000'));
				});
			});
		});
	});
});
