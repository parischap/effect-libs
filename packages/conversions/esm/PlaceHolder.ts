/**
 * This module implements a Placeholder type. Placeholder's are the constituents of Template's (see
 * Template.ts).
 *
 * Each Placeholder defines a parser and a formatter:
 *
 * - The parser takes a string, consumes what it can from that string that is coherent with the
 *   Placeholder, optionnally converts the parsed part to a value of type N and, if successful,
 *   returns a right of that value and of what remains to be parsed. In case of an error, it returns
 *   a left.
 * - The formatter takes a value of type N, converts it to a string (if N is not string), checks that
 *   the result is coherent with the Placeholder and, if so, returns a right of that string.
 *   Otherwise, it returns a left.
 */

import {
	MInputError,
	MInspectable,
	MPipeable,
	MString,
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
 * @category Module tag
 */
export const moduleTag = '@parischap/conversions/Placeholder/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a Placeholder Parser
 *
 * @category Models
 */
export namespace Parser {
	/**
	 * Type that describes a Placeholder Parser
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
 * Namespace of a Placeholder Formatter
 *
 * @category Models
 */
export namespace Formatter {
	/**
	 * Type that describes a Placeholder Formatter
	 *
	 * @category Models
	 */
	export interface Type<in T>
		extends MTypes.OneArgFunction<T, Either.Either<string, MInputError.Type>> {}
}

export type Type<N extends string, T> = Separator.Type | Tag.Type<N, T>;

/**
 * Type guard
 *
 * @category Guards
 */
export const isTag = <const N extends string, T>(u: Type<N, T>): u is Tag.Type<N, T> => Tag.has(u);

/**
 * Type guard
 *
 * @category Guards
 */
export const isSeparator = <const N extends string, T>(u: Type<N, T>): u is Separator.Type =>
	Separator.has(u);

/** Namespace for Separator Placeholder's. */
export namespace Separator {
	const _namespaceTag = moduleTag + 'Separator/';
	const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;

	/**
	 * Type that represents a Separator Placeholder
	 *
	 * @category Models
	 */
	export interface Type extends MInspectable.Type, Pipeable.Pipeable {
		/** The string representing this separator */
		readonly value: string;

		/** Parser of this Separator Placeholder */
		readonly parser: (pos: number) => (text: string) => Either.Either<string, MInputError.Type>;

		/** Formatter of this Separator Placeholder */
		readonly formatter: Function.LazyArg<string>;

		/** @internal */
		readonly [_TypeId]: _TypeId;
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

	/** Proto */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: _TypeId,
		[MInspectable.IdSymbol](this: Type) {
			return this.value;
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Builds a Separator instance that parses/formats a given string.
	 *
	 * @category Constructors
	 */
	export const make = (value: string): Type =>
		_make({
			value,
			parser: (pos) =>
				flow(
					MInputError.assertStartsWith({
						startString: value,
						name: `remaining text for separator at position ${pos}`
					}),
					Either.map(MString.takeRightBut(value.length))
				),
			formatter: Function.constant(value)
		});

	/**
	 * Slash Separator instance
	 *
	 * @category Instances
	 */
	export const slash: Type = make('/');

	/**
	 * Backslash Separator instance
	 *
	 * @category Instances
	 */
	export const backslash: Type = make('\\');

	/**
	 * Dot Separator instance
	 *
	 * @category Instances
	 */
	export const dot: Type = make('.');

	/**
	 * Hyphen Separator instance
	 *
	 * @category Instances
	 */
	export const hyphen: Type = make('-');

	/**
	 * Colon Separator instance
	 *
	 * @category Instances
	 */
	export const colon: Type = make(':');

	/**
	 * Comma Separator instance
	 *
	 * @category Instances
	 */
	export const comma: Type = make(',');

	/**
	 * Space Separator instance
	 *
	 * @category Instances
	 */
	export const space: Type = make(' ');
}

/** Namespace for Tag Placeholder's. */
export namespace Tag {
	const _namespaceTag = moduleTag + 'Tag/';
	const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;

	/**
	 * Type that represents a Tag Placeholder
	 *
	 * @category Models
	 */
	export interface Type<out N extends string, in out T>
		extends MInspectable.Type,
			Pipeable.Pipeable {
		/** Name of this Tag Placeholder */
		readonly name: N;

		/** Descriptor of this Tag Placeholder */
		readonly descriptor: string;

		/** Parser of this Tag Placeholder */
		readonly parser: Parser.Type<T>;

		/** Formatter of this Tag Placeholder */
		readonly formatter: Formatter.Type<T>;

		/** @internal */
		readonly [_TypeId]: { readonly _N: Types.Covariant<N>; readonly _T: Types.Invariant<T> };
	}

	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	export interface All extends Type<string, any> {}

	/**
	 * Utility type that extracts the Name type of a Tag Placeholder
	 *
	 * @category Utility types
	 */
	export type ExtractName<P extends All> = P extends Type<infer N, infer _> ? N : never;

	/**
	 * Utility type that extracts the Type type of a Tag Placeholder
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
			return this.descriptor;
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/**
	 * Constructor
	 *
	 * @category Constructors
	 */
	export const make = <const N extends string, T>(params: MTypes.Data<Type<N, T>>): Type<N, T> =>
		MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Returns the `name` property of `self`
	 *
	 * @category Destructors
	 */
	export const name: <const N extends string, T>(self: Type<N, T>) => N = Struct.get('name');

	/**
	 * Returns the `descriptor` property of `self`
	 *
	 * @category Destructors
	 */
	export const descriptor: <const N extends string, T>(self: Type<N, T>) => string =
		Struct.get('descriptor');

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

	const _labelFromName = (name: string): string => `'${name}' placeholder`;

	/**
	 * Returns the `formatter` property of `self`
	 *
	 * @category Destructors
	 */
	export const modify =
		<T, T1>({
			descriptorMapper,
			postParser,
			preFormatter
		}: {
			readonly descriptorMapper: (oldDescriptor: string, label: string) => string;
			readonly postParser: (value: T, label: string) => Either.Either<T1, MInputError.Type>;
			readonly preFormatter: (value: T1, label: string) => Either.Either<T, MInputError.Type>;
		}) =>
		<const N extends string>(self: Type<N, T>): Type<N, T1> => {
			const name = self.name;
			const label = _labelFromName(name);
			return make({
				name: self.name,
				descriptor: descriptorMapper(self.descriptor, label),
				parser: flow(
					self.parser,
					Either.flatMap(
						flow(
							Tuple.mapBoth({
								onFirst: (value) => postParser(value, label),
								onSecond: Either.right
							}),
							Either.all
						)
					)
				),
				formatter: (value) => pipe(preFormatter(value, label), Either.flatMap(self.formatter))
			});
		};

	/**
	 * Builds a Placeholder instance that parses/formats exactly `length` characters from a string.
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
		const label = _labelFromName(name);
		return make({
			name,
			descriptor: `${label}: ${length}-character string`,
			parser: flow(
				MString.splitAt(length),
				Tuple.mapBoth({
					onFirst: MInputError.assertLength({ expected: length, name: label }),
					onSecond: Either.right
				}),
				Either.all
			),
			formatter: MInputError.assertLength({ expected: length, name: label })
		});
	};

	/**
	 * Builds a Placeholder instance that parses/formats exactly `length` characters from a string and
	 * trims/pads the result at `padPosition` with `fillChar`. `fillChar` should be a one-character
	 * string. `length` must be a strictly positive integer. See the meaning of `disallowEmptyString`
	 * in String.trim.
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
	 * Builds a Placeholder instance that parses/formats a Real in the given `numberBase10Format`. If
	 * the number to parse/format does not occupy length characters, trimming/padding is applied. See
	 * the paddedFixedLength instance builder.
	 *
	 * @category Constructors
	 */
	export const fixedLengthToReal = <const N extends string>(params: {
		readonly name: N;
		readonly length: number;
		readonly fillChar: string;
		readonly padPosition: MString.PadPosition;
		readonly disallowEmptyString: boolean;
		readonly numberBase10Format: CVNumberBase10Format.Type;
	}): Type<N, CVReal.Type> => {
		const label = _labelFromName(params.name);
		const numberBase10Format = params.numberBase10Format;
		const numberParser = (input: string) =>
			pipe(
				input,
				CVNumberBase10Format.toRealParser(numberBase10Format),
				Either.fromOption(
					() =>
						new MInputError.Type({
							message: `${label}: value '${input}' cannot be converted to a ${numberBase10Format.descriptor}-formatted base-10 number`
						})
				)
			);
		const numberFormatter = flow(
			CVNumberBase10Format.toNumberFormatter(numberBase10Format),
			Either.right
		);

		return pipe(
			paddedFixedLength(params),
			modify({
				descriptorMapper: MString.append(` to ${numberBase10Format.descriptor}`),
				postParser: numberParser,
				preFormatter: numberFormatter
			})
		);
	};

	/**
	 * Builds a Placeholder instance that parses/formats a Real provided in `numberBase10Format`.
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
		const label = _labelFromName(name);
		return make({
			name,
			descriptor: `${label}: ${numberBase10Format.descriptor}`,
			parser: (text) =>
				pipe(
					text,
					numberParser,
					Either.fromOption(
						() =>
							new MInputError.Type({
								message: `${label} contains '${text}' from the start of which a ${numberBase10Format.descriptor} could not be extracted`
							})
					),
					Either.map(Tuple.mapSecond(flow(String.length, flippedTakeRightBut(text))))
				),
			formatter: flow(numberFormatter, Either.right)
		});
	};

	/**
	 * Builds a Placeholder instance that works as a map:
	 *
	 * The parser expects one of the keys of `keyValuePairs` and will return the associated value. The
	 * formatter expects one of the values of `keyValuePairs` and will return the associated key.
	 *
	 * `keyValuePairs` should define a bijection (each key and each value must be present only once).
	 * It is best if the type of the values defines a toString method. Value equality is checked with
	 * The Effect Equal.equals function.
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
		const label = _labelFromName(name);
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
			descriptor: `${label}: from ${keys} to ${values}`,
			parser: (text) =>
				pipe(
					keyValuePairs,
					Array.findFirst(flow(Tuple.getFirst, isTheStartOf(text))),
					Either.fromOption(
						() =>
							new MInputError.Type({
								message: `Expected remaining text for ${label} to start with one of ${keys}. Actual: '${text}'`
							})
					),
					Either.map(
						MTuple.makeBothBy({
							toFirst: Tuple.getSecond,
							toSecond: flow(Tuple.getFirst, String.length, flippedTakeRightBut(text))
						})
					)
				),
			formatter: (value) =>
				pipe(
					valueNameMap,
					HashMap.get(value),
					Either.fromOption(
						() =>
							new MInputError.Type({
								message: `${label}: expected one of ${values}. Actual: ${MString.fromUnknown(value)}`
							})
					)
				)
		});
	};

	/**
	 * Builds a Placeholder instance that parses/formats the regular expression regExp. `regExp` must
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
		const label = _labelFromName(name);
		const match = MInputError.match({
			regExp,
			regExpDescriptor: 'to be ' + regExpDescriptor,
			name: label
		});

		return make({
			name,
			descriptor: `${label}: ${regExpDescriptor}`,
			parser: (text) =>
				pipe(
					text,
					match,
					Either.map(
						MTuple.makeBothBy({
							toFirst: Function.identity,
							toSecond: flow(String.length, flippedTakeRightBut(text))
						})
					)
				),
			formatter: (text) =>
				pipe(
					text,
					match,
					Either.filterOrLeft(
						MString.hasLength(text.length),
						() =>
							new MInputError.Type({
								message: `${label}: expected ${regExpDescriptor}. Actual: '${text}'`
							})
					)
				)
		});
	};

	/**
	 * Builds a Placeholder instance that parses/formats at least one non-space character.
	 *
	 * @category Constructors
	 */
	export const noSpaceChars = <const N extends string>(name: N): Type<N, string> =>
		fulfilling({
			name,
			regExp: /^[^\s]+/,
			regExpDescriptor: 'a non-empty string containing non-space characters'
		});
}
