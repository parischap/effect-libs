/**
 * This module implements a PlaceHolder type. PlaceHolder's are the constituents of Template's (see
 * Template.ts).
 *
 * Each PlaceHolder defines a parser and a formatter:
 *
 * - The parser takes a string, consumes what it can from that string that is coherent with the
 *   PlaceHolder, optionnally converts the read part to a value of type N and, if successful,
 *   returns a right of that value and of what remains to be read. In case of an error, it returns a
 *   left.
 * - The formatter takes a value of type N, converts it to a string (if N is not string), checks that
 *   the result is coherent with the PlaceHolder and, if so, returns a right of that string.
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
export const moduleTag = '@parischap/conversions/PlaceHolder/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a PlaceHolder Parser
 *
 * @category Models
 */
export namespace Parser {
	/**
	 * Type that describes a PlaceHolder Parser
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
 * Namespace of a PlaceHolder Formatter
 *
 * @category Models
 */
export namespace Formatter {
	/**
	 * Type that describes a PlaceHolder Formatter
	 *
	 * @category Models
	 */
	export interface Type<in T>
		extends MTypes.OneArgFunction<T, Either.Either<string, MInputError.Type>> {}
}

/**
 * Type that represents a PlaceHolder
 *
 * @category Models
 */
export interface Type<out N extends string, in out T> extends MInspectable.Type, Pipeable.Pipeable {
	/** Id of this Placeholder */
	readonly id: N;

	/** Descriptor of this Placeholder */
	readonly descriptor: string;

	/** Parser of this Placeholder */
	readonly parser: Parser.Type<T>;

	/** Formatter of this PlaceHolder */
	readonly formatter: Formatter.Type<T>;

	/** @internal */
	readonly [_TypeId]: { readonly _N: Types.Covariant<N>; readonly _T: Types.Invariant<T> };
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export interface All extends Type<string, any> {}

/**
 * Utility type that extracts the Name type of a PlaceHolder
 *
 * @category Utility types
 */
export type ExtractName<P extends All> = P extends Type<infer N, infer _> ? N : never;

/**
 * Utility type that extracts the Type type of a PlaceHolder
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
 * Returns the `id` property of `self`
 *
 * @category Destructors
 */
export const id: <const N extends string, T>(self: Type<N, T>) => N = Struct.get('id');

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

/**
 * Builds a PlaceHolder instance that reads/writes exactly `length` characters from a string.
 * `length` must be a strictly positive integer.
 *
 * @category Constructors
 */
export const fixedLength = <const N extends string>({
	id,
	length
}: {
	readonly id: N;
	readonly length: number;
}): Type<N, string> => {
	const name = `'${id}' placeholder`;
	return make({
		id,
		descriptor: `${name}: ${length}-character string`,
		parser: flow(
			MString.splitAt(length),
			Tuple.mapBoth({
				onFirst: MInputError.assertLength({ expected: length, name }),
				onSecond: Either.right
			}),
			Either.all
		),
		formatter: MInputError.assertLength({ expected: length, name })
	});
};

/**
 * Builds a PlaceHolder instance that reads/writes exactly `length` characters from a string and
 * trims/pads the result at `padPosition` with `fillChar`. `fillChar` should be a one-character
 * string. `length` must be a strictly positive integer. See the meaning of `disallowEmptyString` in
 * String.trim.
 *
 * @category Constructors
 */
export const paddedFixedLength = <const N extends string>(params: {
	readonly id: N;
	readonly length: number;
	readonly fillChar: string;
	readonly padPosition: MString.PadPosition;
	readonly disallowEmptyString: boolean;
}): Type<N, string> => {
	const id = params.id;
	const placeHolder = fixedLength(params);
	const trimmer = MString.trim(params);
	const padder = MString.pad(params);
	const name = `'${id}' placeholder`;
	return make({
		id,
		descriptor: `${placeHolder.descriptor} ${MString.PadPosition.toId(params.padPosition)}-padded with '${params.fillChar}'`,
		parser: flow(placeHolder.parser, Either.map(Tuple.mapFirst(trimmer))),
		formatter: flow(
			MInputError.assertMaxLength({ expected: params.length, name }),
			Either.map(padder)
		)
	});
};

/**
 * Builds a PlaceHolder instance that reads/writes a Real in the given `numberBase10Format`. If the
 * number to read/write does not occupy length characters, trimming/padding is applied. See the
 * paddedFixedLength instance builder.
 *
 * @category Constructors
 */
export const fixedLengthToReal = <const N extends string>(params: {
	readonly id: N;
	readonly length: number;
	readonly fillChar: string;
	readonly padPosition: MString.PadPosition;
	readonly disallowEmptyString: boolean;
	readonly numberBase10Format: CVNumberBase10Format.Type;
}): Type<N, CVReal.Type> => {
	const id = params.id;
	const placeHolder = paddedFixedLength(params);
	const numberBase10Format = params.numberBase10Format;
	const numberParser = CVNumberBase10Format.toRealParser(numberBase10Format);
	const numberFormatter = CVNumberBase10Format.toNumberFormatter(numberBase10Format);

	return make({
		id,
		descriptor: `${placeHolder.descriptor} to ${numberBase10Format.descriptor}`,
		parser: flow(
			placeHolder.parser,
			Either.flatMap(
				flow(
					Tuple.mapBoth({
						onFirst: (consumed) =>
							pipe(
								consumed,
								numberParser,
								Either.fromOption(
									() =>
										new MInputError.Type({
											message: `'${id}' placeholder contains '${consumed}' which cannot be converted to a ${numberBase10Format.descriptor}-formatted base-10 number`
										})
								)
							),
						onSecond: Either.right
					}),
					Either.all
				)
			)
		),
		formatter: flow(CVReal.toBigDecimal, numberFormatter, placeHolder.formatter)
	});
};

/**
 * Builds a PlaceHolder instance that reads/writes a Real provided in `numberBase10Format`.
 *
 * @category Constructors
 */
export const real = <const N extends string>({
	id,
	numberBase10Format
}: {
	readonly id: N;
	readonly numberBase10Format: CVNumberBase10Format.Type;
}): Type<N, CVReal.Type> => {
	const numberParser = CVNumberBase10Format.toRealExtractor(numberBase10Format);
	const numberFormatter = CVNumberBase10Format.toNumberFormatter(numberBase10Format);
	const flippedTakeRightBut = Function.flip(MString.takeRightBut);
	const name = `'${id}' placeholder`;
	return make({
		id,
		descriptor: `${name}: ${numberBase10Format.descriptor}`,
		parser: (text) =>
			pipe(
				text,
				numberParser,
				Either.fromOption(
					() =>
						new MInputError.Type({
							message: `${name} contains '${text}' from the start of which a ${numberBase10Format.descriptor} could not be extracted`
						})
				),
				Either.map(Tuple.mapSecond(flow(String.length, flippedTakeRightBut(text))))
			),
		formatter: flow(numberFormatter, Either.right)
	});
};

/**
 * Builds a PlaceHolder instance that reads/writes a given string.
 *
 * @category Constructors
 */
export const literal = <const N extends string>({
	id,
	value
}: {
	readonly id: N;
	readonly value: string;
}): Type<N, string> => {
	const name = `'${id}' placeholder`;
	return make({
		id,
		descriptor: `${name}: '${value}' string`,
		parser: flow(
			MInputError.assertStartsWith({ startString: value, name: `remaining text for ${name}` }),
			Either.map(flow(MString.takeRightBut(value.length), Tuple.make, MTuple.prependElement(value)))
		),
		formatter: MInputError.assertValue({ expected: value, name })
	});
};

/**
 * Builds a PlaceHolder instance that works as a map:
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
export const map = <const N extends string, T>({
	id,
	keyValuePairs
}: {
	readonly id: N;
	readonly keyValuePairs: ReadonlyArray<readonly [string, T]>;
}): Type<N, T> => {
	const name = `'${id}' placeholder`;
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
		id,
		descriptor: `${name}: from ${keys} to ${values}`,
		parser: (text) =>
			pipe(
				keyValuePairs,
				Array.findFirst(flow(Tuple.getFirst, isTheStartOf(text))),
				Either.fromOption(
					() =>
						new MInputError.Type({
							message: `Expected remaining text for ${name} to start with one of ${keys}. Actual: '${text}'`
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
							message: `${name}: expected one of ${values}. Actual: ${MString.fromUnknown(value)}`
						})
				)
			)
	});
};

/**
 * Builds a PlaceHolder instance that reads/writes the regular expression regExp. `regExp` must
 * start with the ^ character. Otherwise, the parser and formatter will not work properly.
 *
 * @category Constructors
 */
export const fulfilling = <const N extends string>({
	id,
	regExp,
	regExpDescriptor
}: {
	readonly id: N;
	readonly regExp: RegExp;
	readonly regExpDescriptor: string;
}): Type<N, string> => {
	const flippedTakeRightBut = Function.flip(MString.takeRightBut);
	const name = `'${id}' placeholder`;
	const match = MInputError.match({
		regExp,
		regExpDescriptor: 'to be ' + regExpDescriptor,
		name
	});

	return make({
		id,
		descriptor: `${name}: ${regExpDescriptor}`,
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
							message: `${name}: expected ${regExpDescriptor}. Actual: '${text}'`
						})
				)
			)
	});
};

/**
 * Builds a PlaceHolder instance that reads/writes at least one non-space character.
 *
 * @category Constructors
 */
export const noSpaceChars = <const N extends string>(id: N): Type<N, string> =>
	fulfilling({
		id,
		regExp: /^[^\s]+/,
		regExpDescriptor: 'a non-empty string containing non-space characters'
	});
