/**
 * An extension to the Effect Schema module that adds Schema instances for data conversion like
 * number and date formatting and parsing
 */

import { MMatch, MTuple, MTypes } from '@parischap/effect-lib';
import {
	Array,
	BigDecimal,
	DateTime,
	Either,
	flow,
	Option,
	ParseResult,
	pipe,
	Record,
	Schema
} from 'effect';
import * as CVDateTime from './DateTime.js';
import * as CVDateTimeFormat from './DateTimeFormat.js';
import * as CVEmail from './Email.js';
import * as CVInteger from './Integer.js';
import * as CVNumberBase10Format from './NumberBase10Format.js';
import * as CVPositiveInteger from './PositiveInteger.js';
import * as CVPositiveReal from './PositiveReal.js';
import * as CVReal from './Real.js';
import * as CVSemVer from './SemVer.js';
import * as CVTemplate from './Template.js';
import * as CVTemplatePart from './TemplatePart.js';
import * as CVTemplateParts from './TemplateParts.js';
import * as CVTemplatePlaceholder from './TemplatePlaceholder.js';

/**
 * A Schema that transforms a string into a CVBrand.Email.Type
 *
 * @category Schema transformations
 */
export const Email: Schema.Schema<CVEmail.Type, string> = CVEmail.SchemaFromString;

/**
 * A Schema that represents a CVBrand.Email.Type
 *
 * @category Schema instances
 */
export const EmailFromSelf: Schema.Schema<CVEmail.Type> = CVEmail.SchemaFromSelf;

/**
 * A Schema that transforms a string into an CVBrand.SemVer.Type
 *
 * @category Schema transformations
 */
export const SemVer: Schema.Schema<CVSemVer.Type, string> = CVSemVer.SchemaFromString;

/**
 * A Schema that represents a CVBrand.SemVer.Type
 *
 * @category Schema instances
 */
export const SemVerFromSelf: Schema.Schema<CVSemVer.Type> = CVSemVer.SchemaFromSelf;

/**
 * A Schema that transforms a number into an CVReal.Type
 *
 * @category Schema transformations
 */
export const RealFromNumber: Schema.Schema<CVReal.Type, number> = CVReal.SchemaFromNumber;

/**
 * A Schema that represents a CVReal.Type
 *
 * @category Schema instances
 */
export const RealFromSelf: Schema.Schema<CVReal.Type> = CVReal.SchemaFromSelf;

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
					() =>
						new ParseResult.Type(
							ast,
							input,
							'Failed to convert string to a(n) ' + CVNumberBase10Format.toDescription(format)
						)
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
export const IntegerFromNumber: Schema.Schema<CVInteger.Type, number> = CVInteger.SchemaFromNumber;

/**
 * A Schema that represents a CVInteger.Type
 *
 * @category Schema instances
 */
export const IntegerFromSelf: Schema.Schema<CVInteger.Type> = CVInteger.SchemaFromSelf;

/**
 * A Schema that transforms a number into a CVPositiveInteger.Type
 *
 * @category Schema transformations
 */
export const PositiveIntegerFromNumber: Schema.Schema<CVPositiveInteger.Type, number> =
	CVPositiveInteger.SchemaFromNumber;

/**
 * A Schema that represents a CVPositiveInteger.Type
 *
 * @category Schema instances
 */
export const PositiveIntegerFromSelf: Schema.Schema<CVPositiveInteger.Type> =
	CVPositiveInteger.SchemaFromSelf;

/**
 * A Schema that transforms a number into a CVPositiveReal.Type
 *
 * @category Schema transformations
 */
export const PositiveRealFromNumber: Schema.Schema<CVPositiveReal.Type, number> =
	CVPositiveReal.SchemaFromNumber;

/**
 * A Schema that represents a CVPositiveReal.Type
 *
 * @category Schema instances
 */
export const PositiveRealFromSelf: Schema.Schema<CVPositiveReal.Type> =
	CVPositiveReal.SchemaFromSelf;

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
						new ParseResult.Type(
							ast,
							input,
							'Failed to convert string to a(n) ' + CVNumberBase10Format.toDescription(format)
						)
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
 * A Schema that transforms a CVDateTime into a Date. The CVDateTime object is created with the
 * default timeZoneOffset of the machine this code is running on
 *
 * @category Schema instances
 */
export const DateFromDateTime: Schema.Schema<Date, CVDateTime.Type> = Schema.transform(
	DateTimeFromSelf,
	Schema.DateFromSelf,
	{
		strict: true,
		decode: CVDateTime.toDate,
		encode: CVDateTime.fromDate
	}
);

/**
 * A Schema that transforms a CVDateTime into an Effect DateTime.Zoned. Both objects share the same
 * time zone offset.
 *
 * @category Schema instances
 */
export const DateTimeZonedFromDateTime: Schema.Schema<DateTime.Zoned, CVDateTime.Type> =
	Schema.transform(DateTimeFromSelf, Schema.DateTimeZonedFromSelf, {
		strict: true,
		decode: CVDateTime.toEffectDateTime,
		encode: CVDateTime.fromEffectDateTime
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

/**
 * A Schema that transforms a string into a Date according to the CVDateTimeFormat `format`. Read
 * documentation of CVDateTimeFormat.toParser and CVDateTimeFormat.toFormatter for more details
 *
 * @category Schema transformations
 */
export const Date = (format: CVDateTimeFormat.Type): Schema.Schema<Date, string> =>
	Schema.compose(DateTimeFromString(format), DateFromDateTime);

/**
 * A Schema that transforms a string into a Date according to the CVDateTimeFormat `format`. Read
 * documentation of CVDateTimeFormat.toParser and CVDateTimeFormat.toFormatter for more details
 *
 * @category Schema transformations
 */
export const DateTimeZoned = (
	format: CVDateTimeFormat.Type
): Schema.Schema<DateTime.Zoned, string> =>
	Schema.compose(DateTimeFromString(format), DateTimeZonedFromDateTime);

/**
 * A Schema that transforms a string into an object according to a CVTemplate (see Template.ts)
 *
 * @category Schema transformations
 */
export const Template = <const PS extends CVTemplateParts.Type>(
	template: CVTemplate.Type<PS>
): Schema.Schema<
	{
		readonly [k in keyof MTypes.ArrayKeys<PS> as PS[k] extends CVTemplatePlaceholder.All ?
			CVTemplatePlaceholder.ExtractName<PS[k]>
		:	never]: PS[k] extends CVTemplatePlaceholder.All ? CVTemplatePlaceholder.ExtractType<PS[k]>
		:	never;
	},
	string
> => {
	const parser = CVTemplate.toParser(template);
	const formatter = CVTemplate.toFormatter(template);

	const schemaOutput = pipe(
		template.templateParts,
		Array.filterMap(
			flow(
				MMatch.make,
				MMatch.when(CVTemplatePart.isSeparator, () => Option.none()),
				MMatch.when(
					CVTemplatePart.isPlaceholder,
					flow(
						MTuple.makeBothBy({
							toFirst: CVTemplatePlaceholder.name,
							toSecond: CVTemplatePlaceholder.schemaInstance
						}),
						Option.some
					)
				),
				MMatch.exhaustive
			)
		),
		Record.fromEntries,
		Schema.Struct
	);

	return Schema.transformOrFail(Schema.String, schemaOutput, {
		strict: true,
		decode: (input, _options, ast) =>
			pipe(
				input,
				parser,
				Either.mapLeft((inputError) => new ParseResult.Type(ast, input, inputError.message))
			) as never,
		encode: (input, _options, ast) =>
			pipe(
				input as never,
				formatter,
				Either.mapLeft((inputError) => new ParseResult.Type(ast, input, inputError.message))
			)
	}) as never;
};
