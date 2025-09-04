/**
 * An extension to the Effect Schema module that adds Schema instances for data conversion like
 * number and date formatting and parsing
 */

import { BigDecimal, DateTime, Either, flow, Option, ParseResult, pipe, Schema } from 'effect';
import * as CVDateTime from './DateTime.js';
import * as CVDateTimeFormat from './DateTimeFormat.js';
import * as CVEmail from './Email.js';
import * as CVInteger from './Integer.js';
import * as CVNumberBase10Format from './NumberBase10Format.js';
import * as CVPositiveInteger from './PositiveInteger.js';
import * as CVPositiveReal from './PositiveReal.js';
import * as CVReal from './Real.js';
import * as CVSemVer from './SemVer.js';

/**
 * A Schema that transforms a string into a CVBrand.Email.Type
 *
 * @category Schema transformations
 */
export const Email: Schema.Schema<CVEmail.Type, string> = Schema.String.pipe(
	Schema.fromBrand(CVEmail.constructor)
);

/**
 * A Schema that represents a CVBrand.Email.Type
 *
 * @category Schema instances
 */
export const EmailFromSelf: Schema.Schema<CVEmail.Type> = Schema.typeSchema(Email);

/**
 * A Schema that transforms a string into an CVBrand.SemVer.Type
 *
 * @category Schema transformations
 */
export const SemVer: Schema.Schema<CVSemVer.Type, string> = Schema.String.pipe(
	Schema.fromBrand(CVSemVer.constructor)
);

/**
 * A Schema that represents a CVBrand.SemVer.Type
 *
 * @category Schema instances
 */
export const SemVerFromSelf: Schema.Schema<CVSemVer.Type> = Schema.typeSchema(SemVer);

/**
 * A Schema that transforms a number into an CVReal.Type
 *
 * @category Schema transformations
 */
export const RealFromNumber: Schema.Schema<CVReal.Type, number> = Schema.Number.pipe(
	Schema.fromBrand(CVReal.constructor)
);

/**
 * A Schema that represents a CVReal.Type
 *
 * @category Schema instances
 */
export const RealFromSelf: Schema.Schema<CVReal.Type> = Schema.typeSchema(RealFromNumber);

/**
 * A Schema that transforms a string into a Real according to the CVNumberBase10Format `format`.
 * Read documentation of CVNumberBase10Format.toRealParser and
 * CVNumberBase10Format.toNumberFormatter for more details
 *
 * @category Schema transformations
 */
export const Real = (format: CVNumberBase10Format.Type): Schema.Schema<CVReal.Type, string> => {
	const parser = CVNumberBase10Format.toRealParser(format);
	const formatter = CVNumberBase10Format.toNumberFormatter(format);
	return Schema.transformOrFail(Schema.String, RealFromSelf, {
		strict: true,
		decode: (input, _options, ast) =>
			pipe(
				input,
				parser,
				Either.fromOption(
					() => new ParseResult.Type(ast, input, 'Failed to convert string to Real')
				)
			),
		encode: flow(formatter, ParseResult.succeed)
	});
};

/**
 * A Schema that transforms a number into a CVInteger.Type
 *
 * @category Schema transformations
 */
export const IntegerFromNumber: Schema.Schema<CVInteger.Type, number> = Schema.Number.pipe(
	Schema.fromBrand(CVInteger.constructor)
);

/**
 * A Schema that represents a CVInteger.Type
 *
 * @category Schema instances
 */
export const IntegerFromSelf: Schema.Schema<CVInteger.Type> = Schema.typeSchema(IntegerFromNumber);

/**
 * A Schema that transforms a number into a CVPositiveInteger.Type
 *
 * @category Schema transformations
 */
export const PositiveIntegerFromNumber: Schema.Schema<CVPositiveInteger.Type, number> =
	Schema.Number.pipe(Schema.fromBrand(CVPositiveInteger.constructor));

/**
 * A Schema that represents a CVPositiveInteger.Type
 *
 * @category Schema instances
 */
export const PositiveIntegerFromSelf: Schema.Schema<CVPositiveInteger.Type> =
	Schema.typeSchema(PositiveIntegerFromNumber);

/**
 * A Schema that transforms a number into a CVPositiveReal.Type
 *
 * @category Schema transformations
 */
export const PositiveRealFromNumber: Schema.Schema<CVPositiveReal.Type, number> =
	Schema.Number.pipe(Schema.fromBrand(CVPositiveReal.constructor));

/**
 * A Schema that represents a CVPositiveReal.Type
 *
 * @category Schema instances
 */
export const PositiveRealFromSelf: Schema.Schema<CVPositiveReal.Type> =
	Schema.typeSchema(PositiveRealFromNumber);

const BigDecimalFromString = (
	format: CVNumberBase10Format.Type
): Schema.Schema<BigDecimal.BigDecimal, string> => {
	const parser = CVNumberBase10Format.toBigDecimalParser(format);
	const formatter = CVNumberBase10Format.toNumberFormatter(format);
	return Schema.transformOrFail(Schema.String, Schema.BigDecimalFromSelf, {
		strict: true,
		decode: (input, _options, ast) =>
			pipe(
				input,
				parser,
				Option.map(ParseResult.succeed),
				Option.getOrElse(() =>
					ParseResult.fail(
						new ParseResult.Type(ast, input, 'Failed to convert string to BigDecimal')
					)
				)
			),
		encode: flow(formatter, ParseResult.succeed)
	});
};

export {
	/**
	 * A Schema that transforms a string into a BigDecimal according to the CVNumberBase10Format
	 * `format`. Read documentation of CVNumberBase10Format.toBigDecimalParser and
	 * CVNumberBase10Format.toNumberFormatter for more details
	 *
	 * @category Schema transformations
	 */
	BigDecimalFromString as BigDecimal
};

/**
 * A Schema that represents a CVDateTime
 *
 * @category Schema instances
 */
export const DateTimeFromSelf = Schema.declare((input: unknown): input is CVDateTime.Type =>
	CVDateTime.has(input)
);

/**
 * A Schema that transforms a Date into a CVDateTime. The CVDateTimeObject is created with the
 * default timeZoneOffset of the machine this code is running on
 *
 * @category Schema instances
 */
export const DateTimeFromDate: Schema.Schema<CVDateTime.Type, Date> = Schema.transform(
	Schema.DateFromSelf,
	DateTimeFromSelf,
	{
		strict: true,
		decode: (input) => CVDateTime.fromTimestampOrThrow(input.getTime()),
		encode: (input) => new Date(CVDateTime.timestamp(input))
	}
);

/**
 * A Schema that transforms an Effect DateTime.Zoned into a CVDateTime. Both objects share the same
 * time zone offset.
 *
 * @category Schema instances
 */
export const DateTimeFromEffectDateTime: Schema.Schema<CVDateTime.Type, DateTime.Zoned> =
	Schema.transform(Schema.DateTimeZonedFromSelf, DateTimeFromSelf, {
		strict: true,
		decode: (input) =>
			CVDateTime.fromTimestampOrThrow(DateTime.toEpochMillis(input), DateTime.zonedOffset(input)),
		encode: (input) =>
			DateTime.unsafeMakeZoned(CVDateTime.timestamp(input), { timeZone: input.zoneOffset })
	});

const DateTimeFromString = (
	format: CVDateTimeFormat.Type
): Schema.Schema<CVDateTime.Type, string> => {
	const parser = CVDateTimeFormat.toParser(format);
	const formatter = CVDateTimeFormat.toFormatter(format);
	return Schema.transformOrFail(Schema.String, DateTimeFromSelf, {
		strict: true,
		decode: (input, _options, ast) =>
			pipe(
				input,
				parser,
				Either.mapLeft((inputError) => new ParseResult.Type(ast, input, inputError.message))
			),
		encode: (input, _options, ast) =>
			pipe(
				input,
				formatter,
				Either.mapLeft((inputError) => new ParseResult.Type(ast, input, inputError.message))
			)
	});
};

export {
	/**
	 * A Schema that transforms a string into a CVDateTime according to the CVDateTimeFormat `format`.
	 * Read documentation of CVDateTimeFormat.toParser and CVDateTimeFormat.toFormatter for more
	 * details
	 *
	 * @category Schema transformations
	 */
	DateTimeFromString as DateTime
};
