/* eslint-disable functional/no-expression-statements */
import {
	CVEmail,
	CVNumberBase10Format,
	CVPositiveRealInt,
	CVReal,
	CVRealInt,
	CVSchema,
	CVSemVer
} from '@parischap/formatting';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, Either, pipe, Schema } from 'effect';
import { describe, it } from 'vitest';

describe('CVSchema', () => {
	describe('EmailFromString', () => {
		it('Not passing', () => {
			TEUtils.assertTrue(pipe('foo', Schema.decodeEither(CVSchema.EmailFromString), Either.isLeft));
		});
		it('Passing', () => {
			TEUtils.assertTrue(
				pipe('foo@bar.baz', Schema.decodeEither(CVSchema.EmailFromString), Either.isRight)
			);
		});
	});

	it('EmailFromSelf', () => {
		TEUtils.assertTrue(
			pipe(
				'foo@bar.baz',
				CVEmail.unsafeFromString,
				Schema.decodeEither(CVSchema.EmailFromSelf),
				Either.isRight
			)
		);
	});

	describe('SemVerFromString', () => {
		it('Not passing', () => {
			TEUtils.assertTrue(
				pipe('foo', Schema.decodeEither(CVSchema.SemVerFromString), Either.isLeft)
			);
		});
		it('Passing', () => {
			TEUtils.assertTrue(
				pipe('1.0.1', Schema.decodeEither(CVSchema.SemVerFromString), Either.isRight)
			);
		});
	});

	it('SemVerFromSelf', () => {
		TEUtils.assertTrue(
			pipe(
				'1.0.1',
				CVSemVer.unsafeFromString,
				Schema.decodeEither(CVSchema.SemVerFromSelf),
				Either.isRight
			)
		);
	});

	describe('RealFromNumber', () => {
		it('Not passing', () => {
			TEUtils.assertTrue(
				pipe(Infinity, Schema.decodeEither(CVSchema.RealFromNumber), Either.isLeft)
			);
		});
		it('Passing', () => {
			TEUtils.assertTrue(pipe(15.4, Schema.decodeEither(CVSchema.RealFromNumber), Either.isRight));
		});
	});

	it('RealFromSelf', () => {
		TEUtils.assertTrue(
			pipe(
				15.4,
				CVReal.unsafeFromNumber,
				Schema.decodeEither(CVSchema.RealFromSelf),
				Either.isRight
			)
		);
	});

	describe('RealIntFromNumber', () => {
		it('Not passing', () => {
			TEUtils.assertTrue(
				pipe(Infinity, Schema.decodeEither(CVSchema.RealIntFromNumber), Either.isLeft)
			);
			TEUtils.assertTrue(
				pipe(15.4, Schema.decodeEither(CVSchema.RealIntFromNumber), Either.isLeft)
			);
		});
		it('Passing', () => {
			TEUtils.assertTrue(pipe(15, Schema.decodeEither(CVSchema.RealIntFromNumber), Either.isRight));
		});
	});

	it('RealIntFromSelf', () => {
		TEUtils.assertTrue(
			pipe(
				15,
				CVRealInt.unsafeFromNumber,
				Schema.decodeEither(CVSchema.RealIntFromSelf),
				Either.isRight
			)
		);
	});

	describe('PositiveRealIntFromNumber', () => {
		it('Not passing', () => {
			TEUtils.assertTrue(
				pipe(Infinity, Schema.decodeEither(CVSchema.PositiveRealIntFromNumber), Either.isLeft)
			);
			TEUtils.assertTrue(
				pipe(15.4, Schema.decodeEither(CVSchema.PositiveRealIntFromNumber), Either.isLeft)
			);
			TEUtils.assertTrue(
				pipe(-15, Schema.decodeEither(CVSchema.PositiveRealIntFromNumber), Either.isLeft)
			);
		});
		it('Passing', () => {
			TEUtils.assertTrue(
				pipe(15, Schema.decodeEither(CVSchema.PositiveRealIntFromNumber), Either.isRight)
			);
		});
	});

	it('PositiveRealIntFromSelf', () => {
		TEUtils.assertTrue(
			pipe(
				15,
				CVPositiveRealInt.unsafeFromNumber,
				Schema.decodeEither(CVSchema.PositiveRealIntFromSelf),
				Either.isRight
			)
		);
	});

	describe('PositiveRealFromNumber', () => {
		it('Not passing', () => {
			TEUtils.assertTrue(
				pipe(Infinity, Schema.decodeEither(CVSchema.PositiveRealFromNumber), Either.isLeft)
			);
			TEUtils.assertTrue(
				pipe(-15.4, Schema.decodeEither(CVSchema.PositiveRealFromNumber), Either.isLeft)
			);
		});
		it('Passing', () => {
			TEUtils.assertTrue(
				pipe(15.4, Schema.decodeEither(CVSchema.PositiveRealFromNumber), Either.isRight)
			);
		});
	});

	it('PositiveRealFromSelf', () => {
		TEUtils.assertTrue(
			pipe(
				15.4,
				CVPositiveRealInt.unsafeFromNumber,
				Schema.decodeEither(CVSchema.PositiveRealFromSelf),
				Either.isRight
			)
		);
	});

	describe('BigDecimal', () => {
		const schema = CVSchema.BigDecimal(CVNumberBase10Format.commaAndSpace);
		describe('Decoding', () => {
			it('Not passing', () => {
				TEUtils.assertTrue(pipe('', Schema.decodeEither(schema), Either.isLeft));
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
		const schema = CVSchema.RealFromString(CVNumberBase10Format.commaAndSpace);
		describe('Decoding', () => {
			it('Not passing', () => {
				TEUtils.assertTrue(pipe('', Schema.decodeEither(schema), Either.isLeft));
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
