import { ArrayFormatter, ParseResult, Schema } from '@effect/schema';
import * as MBrand from './Brand.js';

import { Array, Either, Function, Record, pipe } from 'effect';

//const moduleTag = '@parischap/effect-lib/Schema/';

// Error pretty printing
export const prettyPrintError = (e: ParseResult.ParseError, eol: string, tabChar: string): string =>
	pipe(
		ArrayFormatter.formatErrorSync(e),
		Array.map(
			(issue) =>
				tabChar +
				issue.message +
				' at path "' +
				pipe(
					issue.path,
					Array.map((p) => p.toString()),
					Array.join('/')
				) +
				'"'
		),
		Array.join(eol)
	);

// New data types
export const SemVer = Schema.String.pipe(Schema.fromBrand(MBrand.SemVer));

export const Email = Schema.String.pipe(Schema.fromBrand(MBrand.Email));

// Number transformations
/**
 * Yields a schema that takes a number and returns that number offset by `offset`
 */
export const offset = (offset: number): Schema.Schema<number> =>
	Schema.transform(Schema.Number, Schema.Number, {
		decode: (n) => n + offset,
		encode: (n) => n - offset
	});

// Schema transformations
/**
 * Transforms a `Schema.Schema<A,I,R>` into a `Schema.Schema<I,A,R>`
 */
/*export const inverse = <A, I, R>(s: Schema.Schema<A, I, R>): Schema.Schema<I, A, R> =>
	Schema.transformOrFail(Schema.typeSchema(s), Schema.encodedSchema(s), {
		decode: (to) =>
			pipe(
				to,
				Schema.encode(s),
				Effect.catchTag('ParseError', (e) => Effect.fail(e.error))
			),

		encode: (from) =>
			pipe(
				from,
				Schema.decode(s),
				Effect.catchTag('ParseError', (e) => Effect.fail(e.error))
			)
	});*/

/**
 * Transforms a Schema<A,I,R> in a Schema<number, I, R> using the provided array as. The number is the index of the A element in as
 */
export const index =
	<A>(as: ReadonlyArray<A>) =>
	<I>(s: Schema.Schema<A, I>): Schema.Schema<number, I> =>
		Schema.transformOrFail(s, Schema.Number, {
			decode: (a, _, ast) =>
				pipe(
					as,
					Array.findFirstIndex((an) => an === a),
					Either.fromOption(() => new ParseResult.Type(ast, a, 'Not an allowed value'))
				),

			encode: (n, _, ast) =>
				pipe(
					as,
					Array.get(n),
					Either.fromOption(() => new ParseResult.Type(ast, n, 'Not an allowed value'))
				)
		});

/**
 * Transforms a schema representing a ReadonlyArray<[K,V]> into a schema representing a Record<K,V>. No error will be raised if there are several entries with the same key. The last occurence of each key will take precedence.
 */
export const entriesToRecord = <A, R1, R2>(
	key: Schema.Schema<string, string, R1>,
	value: Schema.Schema<A, A, R2>
): Schema.Schema<
	{
		readonly [x: string]: A;
	},
	ReadonlyArray<readonly [string, A]>,
	R1 | R2
> =>
	Schema.transform(Schema.Array(Schema.Tuple(key, value)), Schema.Record(key, value), {
		decode: Record.fromEntries,
		encode: Array.fromRecord<string, A>
	});

/**
 * Transforms a schema representing a ReadonlyArray<[K,V]> into a schema representing a Record<K,V>. An error will be raised if there are conflicting entries (same key, different value). The error message will start by message followed by colon ':' then the first duplicate key found and its position.
 */
/*export const entriesToRecordOrFailWith = <A, R1, R2>(
	key: Schema.Schema<string, string, R1>,
	value: Schema.Schema<A, A, R2>,
	message: string
): Schema.Schema<
	{
		readonly [x: string]: A;
	},
	ReadonlyArray<readonly [string, A]>,
	R1 | R2
> =>
	Schema.transformOrFail(
		Schema.array(Schema.tuple(key, value)),
		Schema.record(key, value),
		(arr, _, ast) =>
			pipe(
				arr,
				MreadonlyRecord.fromIterableWith(Function.identity),
				Either.mapLeft(
					([key, pos]) => new ParseResult.Type(ast, arr, `${message}: ${String(key)} at position ${pos + 1}`)
				)
			),
		(record) => pipe(record, Array.fromRecord<string, A>, ParseResult.succeed)
	);*/

/**
 * Transforms a schema of an array in a schema of an array in which duplicates have been removed
 */
export const arrayDedupeWith = <A, R>(
	elem: Schema.Schema<A, A, R>,
	isEquivalent: (self: A, that: A) => boolean
): Schema.Schema<ReadonlyArray<A>, ReadonlyArray<A>, R> =>
	Schema.transform(Schema.Array(elem), Schema.Array(elem), {
		decode: Array.dedupeWith(isEquivalent),
		encode: Function.identity
	});

/**
 * Puts the input schema into a struct under property 'a'. Use Schema.rename to change the name of the property
 */
export const structify = <A, I, R>(
	schema: Schema.Schema<A, I, R>
): Schema.Schema<
	{
		readonly a: A;
	},
	I,
	R
> =>
	pipe(
		schema,
		Schema.transform(Schema.Struct({ a: Schema.typeSchema(schema) }), {
			decode: (v) => ({ a: v }),
			encode: (v) => v.a
		})
	);

/**
 *  URL constructor
 */

/*const urlArbitrary = (): Arbitrary.Arbitrary<URL> => (fc) => fc.webUrl().map((s) => new URL(s));
const urlPretty = (): Pretty.Pretty<URL> => (url: URL) => `new URL(${url.toJSON()})`;
const urlEquivalence: Equivalence.Equivalence<URL> = Equivalence.mapInput(Equivalence.string, (url) =>
	url.toJSON()
);*/

// See Schema.DateFromSelf for a model
/*export const UrlFromSelf: Schema.Schema<URL> = Schema.declare(
	[],
	Schema.struct({}),
	() => (u, _, ast) =>
		MFunction.isUrl(u) ? ParseResult.success(u) : ParseResult.failure(ParseResult.type(ast, u)),
	{
		[AST.IdentifierAnnotationId]: 'Url',
		[Pretty.PrettyHookId]: urlPretty,
		[Arbitrary.ArbitraryHookId]: urlArbitrary,
		[SEquivalence.EquivalenceHookId]: () => urlEquivalence
	}
);*/

// Filters
// String filters
// MAKE IT A BRANDED TYPE
/**
 * String filter that ensures the given string represents a date
 *
 * @param f - The format of the expected date (see luxon)
 *
 */
/*export const date = (f: string) =>
	Schema.filter<string>((s) => DateTime.fromFormat(s, f).isValid, {
		message: () => `Not a string that represents a '${f}' formatted date`
	});*/

/**
 * String filter that restricts possible values to a set of strings
 *
 * @param a - An array of A's
 * @param f - A function that takes an A and the input strings and that returns true if A is an allowed value for s
 *
 */
export const inArray = (a: ReadonlyArray<string>) =>
	Schema.filter((s) => Array.contains(a, s), {
		message: () => 'Not one of the allowed values'
	});

// Array filters
/**
 * Array filter that validates only arrays with no duplicate lines
 *
 * @param isEquivalent - Function that returns true when two A's are considered equal and false otherwise
 *
 */
/*export const noDups = <C>(isEquivalent: (self: C, that: C) => boolean) =>
	Schema.filter<ReadonlyArray<C>>(
		(a) => pipe(a, Array.dedupeWith(isEquivalent), (a1) => a1.length === a.length),
		{
			message: () => 'No duplicates allowed'
		}
	);*/

// Transformers
/**
 * Transforms a schema<'YYYY-MM-DD',T> to a  schema<'YYYYMMDD',T>
 *
 * @param fromIso - the schema<'YYYY-MM-DD',T> schema.
 *
 */
/*export const schemaFromIsoToSchemaFromYyyymmdd = <T>(fromIso: Schema.Schema<string, T>) =>
	Schema.transform(Schema.string, fromIso, JsString.yyyymmdToIso, JsString.isoToYyyymmdd);*/

/**
 * Schema that takes a string 'YYYYMMDD' and returns a date.
 *
 */
//export const DateFromYyyymmdd = pipe(Schema.DateFromString, schemaFromIsoToSchemaFromYyyymmdd);

/**
 * Transforms a schema<T,CSVString> to a schema<T,ReadonlyArray<string>.
 * @param sep - the CSV separator.
 */
/*export const schemaToCsvToSchemaToStringArray =
	(sep: string) =>
	<T>(toCSV: Schema.Schema<T, string>) =>
		Schema.transform(toCSV, Schema.array(Schema.string), String.split(sep), Array.join(sep));*/

/**
 * Transforms a string representing a URL to a URL object
 */
/*export const stringToUrl = Schema.transformOrFail(
	Schema.string,
	UrlFromSelf,
	(s) => {
		try {
			return ParseResult.success(new URL(s));
		} catch (_) {
			return ParseResult.failure(ParseResult.type(Schema.string.ast, s, 'URL expected'));
		}
	},
	(url) => ParseResult.success(url.toJSON())
);*/
