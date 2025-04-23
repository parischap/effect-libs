import {
	MFunction,
	MInspectable,
	MPipeable,
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
	Number,
	Option,
	pipe,
	Pipeable,
	Predicate,
	String,
	Struct,
	Tuple
} from 'effect';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/formatting/PlaceHolder/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a PlaceHolder Reader
 *
 * @category Models
 */
export namespace Reader {
	/**
	 * Type that describes a PlaceHolder Reader. A Reader takes a string and returns, if successful, a
	 * `right` of a tuple containing `readPart` (the part that it managed to read) and `leftOver` (the
	 * remaining part of the string). In case of failure, it returns a `left` of an error message.
	 *
	 * @category Models
	 */
	export interface Type
		extends MTypes.OneArgFunction<
			string,
			Either.Either<readonly [readPart: string, leftOver: string], string>
		> {}
}

/**
 * Namespace of a PlaceHolder Writer
 *
 * @category Models
 */
export namespace Writer {
	/**
	 * Type that describes a PlaceHolder Writer. A Writer takes a string and, if successful, return a
	 * right of the written string. In case of failure, it returns a `left` of an error message.
	 *
	 * @category Models
	 */
	export interface Type extends MTypes.OneArgFunction<string, Either.Either<string, string>> {}
}

/**
 * Type that represents a PlaceHolder
 *
 * @category Models
 */
export interface Type extends MInspectable.Type, Pipeable.Pipeable {
	/** Name of this Placeholder. Useful for error reporting */
	readonly name: string;

	/** Reader of this Placeholder */
	readonly reader: Reader.Type;

	/** Writer of this PlaceHolder */
	readonly writer: Writer.Type;

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
		return `Placeholder ${this.name}`;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Returns the `name` property of `self`
 *
 * @category Destructors
 */
export const name: MTypes.OneArgFunction<Type, string> = Struct.get('name');

/**
 * Returns the `reader` property of `self`
 *
 * @category Destructors
 */
export const reader: MTypes.OneArgFunction<Type, Reader.Type> = Struct.get('reader');

/**
 * Returns the `writer` property of `self`
 *
 * @category Destructors
 */
export const writer: MTypes.OneArgFunction<Type, Writer.Type> = Struct.get('writer');

const _fixedLength = ({
	name,
	length,
	fillString = '',
	padLeft = true
}: {
	readonly name: string;
	readonly length: number;
	readonly fillString?: string;
	readonly padLeft?: boolean;
}): Type => {
	const hasFillString = String.isNonEmpty(fillString);

	const lengthPredicate = flow(
		String.length,
		hasFillString ? Number.lessThanOrEqualTo(length) : MFunction.strictEquals(length)
	);

	const padder =
		hasFillString ?
			padLeft ? String.padStart(length, fillString)
			:	String.padEnd(length, fillString)
		:	Function.identity<string>;

	const trimmer =
		hasFillString ?
			Tuple.mapFirst(
				flow(
					padLeft ? MString.trimStart(fillString) : MString.trimEnd(fillString),
					// If trimming has emptied the string, we have trimmed too much
					Option.liftPredicate(String.isNonEmpty),
					Option.getOrElse(Function.constant(fillString))
				)
			)
		:	Function.identity<readonly [string, string]>;

	return make({
		name,
		reader: flow(
			Either.liftPredicate(
				flow(String.length, Number.greaterThanOrEqualTo(length)),
				(s) =>
					`Reading placeholder ${name}: expected ${length} characters, but only ${s.length} were left`
			),
			Either.map(flow(MString.splitAt(length), trimmer))
		),
		writer: flow(
			Either.liftPredicate(
				lengthPredicate,
				(s) =>
					`Writing placeholder ${name}: expected ${length} characters. But ${s.length} characters were received`
			),
			Either.map(padder)
		)
	});
};

/**
 * PlaceHolder instance that reads/writes exactly `n` characters from a string. `length` must be a
 * strictly positive integer.
 *
 * @category Instances
 */
export const fixedLength: MTypes.OneArgFunction<
	{
		readonly name: string;
		readonly length: number;
	},
	Type
> = _fixedLength;

/**
 * PlaceHolder instance that reads/writes exactly `n` characters from a string but removes/adds a
 * padding character on the left. `length` must be a strictly positive integer. `fillString` must be
 * a one-character string. Note that the behaviour of the reader and of the writer is not completely
 * symmetrical. When writing an empty string and reading the result, the output will not be an empty
 * string but the `fillString` char.
 *
 * @category Instances
 */
export const leftPadded: MTypes.OneArgFunction<
	{
		readonly name: string;
		readonly length: number;
		readonly fillString: string;
	},
	Type
> = _fixedLength;

/**
 * PlaceHolder instance that reads/writes exactly `n` characters from a string but removes/adds a
 * padding character on the right. `length` must be a strictly positive integer. `fillString` must
 * be a one-character string. Note that the behaviour of the reader and of the writer is not
 * completely symmetrical. When writing an empty string and reading the result, the output will not
 * be an empty string but the `fillString` char.
 *
 * @category Instances
 */
export const rightPadded: MTypes.OneArgFunction<
	{
		readonly name: string;
		readonly length: number;
		readonly fillString: string;
	},
	Type
> = flow(MStruct.append({ padLeft: false }), _fixedLength);

/**
 * PlaceHolder instance that reads/writes a given list of strings.
 *
 * @category Instances
 */
export const literals = ({
	name,
	strings
}: {
	readonly name: string;
	readonly strings: ReadonlyArray<string>;
}): Type => {
	const allStrings = Array.join(strings, ', ');
	return make({
		name,
		reader: (toRead) =>
			pipe(
				Array.findFirst(strings, (s) =>
					pipe(
						toRead,
						MString.stripLeftOption(s),
						Option.map(flow(Tuple.make, MTuple.prependElement(s)))
					)
				),
				Either.fromOption(
					() =>
						`Reading placeholder ${name}: expected one of ${allStrings} at the start of ${toRead}`
				)
			),
		writer: (toWrite) =>
			pipe(
				Array.findFirst(strings, MFunction.strictEquals(toWrite)),
				Either.fromOption(
					() => `Writing placeholder ${name}: expected one of ${allStrings}. Received: ${toWrite}`
				)
			)
	});
};

/**
 * PlaceHolder instance that reads/writes as long as `predicate` is fulfilled. `predicate` must be a
 * predicate of a one-char string
 *
 * @category Instances
 */
export const takeWhile = ({
	name,
	predicate
}: {
	readonly name: string;
	readonly predicate: Predicate.Predicate<string>;
}): Type => {
	const negativePredicate = Predicate.not(predicate);

	return make({
		name,
		reader: flow(
			Array.splitWhere(negativePredicate),
			Tuple.mapBoth({ onFirst: Array.join(''), onSecond: Array.join('') }),
			Either.right
		),
		writer: flow(
			Either.liftPredicate(
				flow(Array.fromIterable, Array.every(predicate)),
				() => `Writing placeholder ${name}: received disallowed character`
			)
		)
	});
};

/**
 * PlaceHolder instance that reads/writes as long as `predicate` is not fulfilled. `predicate` must
 * be a predicate of a one-char string
 *
 * @category Instances
 */
export const takeWhileNot: MTypes.OneArgFunction<
	{
		readonly name: string;
		readonly predicate: Predicate.Predicate<string>;
	},
	Type
> = flow(MStruct.evolve({ predicate: Predicate.not }), takeWhile);

/**
 * PlaceHolder instance that reads/writes the whole contents of what it receives. This PlaceHolder
 * should be used in final position only.
 *
 * @category Instances
 */
export const final = ({ name }: { readonly name: string }): Type =>
	make({
		name,
		reader: flow(Tuple.make, Tuple.appendElement(''), Either.right),
		writer: Either.right
	});
