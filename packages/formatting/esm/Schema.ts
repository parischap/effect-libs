import { Array, BigDecimal, Either, flow, Option, ParseResult, pipe, Schema, Struct } from 'effect';
import * as CVBrand from './Brand.js';
import * as CVNumberBase10Format from './NumberBase10Format.js';

/**
 * A Schema that transforms a string into a CVBrand.Email.Type
 *
 * @category Schema transformations
 */
export const EmailFromString: Schema.Schema<CVBrand.Email.Type, string> = Schema.String.pipe(
	Schema.fromBrand(CVBrand.Email.constructor)
);

/**
 * A Schema that represents a CVBrand.Email.Type
 *
 * @category Schema instances
 */
export const EmailFromSelf: Schema.Schema<CVBrand.Email.Type> = Schema.typeSchema(EmailFromString);

/**
 * A Schema that transforms a string into an CVBrand.SemVer.Type
 *
 * @category Schema transformations
 */
export const SemVerFromString: Schema.Schema<CVBrand.SemVer.Type, string> = Schema.String.pipe(
	Schema.fromBrand(CVBrand.SemVer.constructor)
);

/**
 * A Schema that represents a CVBrand.SemVer.Type
 *
 * @category Schema instances
 */
export const SemVerFromSelf: Schema.Schema<CVBrand.SemVer.Type> =
	Schema.typeSchema(SemVerFromString);

/**
 * A Schema that transforms a number into an CVBrand.Real.Type
 *
 * @category Schema transformations
 */
export const RealFromNumber: Schema.Schema<CVBrand.Real.Type, number> = Schema.Number.pipe(
	Schema.fromBrand(CVBrand.Real.constructor)
);

/**
 * A Schema that represents a CVBrand.Real.Type
 *
 * @category Schema instances
 */
export const RealFromSelf: Schema.Schema<CVBrand.Real.Type> = Schema.typeSchema(RealFromNumber);

/**
 * A Schema that transforms a number into a CVBrand.RealInt.Type
 *
 * @category Schema transformations
 */
export const RealIntFromNumber: Schema.Schema<CVBrand.RealInt.Type, number> = Schema.Number.pipe(
	Schema.fromBrand(CVBrand.RealInt.constructor)
);

/**
 * A Schema that represents a CVBrand.RealInt.Type
 *
 * @category Schema instances
 */
export const RealIntFromSelf: Schema.Schema<CVBrand.RealInt.Type> =
	Schema.typeSchema(RealIntFromNumber);

/**
 * A Schema that transforms a number into a CVBrand.PositiveRealInt.Type
 *
 * @category Schema transformations
 */
export const RealPositiveIntFromNumber: Schema.Schema<CVBrand.PositiveRealInt.Type, number> =
	Schema.Number.pipe(Schema.fromBrand(CVBrand.PositiveRealInt.constructor));

/**
 * A Schema that represents a CVBrand.PositiveRealInt.Type
 *
 * @category Schema instances
 */
export const RealPositiveIntFromSelf: Schema.Schema<CVBrand.PositiveRealInt.Type> =
	Schema.typeSchema(RealPositiveIntFromNumber);

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
 * A Schema that transforms a Brand.Real into a BigDecimal. When encoding, this Schema will fail if
 * the BigDecimal exceeds the 64-bit range of a number.
 *
 * @category Schema transformations
 */
export const BigDecimalFromReal: Schema.Schema<BigDecimal.BigDecimal, CVBrand.Real.Type> =
	Schema.transformOrFail(RealFromSelf, Schema.BigDecimalFromSelf, {
		strict: true,
		decode: flow(BigDecimal.unsafeFromNumber, ParseResult.succeed),
		encode: (input, _options, ast) =>
			pipe(
				input,
				CVBrand.Real.fromBigDecimal,
				Either.mapLeft(
					flow(
						Array.map(Struct.get('message')),
						Array.join('. '),
						(message) => new ParseResult.Type(ast, input, message)
					)
				)
			)
	});
