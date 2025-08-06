/* eslint-disable functional/no-expression-statements */
import {
	CVEmail,
	CVNumberBase10Format,
	CVPositiveRealInt,
	CVReal,
	CVRealInt,
	CVSchema,
	CVSemVer
} from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, pipe, Schema } from 'effect';
import { describe, it } from 'vitest';

describe('CVSchema', () => {
	describe('EmailFromString', () => {
		it('Not passing', () => {
			TEUtils.assertLeft(pipe('foo', Schema.decodeEither(CVSchema.EmailFromString)));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe('foo@bar.baz', Schema.decodeEither(CVSchema.EmailFromString)));
		});
	});

	it('EmailFromSelf', () => {
		TEUtils.assertRight(
			pipe('foo@bar.baz', CVEmail.unsafeFromString, Schema.decodeEither(CVSchema.EmailFromSelf))
		);
	});

	describe('SemVerFromString', () => {
		it('Not passing', () => {
			TEUtils.assertLeft(pipe('foo', Schema.decodeEither(CVSchema.SemVerFromString)));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe('1.0.1', Schema.decodeEither(CVSchema.SemVerFromString)));
		});
	});

	it('SemVerFromSelf', () => {
		TEUtils.assertRight(
			pipe('1.0.1', CVSemVer.unsafeFromString, Schema.decodeEither(CVSchema.SemVerFromSelf))
		);
	});

	describe('RealFromNumber', () => {
		it('Not passing', () => {
			TEUtils.assertLeft(pipe(Infinity, Schema.decodeEither(CVSchema.RealFromNumber)));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(15.4, Schema.decodeEither(CVSchema.RealFromNumber)));
		});
	});

	it('RealFromSelf', () => {
		TEUtils.assertRight(
			pipe(15.4, CVReal.unsafeFromNumber, Schema.decodeEither(CVSchema.RealFromSelf))
		);
	});

	describe('RealIntFromNumber', () => {
		it('Not passing', () => {
			TEUtils.assertLeft(pipe(Infinity, Schema.decodeEither(CVSchema.RealIntFromNumber)));
			TEUtils.assertLeft(pipe(15.4, Schema.decodeEither(CVSchema.RealIntFromNumber)));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(15, Schema.decodeEither(CVSchema.RealIntFromNumber)));
		});
	});

	it('RealIntFromSelf', () => {
		TEUtils.assertRight(
			pipe(15, CVRealInt.unsafeFromNumber, Schema.decodeEither(CVSchema.RealIntFromSelf))
		);
	});

	describe('PositiveRealIntFromNumber', () => {
		it('Not passing', () => {
			TEUtils.assertLeft(pipe(Infinity, Schema.decodeEither(CVSchema.PositiveRealIntFromNumber)));
			TEUtils.assertLeft(pipe(15.4, Schema.decodeEither(CVSchema.PositiveRealIntFromNumber)));
			TEUtils.assertLeft(pipe(-15, Schema.decodeEither(CVSchema.PositiveRealIntFromNumber)));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(15, Schema.decodeEither(CVSchema.PositiveRealIntFromNumber)));
		});
	});

	it('PositiveRealIntFromSelf', () => {
		TEUtils.assertRight(
			pipe(
				15,
				CVPositiveRealInt.unsafeFromNumber,
				Schema.decodeEither(CVSchema.PositiveRealIntFromSelf)
			)
		);
	});

	describe('PositiveRealFromNumber', () => {
		it('Not passing', () => {
			TEUtils.assertLeft(pipe(Infinity, Schema.decodeEither(CVSchema.PositiveRealFromNumber)));
			TEUtils.assertLeft(pipe(-15.4, Schema.decodeEither(CVSchema.PositiveRealFromNumber)));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(15.4, Schema.decodeEither(CVSchema.PositiveRealFromNumber)));
		});
	});

	it('PositiveRealFromSelf', () => {
		TEUtils.assertRight(
			pipe(
				15.4,
				CVPositiveRealInt.unsafeFromNumber,
				Schema.decodeEither(CVSchema.PositiveRealFromSelf)
			)
		);
	});

	describe('BigDecimal', () => {
		const schema = CVSchema.BigDecimal(CVNumberBase10Format.frenchStyleThreeDecimalNumber);
		describe('Decoding', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(pipe('', Schema.decodeEither(schema)));
			});
			it('Passing', () => {
				TEUtils.assertRight(
					pipe('1 024,56', Schema.decodeEither(schema)),
					BigDecimal.make(102456n, 2)
				);
			});
		});
		it('Encoding', () => {
			TEUtils.assertRight(
				pipe(BigDecimal.make(102456n, 2), Schema.encodeEither(schema)),
				'1 024,56'
			);
		});
	});

	describe('RealFromString', () => {
		const schema = CVSchema.RealFromString(CVNumberBase10Format.frenchStyleThreeDecimalNumber);
		describe('Decoding', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(pipe('', Schema.decodeEither(schema)));
			});
			it('Passing', () => {
				TEUtils.assertRight(
					pipe('1 024,56', Schema.decodeEither(schema)),
					CVReal.unsafeFromNumber(1024.56)
				);
			});
		});
		it('Encoding', () => {
			TEUtils.assertRight(
				pipe(CVReal.unsafeFromNumber(1024.56), Schema.encodeEither(schema)),
				'1 024,56'
			);
			TEUtils.assertRight(pipe(CVReal.unsafeFromNumber(-0), Schema.encodeEither(schema)), '-0');
		});
	});
});
