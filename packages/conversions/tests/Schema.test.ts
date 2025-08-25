/* eslint-disable functional/no-expression-statements */
import {
	CVDateTime,
	CVDateTimeFormat,
	CVEmail,
	CVNumberBase10Format,
	CVPositiveReal,
	CVPositiveRealInt,
	CVReal,
	CVRealInt,
	CVSchema,
	CVSemVer
} from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, Either, pipe, Schema } from 'effect';
import { describe, it } from 'vitest';

describe('CVSchema', () => {
	describe('Email', () => {
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.Email);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder('foo'));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder('foo@bar.baz'));
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.Email);

			it('Passing', () => {
				TEUtils.assertRight(pipe('foo@bar.baz', CVEmail.unsafeFromString, encoder));
			});
		});
	});

	describe('EmailFromSelf', () => {
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.EmailFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(pipe('foo@bar.baz', CVEmail.unsafeFromString, decoder));
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.EmailFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(pipe('foo@bar.baz', CVEmail.unsafeFromString, encoder));
			});
		});
	});

	describe('SemVer', () => {
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.SemVer);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder('foo'));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder('1.0.1'));
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.SemVer);

			it('Passing', () => {
				TEUtils.assertRight(pipe('1.0.1', CVSemVer.unsafeFromString, encoder));
			});
		});
	});

	describe('SemVerFromSelf', () => {
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.SemVerFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(pipe('1.0.1', CVSemVer.unsafeFromString, decoder));
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.SemVerFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(pipe('1.0.1', CVSemVer.unsafeFromString, encoder));
			});
		});
	});

	describe('RealFromNumber', () => {
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.RealFromNumber);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(+Infinity));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder(15.4));
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.RealFromNumber);

			it('Passing', () => {
				TEUtils.assertRight(pipe(15.4, CVReal.unsafeFromNumber, encoder));
			});
		});
	});

	describe('RealFromSelf', () => {
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.RealFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(pipe(15.4, CVReal.unsafeFromNumber, decoder));
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.RealFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(pipe(15.4, CVReal.unsafeFromNumber, encoder));
			});
		});
	});

	describe('Real', () => {
		const schema = CVSchema.Real(CVNumberBase10Format.frenchStyleThreeDecimalNumber);
		const decoder = Schema.decodeEither(schema);
		describe('Decoding', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(''));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder('1 024,56'), CVReal.unsafeFromNumber(1024.56));
			});
		});
		it('Encoding', () => {
			const encoder = Schema.encodeEither(schema);
			TEUtils.assertRight(pipe(1024.56, CVReal.unsafeFromNumber, encoder), '1 024,56');
		});
	});

	describe('RealIntFromNumber', () => {
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.RealIntFromNumber);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(+Infinity));
				TEUtils.assertLeft(decoder(15.4));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder(15));
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.RealIntFromNumber);

			it('Passing', () => {
				TEUtils.assertRight(pipe(15, CVRealInt.unsafeFromNumber, encoder));
			});
		});
	});

	describe('RealIntFromSelf', () => {
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.RealIntFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(pipe(15, CVRealInt.unsafeFromNumber, decoder));
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.RealIntFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(pipe(15, CVRealInt.unsafeFromNumber, encoder));
			});
		});
	});

	describe('PositiveRealIntFromNumber', () => {
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.PositiveRealIntFromNumber);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(+Infinity));
				TEUtils.assertLeft(decoder(15.4));
				TEUtils.assertLeft(decoder(-15));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder(15));
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.PositiveRealIntFromNumber);

			it('Passing', () => {
				TEUtils.assertRight(pipe(15, CVPositiveRealInt.unsafeFromNumber, encoder));
			});
		});
	});

	describe('PositiveRealIntFromSelf', () => {
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.PositiveRealIntFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(pipe(15, CVPositiveRealInt.unsafeFromNumber, decoder));
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.PositiveRealIntFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(pipe(15, CVPositiveRealInt.unsafeFromNumber, encoder));
			});
		});
	});

	describe('PositiveRealFromNumber', () => {
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.PositiveRealFromNumber);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(+Infinity));
				TEUtils.assertLeft(decoder(-15.4));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder(15.4));
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.PositiveRealFromNumber);

			it('Passing', () => {
				TEUtils.assertRight(pipe(15.4, CVPositiveReal.unsafeFromNumber, encoder));
			});
		});
	});

	describe('PositiveRealFromSelf', () => {
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.PositiveRealFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(pipe(15.4, CVPositiveReal.unsafeFromNumber, decoder));
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.PositiveRealFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(pipe(15.4, CVPositiveReal.unsafeFromNumber, encoder));
			});
		});
	});

	describe('BigDecimal', () => {
		const schema = CVSchema.BigDecimal(CVNumberBase10Format.frenchStyleThreeDecimalNumber);
		const decoder = Schema.decodeEither(schema);
		describe('Decoding', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(''));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder('1 024,56'), BigDecimal.make(102456n, 2));
			});
		});
		it('Encoding', () => {
			const encoder = Schema.encodeEither(schema);
			TEUtils.assertRight(encoder(BigDecimal.make(102456n, 2)), '1 024,56');
		});
	});

	describe('DateTimeFromSelf', () => {
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.DateTimeFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(pipe(0, CVDateTime.fromTimestamp, Either.flatMap(decoder)));
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.DateTimeFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(pipe(0, CVDateTime.fromTimestamp, Either.flatMap(encoder)));
			});
		});
	});

	describe('DateTimeFromString', () => {
		const tag = CVDateTimeFormat.Placeholder.Tag.make;
		const sep = CVDateTimeFormat.Placeholder.Separator;
		const frenchDateFormat = CVDateTimeFormat.make({
			context: CVDateTimeFormat.Context.unsafeFromLocale('fr-FR'),
			placeholders: [
				tag('dd'),
				sep.slash,
				tag('MM'),
				sep.slash,
				tag('yyyy'),
				sep.space,
				tag('HH'),
				sep.colon,
				tag('mm'),
				sep.colon,
				tag('ss'),
				sep.make(' Paris time')
			]
		});
		const schema = CVSchema.DateTimeFromString(frenchDateFormat);
		const decoder = Schema.decodeEither(schema);
		describe('Decoding', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(''));
				TEUtils.assertLeft(decoder('2025/12/14'));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder('25/08/2025 10:24:47 Paris time'));
			});
		});
		describe('Encoding', () => {
			const encoder = Schema.encodeEither(schema);
			it('Passing', () => {
				TEUtils.assertRight(
					pipe(
						new Date(2025, 7, 25, 10, 24, 47).getTime(),
						CVDateTime.unsafeFromTimestamp,
						encoder
					),
					'25/08/2025 10:24:47 Paris time'
				);
			});

			it('Not passing', () => {
				TEUtils.assertLeft(
					pipe(
						new Date(12025, 7, 25, 10, 24, 47).getTime(),
						CVDateTime.unsafeFromTimestamp,
						encoder
					)
				);
			});
		});
	});
});
