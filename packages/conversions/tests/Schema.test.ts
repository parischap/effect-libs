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
import { BigDecimal, DateTime, pipe, Schema } from 'effect';
import { describe, it } from 'vitest';

describe('CVSchema', () => {
	describe('Email', () => {
		const target = CVEmail.unsafeFromString('foo@bar.baz');
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.Email);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder('foo'));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.Email);

			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('EmailFromSelf', () => {
		const target = CVEmail.unsafeFromString('foo@bar.baz');
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.EmailFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.EmailFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('SemVer', () => {
		const target = CVSemVer.unsafeFromString('1.0.1');
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.SemVer);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder('foo'));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.SemVer);

			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('SemVerFromSelf', () => {
		const target = CVSemVer.unsafeFromString('1.0.1');
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.SemVerFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.SemVerFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('RealFromNumber', () => {
		const target = CVReal.unsafeFromNumber(15.4);
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.RealFromNumber);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(+Infinity));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.RealFromNumber);

			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('RealFromSelf', () => {
		const target = CVReal.unsafeFromNumber(15.4);
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.RealFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.RealFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('Real', () => {
		const schema = CVSchema.Real(CVNumberBase10Format.frenchStyleThreeDecimalNumber);
		const target = CVReal.unsafeFromNumber(1024.56);
		const targetAsString = '1 024,56';
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(schema);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(''));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder(targetAsString), target);
			});
		});
		it('Encoding', () => {
			const encoder = Schema.encodeEither(schema);
			TEUtils.assertRight(encoder(target), targetAsString);
		});
	});

	describe('RealIntFromNumber', () => {
		const target = CVRealInt.unsafeFromNumber(15);
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.RealIntFromNumber);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(+Infinity));
				TEUtils.assertLeft(decoder(15.4));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.RealIntFromNumber);

			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('RealIntFromSelf', () => {
		const target = CVRealInt.unsafeFromNumber(15);
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.RealIntFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.RealIntFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('PositiveRealIntFromNumber', () => {
		const target = CVPositiveRealInt.unsafeFromNumber(15);
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.PositiveRealIntFromNumber);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(+Infinity));
				TEUtils.assertLeft(decoder(15.4));
				TEUtils.assertLeft(decoder(-15));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.PositiveRealIntFromNumber);

			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('PositiveRealIntFromSelf', () => {
		const target = CVPositiveRealInt.unsafeFromNumber(15);
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.PositiveRealIntFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.PositiveRealIntFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('PositiveRealFromNumber', () => {
		const target = CVPositiveReal.unsafeFromNumber(15.4);
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.PositiveRealFromNumber);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(+Infinity));
				TEUtils.assertLeft(decoder(-15.4));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.PositiveRealFromNumber);

			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('PositiveRealFromSelf', () => {
		const target = CVPositiveReal.unsafeFromNumber(15.4);
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.PositiveRealFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.PositiveRealFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('BigDecimal', () => {
		const schema = CVSchema.BigDecimal(CVNumberBase10Format.frenchStyleThreeDecimalNumber);
		const target = BigDecimal.make(102456n, 2);
		const targetAsString = '1 024,56';
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(schema);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(''));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder(targetAsString), target);
			});
		});
		it('Encoding', () => {
			const encoder = Schema.encodeEither(schema);
			TEUtils.assertRight(encoder(target), targetAsString);
		});
	});

	describe('DateTimeFromSelf', () => {
		const target = CVDateTime.unsafeFromTimestamp(0);
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.DateTimeFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.DateTimeFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('DateTimeFromDate', () => {
		const target = CVDateTime.unsafeFromTimestamp(0);
		const targetAsDate = new Date(0);
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.DateTimeFromDate);
			it('Passing', () => {
				TEUtils.assertRight(decoder(targetAsDate), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.DateTimeFromDate);
			it('Passing', () => {
				TEUtils.assertRight(encoder(target), targetAsDate);
			});
		});
	});

	describe('DateTimeFromEffectDateTime', () => {
		const target = CVDateTime.unsafeFromTimestamp(1756128920881, 8);
		const targetAsEFfectDateTime = DateTime.unsafeMakeZoned(1756128920881, { timeZone: 8 });
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.DateTimeFromEffectDateTime);
			it('Passing', () => {
				TEUtils.assertRight(decoder(targetAsEFfectDateTime), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.DateTimeFromEffectDateTime);
			it('Passing', () => {
				TEUtils.assertRight(encoder(target), targetAsEFfectDateTime);
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
		const target = CVDateTime.unsafeFromTimestamp(new Date(2025, 7, 25, 10, 24, 47).getTime());
		const targetAsString = '25/08/2025 10:24:47 Paris time';

		describe('Decoding', () => {
			const decoder = Schema.decodeEither(schema);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(''));
				TEUtils.assertLeft(decoder('2025/12/14'));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder(targetAsString), target);
			});
		});
		describe('Encoding', () => {
			const encoder = Schema.encodeEither(schema);
			it('Passing', () => {
				TEUtils.assertRight(encoder(target), targetAsString);
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
