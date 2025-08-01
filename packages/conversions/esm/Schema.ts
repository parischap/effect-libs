import { MString } from '@parischap/effect-lib';
import { Array, BigDecimal, Either, flow, Option, ParseResult, pipe, Schema, Struct } from 'effect';
import * as CVEmail from './Email.js';
import * as CVNumberBase10Format from './NumberBase10Format.js';
import * as CVPositiveReal from './PositiveReal.js';
import * as CVPositiveRealInt from './PositiveRealInt.js';
import * as CVReal from './Real.js';
import * as CVRealInt from './RealInt.js';
import * as CVSemVer from './SemVer.js';

/**
 * A Schema that transforms a string into a CVBrand.Email.Type
 *
 * @category Schema transformations
 */
export const EmailFromString: Schema.Schema<CVEmail.Type, string> = Schema.String.pipe(
	Schema.fromBrand(CVEmail.constructor)
);

/**
 * A Schema that represents a CVBrand.Email.Type
 *
 * @category Schema instances
 */
export const EmailFromSelf: Schema.Schema<CVEmail.Type> = Schema.typeSchema(EmailFromString);

/**
 * A Schema that transforms a string into an CVBrand.SemVer.Type
 *
 * @category Schema transformations
 */
export const SemVerFromString: Schema.Schema<CVSemVer.Type, string> = Schema.String.pipe(
	Schema.fromBrand(CVSemVer.constructor)
);

/**
 * A Schema that represents a CVBrand.SemVer.Type
 *
 * @category Schema instances
 */
export const SemVerFromSelf: Schema.Schema<CVSemVer.Type> = Schema.typeSchema(SemVerFromString);

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
 * A Schema that transforms a number into a CVRealInt.Type
 *
 * @category Schema transformations
 */
export const RealIntFromNumber: Schema.Schema<CVRealInt.Type, number> = Schema.Number.pipe(
	Schema.fromBrand(CVRealInt.constructor)
);

/**
 * A Schema that represents a CVRealInt.Type
 *
 * @category Schema instances
 */
export const RealIntFromSelf: Schema.Schema<CVRealInt.Type> = Schema.typeSchema(RealIntFromNumber);

/**
 * A Schema that transforms a number into a CVPositiveRealInt.Type
 *
 * @category Schema transformations
 */
export const PositiveRealIntFromNumber: Schema.Schema<CVPositiveRealInt.Type, number> =
	Schema.Number.pipe(Schema.fromBrand(CVPositiveRealInt.constructor));

/**
 * A Schema that represents a CVPositiveRealInt.Type
 *
 * @category Schema instances
 */
export const PositiveRealIntFromSelf: Schema.Schema<CVPositiveRealInt.Type> =
	Schema.typeSchema(PositiveRealIntFromNumber);

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

/**
 * A Schema that transforms a string into a BigDecimal using `format`.
 *
 * @category Schema transformations
 */
const BigDecimalFromString = (
	format: CVNumberBase10Format.Type
): Schema.Schema<BigDecimal.BigDecimal, string> => {
	const reader = CVNumberBase10Format.toNumberReader(format);
	const writer = CVNumberBase10Format.toNumberWriter(format);
	return Schema.transformOrFail(Schema.String, Schema.BigDecimalFromSelf, {
		strict: true,
		decode: (input, _options, ast) =>
			pipe(
				input,
				reader,
				Option.map(ParseResult.succeed),
				Option.getOrElse(() =>
					ParseResult.fail(
						new ParseResult.Type(ast, input, 'Failed to convert string to BigDecimal')
					)
				)
			),
		encode: flow(writer, ParseResult.succeed)
	});
};
export { BigDecimalFromString as BigDecimal };

/**
 * A Schema that transforms a string into a Real using `format`.
 *
 * @category Schema transformations
 */
// Do not use Schema.compose with BigDecimalFromString and BigDecimalFromReal here because BigDecimal has no negative 0. See CVNumberBase10Format.toNumberWriter
export const RealFromString = (
	format: CVNumberBase10Format.Type
): Schema.Schema<CVReal.Type, string> => {
	const reader = CVNumberBase10Format.toNumberReader(format);
	const writer = CVNumberBase10Format.toNumberWriter(format);
	return Schema.transformOrFail(Schema.String, RealFromSelf, {
		strict: true,
		decode: (input, _options, ast) =>
			pipe(
				input,
				reader,
				Either.fromOption(
					() => new ParseResult.Type(ast, input, 'Failed to convert string to Real')
				),
				Either.flatMap(
					flow(
						CVReal.fromBigDecimal,
						Either.mapLeft(
							flow(
								Array.map(Struct.get('message')),
								Array.join('. '),
								(message) => new ParseResult.Type(ast, input, message)
							)
						)
					)
				)
			),
		encode: flow(writer, ParseResult.succeed)
	});
};

/**
 * A Schema that transforms a padded string into an unpadded string. `length` must be a positive
 * integer indicating the fixed length of the padded string. When encoding, no error is reported if
 * the string to encode has strictly more than `paddedLength` characters. `fillChar` must be a
 * one-character string representing the character used for padding. `disallowEmptyString` is used
 * only when decoding. If true and if trimming the fillChar results in an empty string, the fillChar
 * is returned instead of an empty string. This is useful for instance if you have numbers padded
 * with 0's and you prefer the result of unpadding a string containing only 0's to be '0' rather
 * than an empty string.
 *
 * @category Schema transformations
 */
export const Unpad = ({
	length,
	fillChar,
	padPosition,
	disallowEmptyString
}: {
	readonly length: number;
	readonly fillChar: string;
	readonly padPosition: MString.PadPosition;
	readonly disallowEmptyString: boolean;
}): Schema.Schema<string, string> => {
	const trimmer = MString.trim({ length, fillChar, padPosition, disallowEmptyString });

	const padder = MString.pad({ length, fillChar, padPosition });

	return Schema.transformOrFail(Schema.String, Schema.String, {
		strict: true,
		decode: (input, _options, ast) =>
			pipe(
				input,
				trimmer,
				Either.fromOption(
					() =>
						new ParseResult.Type(
							ast,
							input,
							`Expected ${length} characters. Actual: ${input.length}`
						)
				)
			),
		encode: (input, _options, ast) =>
			pipe(
				input,
				padder,
				Either.fromOption(
					() =>
						new ParseResult.Type(
							ast,
							input,
							`Expected at most ${length} characters. Actual: ${input.length}`
						)
				)
			)
	});
};
