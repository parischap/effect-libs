/**
 * This module implements a PlaceHolder type. PlaceHolder's are the constituents of Template's (see
 * Template.ts).
 *
 * Each PlaceHolder defines a reader and a writer:
 *
 * - The reader takes a string, consumes what it can from that string that is coherent with the
 *   PlaceHolder, optionnally converts the read part to a value of type N and, if successful,
 *   returns a right of that value and of what remains to be read. In case of an error, it returns a
 *   left.
 * - The writer takes a value of type N, converts it to a string (if N is not string), checks that the
 *   result is coherent with the PlaceHolder and, if so, returns a right of that string. Otherwise,
 *   it returns a left.
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
	Either,
	flow,
	Function,
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
 * Namespace of a PlaceHolder Reader
 *
 * @category Models
 */
export namespace Reader {
	/**
	 * Type that describes a PlaceHolder Reader
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
 * Namespace of a PlaceHolder Writer
 *
 * @category Models
 */
export namespace Writer {
	/**
	 * Type that describes a PlaceHolder Writer
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

	/** Reader of this Placeholder */
	readonly reader: Reader.Type<T>;

	/** Writer of this PlaceHolder */
	readonly writer: Writer.Type<T>;

	/** @internal */
	readonly [_TypeId]: { readonly _N: Types.Covariant<N>; readonly _T: Types.Invariant<T> };
}

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
export const make = <N extends string, T>(params: MTypes.Data<Type<N, T>>): Type<N, T> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Returns the `id` property of `self`
 *
 * @category Destructors
 */
export const id: <N extends string, T>(self: Type<N, T>) => N = Struct.get('id');

/**
 * Returns the `descriptor` property of `self`
 *
 * @category Destructors
 */
export const descriptor: <N extends string, T>(self: Type<N, T>) => string =
	Struct.get('descriptor');

/**
 * Returns the `reader` property of `self`
 *
 * @category Destructors
 */
export const reader: <N extends string, T>(self: Type<N, T>) => Reader.Type<T> =
	Struct.get('reader');

/**
 * Returns the `writer` property of `self`
 *
 * @category Destructors
 */
export const writer: <N extends string, T>(self: Type<N, T>) => Writer.Type<T> =
	Struct.get('writer');

/**
 * Builds a PlaceHolder instance that reads/writes exactly `length` characters from a string.
 * `length` must be a strictly positive integer.
 *
 * @category Instance builders
 */
export const fixedLength = <N extends string>({
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
		reader: flow(
			MString.splitAt(length),
			Tuple.mapBoth({
				onFirst: MInputError.assertLength({ expected: length, name }),
				onSecond: Either.right
			}),
			Either.all
		),
		writer: MInputError.assertLength({ expected: length, name })
	});
};

/**
 * Builds a PlaceHolder instance that reads/writes exactly `length` characters from a string and
 * trims/pads the result at `padPosition` with `fillChar`. `fillChar` should be a one-character
 * string. `length` must be a strictly positive integer. See the meaning of `disallowEmptyString` in
 * String.trim.
 *
 * @category Instance builders
 */
export const paddedFixedLength = <N extends string>(params: {
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
		reader: flow(placeHolder.reader, Either.map(Tuple.mapFirst(trimmer))),
		writer: flow(MInputError.assertMaxLength({ expected: params.length, name }), Either.map(padder))
	});
};

/**
 * Builds a PlaceHolder instance that reads/writes a Real in the given `numberBase10Format`. If the
 * number to read/write does not occupy length characters, trimming/padding is applied. See the
 * paddedFixedLength instance builder.
 *
 * @category Instance builders
 */
export const fixedLengthToReal = <N extends string>(params: {
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
	const numberReader = CVNumberBase10Format.toRealReader(numberBase10Format);
	const numberWriter = CVNumberBase10Format.toNumberWriter(numberBase10Format);

	return make({
		id,
		descriptor: `${placeHolder.descriptor} to ${numberBase10Format.descriptor}`,
		reader: flow(
			placeHolder.reader,
			Either.flatMap(
				flow(
					Tuple.mapBoth({
						onFirst: (consumed) =>
							pipe(
								consumed,
								numberReader,
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
		writer: flow(CVReal.toBigDecimal, numberWriter, placeHolder.writer)
	});
};

/**
 * Builds a PlaceHolder instance that reads/writes a Real provided in `numberBase10Format`.
 *
 * @category Instance builders
 */
export const real = <N extends string>({
	id,
	numberBase10Format
}: {
	readonly id: N;
	readonly numberBase10Format: CVNumberBase10Format.Type;
}): Type<N, CVReal.Type> => {
	const numberReader = CVNumberBase10Format.toRealExtractor(numberBase10Format);
	const numberWriter = CVNumberBase10Format.toNumberWriter(numberBase10Format);
	const flippedTakeRightBut = Function.flip(MString.takeRightBut);
	const name = `'${id}' placeholder`;
	return make({
		id,
		descriptor: `${name}: ${numberBase10Format.descriptor}`,
		reader: (text) =>
			pipe(
				text,
				numberReader,
				Either.fromOption(
					() =>
						new MInputError.Type({
							message: `${name} contains '${text}' from the start of which a ${numberBase10Format.descriptor} could not be extracted`
						})
				),
				Either.map(Tuple.mapSecond(flow(String.length, flippedTakeRightBut(text))))
			),
		writer: flow(numberWriter, Either.right)
	});
};

/**
 * Builds a PlaceHolder instance that reads/writes a given string.
 *
 * @category Instance builders
 */
export const literal = <N extends string>({
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
		reader: flow(
			MInputError.assertStartsWith({ startString: value, name: `remaining text for ${name}` }),
			Either.map(flow(MString.takeRightBut(value.length), Tuple.make, MTuple.prependElement(value)))
		),
		writer: MInputError.assertValue({ expected: value, name })
	});
};

/**
 * Builds a PlaceHolder instance that reads/writes the regular expression regExp. `regExp` must
 * start with the ^ character. Otherwise, the reader and writer will not work properly.
 *
 * @category Instance builders
 */
export const fulfilling = <N extends string>({
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
		reader: (text) =>
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
		writer: (text) =>
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
 * @category Instance builders
 */
export const atLeastOneNonSpaceChar = <N extends string>(id: N): Type<N, string> =>
	fulfilling({
		id,
		regExp: /^[^\s]+/,
		regExpDescriptor: 'a non-empty string containing non-space characters'
	});
