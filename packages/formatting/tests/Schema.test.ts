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

	describe('Unpad', () => {
		const schema1 = CVSchema.Unpad({
			paddedLength: 5,
			fillChar: '0',
			disallowEmptyString: true,
			padAtStart: true
		});
		const schema2 = CVSchema.Unpad({
			paddedLength: 5,
			fillChar: '0',
			disallowEmptyString: false,
			padAtStart: true
		});
		const schema3 = CVSchema.Unpad({
			paddedLength: 5,
			fillChar: '0',
			disallowEmptyString: true,
			padAtStart: false
		});
		const schema4 = CVSchema.Unpad({
			paddedLength: 5,
			fillChar: '0',
			disallowEmptyString: false,
			padAtStart: false
		});
		describe('Decoding', () => {
			it('Not enough characters', () => {
				TEUtils.assertTrue(pipe('', Schema.decodeEither(schema1), Either.isLeft));
				TEUtils.assertTrue(pipe('1', Schema.decodeEither(schema1), Either.isLeft));
				TEUtils.assertTrue(pipe('', Schema.decodeEither(schema3), Either.isLeft));
				TEUtils.assertTrue(pipe('1', Schema.decodeEither(schema3), Either.isLeft));
			});
			it('Too many characters', () => {
				TEUtils.assertTrue(pipe('000001', Schema.decodeEither(schema1), Either.isLeft));
				TEUtils.assertTrue(pipe('100000', Schema.decodeEither(schema3), Either.isLeft));
			});
			it('String containing some characters different from the fillChar', () => {
				TEUtils.assertRight(pipe('00110', Schema.decodeEither(schema1)), '110');
				TEUtils.assertRight(pipe('00110', Schema.decodeEither(schema3)), '0011');
			});
			it('String containing only the fillChar', () => {
				TEUtils.assertRight(pipe('00000', Schema.decodeEither(schema1)), '0');
				TEUtils.assertRight(pipe('00000', Schema.decodeEither(schema2)), '');
				TEUtils.assertRight(pipe('00000', Schema.decodeEither(schema3)), '0');
				TEUtils.assertRight(pipe('00000', Schema.decodeEither(schema4)), '');
			});
		});
		it('Encoding', () => {
			TEUtils.assertRight(pipe('11', Schema.encodeEither(schema1)), '00011');
			TEUtils.assertRight(pipe('11', Schema.encodeEither(schema3)), '11000');
		});
	});
});
