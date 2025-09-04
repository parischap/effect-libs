/* eslint-disable functional/no-expression-statements */
import {
	CVDateTime,
	CVDateTimeFormat,
	CVEmail,
	CVInteger,
	CVNumberBase10Format,
	CVPositiveInteger,
	CVPositiveReal,
	CVReal,
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
		const schema = CVSchema.Real(CVNumberBase10Format.frenchStyleNumber);
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

	describe('IntegerFromNumber', () => {
		const target = CVInteger.unsafeFromNumber(15);
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.IntegerFromNumber);
			it('Not passing', () => {
				TEUtils.assertLeft(decoder(+Infinity));
				TEUtils.assertLeft(decoder(15.4));
			});
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.IntegerFromNumber);

			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('IntegerFromSelf', () => {
		const target = CVInteger.unsafeFromNumber(15);
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.IntegerFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.IntegerFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('PositiveIntegerFromNumber', () => {
		const target = CVPositiveInteger.unsafeFromNumber(15);
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.PositiveIntegerFromNumber);
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
			const encoder = Schema.encodeEither(CVSchema.PositiveIntegerFromNumber);

			it('Passing', () => {
				TEUtils.assertRight(encoder(target), target);
			});
		});
	});

	describe('PositiveIntegerFromSelf', () => {
		const target = CVPositiveInteger.unsafeFromNumber(15);
		describe('Decoding', () => {
			const decoder = Schema.decodeEither(CVSchema.PositiveIntegerFromSelf);
			it('Passing', () => {
				TEUtils.assertRight(decoder(target), target);
			});
		});

		describe('Encoding', () => {
			const encoder = Schema.encodeEither(CVSchema.PositiveIntegerFromSelf);
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
		const schema = CVSchema.BigDecimal(CVNumberBase10Format.frenchStyleNumber);
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
		const target = CVDateTime.fromTimestampOrThrow(0);
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
		const target = CVDateTime.fromTimestampOrThrow(0);
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
		const target = CVDateTime.fromTimestampOrThrow(1756128920881, 8);
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

	describe('DateTime', () => {
		const placeholder = CVDateTimeFormat.TemplatePart.Placeholder.make;
		const sep = CVDateTimeFormat.TemplatePart.Separator;
		const frenchDateFormat = CVDateTimeFormat.make({
			context: CVDateTimeFormat.Context.unsafeFromLocale('fr-FR'),
			templateparts: [
				placeholder('dd'),
				sep.slash,
				placeholder('MM'),
				sep.slash,
				placeholder('yyyy'),
				sep.space,
				placeholder('HH'),
				sep.colon,
				placeholder('mm'),
				sep.colon,
				placeholder('ss'),
				sep.make(' Paris time')
			]
		});
		const schema = CVSchema.DateTime(frenchDateFormat);
		const target = CVDateTime.fromTimestampOrThrow(new Date(2025, 7, 25, 10, 24, 47).getTime());
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
						CVDateTime.fromTimestampOrThrow,
						encoder
					)
				);
			});
		});
	});
});
