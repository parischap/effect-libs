/**
 * This module implements a TemplatePlaceholder type which is a sub-type of the TemplatePart type
 * (see TemplatePart.ts)
 *
 * A TemplatePlaceholder represents the mutable part of a template. Each Placeholder defines a
 * parser and a formatter:
 *
 * - The parser takes a string, consumes a part of that string, optionnally converts the consumed part
 *   to a value of type T and, if successful, returns a right of that value and of what has not been
 *   consumed. In case of an error, it returns a left.
 * - The formatter takes a value of type T, converts it to a string (if T is not string), checks that
 *   the result is coherent and, if so, returns a right of that string. Otherwise, it returns a
 *   left.
 */

import {
	MInputError,
	MInspectable,
	MPipeable,
	MRegExp,
	MRegExpString,
	MString,
	MStruct,
	MTuple,
	MTypes
} from '@parischap/effect-lib';

import {
	Array,
	Either,
	flow,
	Function,
	HashMap,
	pipe,
	Pipeable,
	Predicate,
	String,
	Struct,
	Tuple,
	Types
} from 'effect';

import * as CVNumberBase10Format from './NumberBase10Format.js';
import * as CVReal from './Real.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/TemplatePlaceholder/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a Parser
 *
 * @category Models
 */
export namespace Parser {
	/**
	 * Type that describes a Parser
	 *
	 * @category Models
	 */
	export interface Type<out T>
		extends MTypes.OneArgFunction<
			string,
			Either.Either<readonly [consumed: T, leftOver: string], MInputError.Type>
		> {}
}

/**
 * Namespace of a Formatter
 *
 * @category Models
 */
export namespace Formatter {
	/**
	 * Type that describes a Formatter
	 *
	 * @category Models
	 */
	export interface Type<in T>
		extends MTypes.OneArgFunction<T, Either.Either<string, MInputError.Type>> {}
}

/**
 * Type that represents a TemplatePlaceholder
 *
 * @category Models
 */
export interface Type<out N extends string, in out T> extends MInspectable.Type, Pipeable.Pipeable {
	/** Name of this TemplatePlaceholder */
	readonly name: N;

	/** Label of this TemplatePlaceholder(usually the name prefixed with '#') */
	readonly label: string;

	/** Descriptor of this TemplatePlaceholder (used for debugging purposes) */
	readonly description: string;

	/** Parser of this TemplatePlaceholder */
	readonly parser: Parser.Type<T>;

	/** Formatter of this TemplatePlaceholder */
	readonly formatter: Formatter.Type<T>;

	/** @internal */
	readonly [_TypeId]: { readonly _N: Types.Covariant<N>; readonly _T: Types.Invariant<T> };
}

/**
 * Type that represents a TemplatePart from and to any type
 *
 * @category Models
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export interface All extends Type<string, any> {}

/**
 * Utility type that extracts the Name type of a TemplatePlaceholder
 *
 * @category Utility types
 */
export type ExtractName<P extends All> = P extends Type<infer N, infer _> ? N : never;

/**
 * Utility type that extracts the Type type of a TemplatePlaceholder
 *
 * @category Utility types
 */
export type ExtractType<P extends All> = P extends Type<string, infer T> ? T : never;

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type<string, unknown> => Predicate.hasProperty(u, _TypeId);

/** Proto */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<never, any>> = {
	[_TypeId]: { _N: MTypes.covariantValue, _T: MTypes.invariantValue },
	[MInspectable.IdSymbol]<N extends string, T>(this: Type<N, T>) {
		return getLabelledDescription(this);
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

const _make = <const N extends string, T>(params: MTypes.Data<Type<N, T>>): Type<N, T> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor
 *
 * @category Constructors
 */
export const make: <const N extends string, T>(
	params: Omit<MTypes.Data<Type<N, T>>, 'label'>
) => Type<N, T> = flow(
	MStruct.enrichWith({ label: ({ name }) => MString.prepend('#')(name) }),
	_make
);

/**
 * Returns the `name` property of `self`
 *
 * @category Destructors
 */
export const name: <const N extends string, T>(self: Type<N, T>) => N = Struct.get('name');

/**
 * Returns the `label` property of `self`
 *
 * @category Destructors
 */
export const label: <const N extends string, T>(self: Type<N, T>) => string = Struct.get('label');

/**
 * Returns the `description` property of `self`
 *
 * @category Destructors
 */
export const description: <const N extends string, T>(self: Type<N, T>) => string =
	Struct.get('description');

/**
 * Returns the `parser` property of `self`
 *
 * @category Destructors
 */
export const parser: <const N extends string, T>(self: Type<N, T>) => Parser.Type<T> =
	Struct.get('parser');

/**
 * Returns the `formatter` property of `self`
 *
 * @category Destructors
 */
export const formatter: <const N extends string, T>(self: Type<N, T>) => Formatter.Type<T> =
	Struct.get('formatter');

/**
 * Returns the description of `self`
 *
 * @category Destructors
 */
export const getLabelledDescription = <N extends string, T>(self: Type<N, T>) =>
	`${self.label}: ${self.description}`;

/**
 * Returns a modified copy of `self` where a postParser function is executed after the parser of
 * `self` and a preFormatter function is executed before the formatter of `self`
 *
 * @category Destructors
 */
export const modify =
	<T, T1>({
		descriptorMapper,
		postParser,
		preFormatter
	}: {
		readonly descriptorMapper: MTypes.OneArgFunction<string>;
		readonly postParser: MTypes.OneArgFunction<T, Either.Either<T1, MInputError.Type>>;
		readonly preFormatter: MTypes.OneArgFunction<T1, Either.Either<T, MInputError.Type>>;
	}) =>
	<const N extends string>(self: Type<N, T>): Type<N, T1> =>
		make({
			name: self.name,
			description: descriptorMapper(self.description),
			parser: function (this: Type<N, T1>, text) {
				return Either.flatMap(
					self.parser.call(this, text),
					flow(
						Tuple.mapBoth({
							onFirst: (t) => postParser.call(this, t),
							onSecond: Either.right
						}),
						Either.all
					)
				);
			},
			formatter: function (this: Type<N, T1>, t1) {
				return pipe(
					preFormatter.call(this, t1),
					Either.flatMap((t) => self.formatter.call(this, t))
				);
			}
		});

/**
 * Builds a TemplatePart instance that parses/formats exactly `length` characters from a string.
 * `length` must be a strictly positive integer.
 *
 * @category Constructors
 */
export const fixedLength = <const N extends string>({
	name,
	length
}: {
	readonly name: N;
	readonly length: number;
}): Type<N, string> => {
	return make({
		name,
		description: `${length}-character string`,
		parser: function (this: Type<N, string>, text) {
			return pipe(
				text,
				MString.splitAt(length),
				Tuple.mapBoth({
					onFirst: MInputError.assertLength({ expected: length, name: this.label }),
					onSecond: Either.right
				}),
				Either.all
			);
		},
		formatter: function (this: Type<N, string>, value) {
			return MInputError.assertLength({ expected: length, name: this.label })(value);
		}
	});
};

/**
 * Builds a TemplatePart instance that parses/formats exactly `length` characters from a string and
 * trims/pads the result at `padPosition` with `fillChar`. `fillChar` should be a one-character
 * string. `length` must be a strictly positive integer. See the meaning of `disallowEmptyString` in
 * String.trim.
 *
 * @category Constructors
 */
export const paddedFixedLength = <const N extends string>(params: {
	readonly name: N;
	readonly length: number;
	readonly fillChar: string;
	readonly padPosition: MString.PadPosition;
	readonly disallowEmptyString: boolean;
}): Type<N, string> => {
	const trimmer = flow(MString.trim(params), Either.right);
	const padder = flow(MString.pad(params), Either.right);

	return pipe(
		fixedLength(params),
		modify({
			descriptorMapper: MString.append(
				` ${MString.PadPosition.toId(params.padPosition)}-padded with '${params.fillChar}'`
			),
			postParser: trimmer,
			preFormatter: padder
		})
	);
};

/**
 * Builds a TemplatePart instance that parses/formats a Real in the given `numberBase10Format`. If
 * the number to parse/format is less than `length` characters, `fillChar` is trimmed/padded between
 * the sign and the number so that the length condition is respected. fillChar must be a
 * one-character string (but no error is triggered if you do not respect that condition)
 *
 * @category Constructors
 */

export const fixedLengthToReal = <const N extends string>(params: {
	readonly name: N;
	readonly length: number;
	readonly fillChar: string;
	readonly numberBase10Format: CVNumberBase10Format.Type;
}): Type<N, CVReal.Type> => {
	const { numberBase10Format, fillChar } = params;
	const numberParser = function (this: Type<N, CVReal.Type>, input: string) {
		return pipe(
			input,
			CVNumberBase10Format.toRealParser(numberBase10Format, fillChar),
			Either.fromOption(
				() =>
					new MInputError.Type({
						message: `${this.label}: value '${input}' cannot be converted to a(n) ${CVNumberBase10Format.toDescription(numberBase10Format)}`
					})
			)
		);
	};

	const numberFormatter = flow(
		CVNumberBase10Format.toNumberFormatter(
			numberBase10Format,
			pipe(fillChar, String.repeat(params.length))
		),
		Either.right
	);

	return pipe(
		fixedLength(params),
		modify({
			descriptorMapper: MString.append(
				` left-padded with '${fillChar}' to ${CVNumberBase10Format.toDescription(numberBase10Format)}`
			),
			postParser: numberParser,
			preFormatter: numberFormatter
		})
	);
};

/**
 * Builds a TemplatePart instance that parses/formats a Real provided in `numberBase10Format`.
 *
 * @category Constructors
 */
export const real = <const N extends string>({
	name,
	numberBase10Format
}: {
	readonly name: N;
	readonly numberBase10Format: CVNumberBase10Format.Type;
}): Type<N, CVReal.Type> => {
	const numberParser = CVNumberBase10Format.toRealExtractor(numberBase10Format);
	const numberFormatter = CVNumberBase10Format.toNumberFormatter(numberBase10Format);
	const flippedTakeRightBut = Function.flip(MString.takeRightBut);

	return make({
		name,
		description: `${CVNumberBase10Format.toDescription(numberBase10Format)}`,
		parser: function (this: Type<N, CVReal.Type>, text) {
			return pipe(
				text,
				numberParser,
				Either.fromOption(
					() =>
						new MInputError.Type({
							message: `${this.label} contains '${text}' from the start of which a(n) ${CVNumberBase10Format.toDescription(numberBase10Format)} could not be extracted`
						})
				),
				Either.map(Tuple.mapSecond(flow(String.length, flippedTakeRightBut(text))))
			);
		},
		formatter: flow(numberFormatter, Either.right)
	});
};

/**
 * Builds a TemplatePart instance that works as a map:
 *
 * The parser expects one of the keys of `keyValuePairs` and will return the associated value. The
 * formatter expects one of the values of `keyValuePairs` and will return the associated key.
 *
 * `keyValuePairs` should define a bijection (each key and each value must be present only once). It
 * is best if the type of the values defines a toString method. Value equality is checked with The
 * Effect Equal.equals function.
 *
 * @category Constructors
 */
export const mappedLiterals = <const N extends string, T>({
	name,
	keyValuePairs
}: {
	readonly name: N;
	readonly keyValuePairs: ReadonlyArray<readonly [string, T]>;
}): Type<N, T> => {
	const keys = pipe(
		keyValuePairs,
		Array.map(Tuple.getFirst),
		Array.join(', '),
		MString.prepend('['),
		MString.append(']')
	);
	const values = pipe(
		keyValuePairs,
		Array.map(flow(Tuple.getSecond, MString.fromUnknown)),
		Array.join(', '),
		MString.prepend('['),
		MString.append(']')
	);
	const valueNameMap = pipe(keyValuePairs, Array.map(Tuple.swap), HashMap.fromIterable);

	const isTheStartOf = Function.flip(String.startsWith);
	const flippedTakeRightBut = Function.flip(MString.takeRightBut);

	return make({
		name,
		description: `from ${keys} to ${values}`,
		parser: function (this: Type<N, T>, text) {
			return pipe(
				keyValuePairs,
				Array.findFirst(flow(Tuple.getFirst, isTheStartOf(text))),
				Either.fromOption(
					() =>
						new MInputError.Type({
							message: `Expected remaining text for ${this.label} to start with one of ${keys}. Actual: '${text}'`
						})
				),
				Either.map(
					MTuple.makeBothBy({
						toFirst: Tuple.getSecond,
						toSecond: flow(Tuple.getFirst, String.length, flippedTakeRightBut(text))
					})
				)
			);
		},
		formatter: function (this: Type<N, T>, value) {
			return pipe(
				valueNameMap,
				HashMap.get(value),
				Either.fromOption(
					() =>
						new MInputError.Type({
							message: `${this.label}: expected one of ${values}. Actual: ${MString.fromUnknown(value)}`
						})
				)
			);
		}
	});
};

/**
 * Builds a TemplatePart instance that parses/formats the regular expression regExp. `regExp` must
 * start with the ^ character. Otherwise, the parser and formatter will not work properly.
 *
 * @category Constructors
 */
export const fulfilling = <const N extends string>({
	name,
	regExp,
	regExpDescriptor
}: {
	readonly name: N;
	readonly regExp: RegExp;
	readonly regExpDescriptor: string;
}): Type<N, string> => {
	const flippedTakeRightBut = Function.flip(MString.takeRightBut);

	const match = (label: string) =>
		MInputError.match({
			regExp,
			regExpDescriptor,
			name: label
		});

	return make({
		name,
		description: `${regExpDescriptor}`,
		parser: function (this: Type<N, string>, text) {
			return pipe(
				text,
				match(this.label),
				Either.map(
					MTuple.makeBothBy({
						toFirst: Function.identity,
						toSecond: flow(String.length, flippedTakeRightBut(text))
					})
				)
			);
		},
		formatter: function (this: Type<N, string>, text) {
			return pipe(
				text,
				match(this.label),
				Either.filterOrLeft(
					MString.hasLength(text.length),
					() =>
						new MInputError.Type({
							message: `${this.label}: expected ${regExpDescriptor}. Actual: '${text}'`
						})
				)
			);
		}
	});
};

/**
 * Builds a TemplatePart instance that parses/formats a non-empty string made up of characters other
 * than those contained in `forbiddenChars`. `forbiddenChars` should be an array of 1-character
 * strings (will not throw otherwise but strange behaviors can be expected)
 *
 * @category Constructors
 */
export const anythingBut = <const N extends string>({
	name,
	forbiddenChars
}: {
	readonly name: N;
	readonly forbiddenChars: MTypes.OverOne<string>;
}): Type<N, string> => {
	const forbiddenCharsAsString = pipe(
		forbiddenChars,
		Array.join("', '"),
		MString.prepend("[ '"),
		MString.append("' ]")
	);
	return fulfilling({
		name,
		regExp: pipe(
			forbiddenChars,
			MRegExpString.notInRange,
			MRegExpString.oneOrMore,
			MRegExpString.atStart,
			MRegExp.fromRegExpString()
		),
		regExpDescriptor: `a non-empty string containing non of the following characters: ${forbiddenCharsAsString}`
	});
};

/**
 * Builds a TemplatePart instance that parses/formats all the remaining text.
 *
 * @category Constructors
 */
export const toEnd = <const N extends string>(name: N): Type<N, string> =>
	fulfilling({
		name,
		regExp: /^.*/,
		regExpDescriptor: 'a string'
	});
