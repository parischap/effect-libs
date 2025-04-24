/**
 * This module implements a PlaceHolder type. PlaceHolder's are the constituents of Template's (see
 * Template.ts). A PlaceHolder defines what it can contain. For instance:
 *
 * - A fixedLength PlaceHolder contains a fixed number of characters.
 * - A literals PlaceHolder can contain only a predefined set of strings.
 * - A noSpace PlaceHolder can contain any string that does not contain a space...
 *
 * Each PlaceHolder defines a reader and a writer:
 *
 * - The reader takes a text, consumes what it can from that text that is coherent with what it can
 *   contain and, if successful, returns a right of the consumed part and of what is left over. In
 *   case of an error, it returns a left.
 * - The writer takes a value, checks that this value is coherent with what it can contain and, if so,
 *   returns a right of that value. Otherwise, it returns a left.
 */
import {
	MFunction,
	MInspectable,
	MPipeable,
	MRegExp,
	MString,
	MStruct,
	MTuple,
	MTypes
} from '@parischap/effect-lib';

import {
	Array,
	Either,
	flow,
	Option,
	pipe,
	Pipeable,
	Predicate,
	Struct,
	Tuple,
	Types
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
	 * Type that describes a PlaceHolder Reader
	 *
	 * @category Models
	 */
	export interface Type
		extends MTypes.OneArgFunction<
			string,
			Either.Either<readonly [consumed: string, leftOver: string], string>
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
	export interface Type extends MTypes.OneArgFunction<string, Either.Either<string, string>> {}
}

/**
 * Type that represents a PlaceHolder
 *
 * @category Models
 */
export interface Type<out N extends string> extends MInspectable.Type, Pipeable.Pipeable {
	/** Name of this Placeholder */
	readonly name: N;

	/** Reader of this Placeholder */
	readonly reader: Reader.Type;

	/** Writer of this PlaceHolder */
	readonly writer: Writer.Type;

	/** @internal */
	readonly [_TypeId]: { readonly _N: Types.Covariant<N> };
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type<string> => Predicate.hasProperty(u, _TypeId);

/** Proto */
const proto: MTypes.Proto<Type<never>> = {
	[_TypeId]: { _N: MTypes.covariantValue },
	[MInspectable.IdSymbol]<N extends string>(this: Type<N>) {
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
export const make = <N extends string>(params: MTypes.Data<Type<N>>): Type<N> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Returns the `name` property of `self`
 *
 * @category Destructors
 */
export const name: <N extends string>(self: Type<N>) => N = Struct.get('name');

/**
 * Returns the `reader` property of `self`
 *
 * @category Destructors
 */
export const reader: MTypes.OneArgFunction<Type<string>, Reader.Type> = Struct.get('reader');

/**
 * Returns the `writer` property of `self`
 *
 * @category Destructors
 */
export const writer: MTypes.OneArgFunction<Type<string>, Writer.Type> = Struct.get('writer');

/**
 * PlaceHolder instance that reads/writes exactly `n` characters from a string. `length` must be a
 * strictly positive integer.
 *
 * @category Instances
 */
export const fixedLength = <N extends string>({
	name,
	length
}: {
	readonly name: N;
	readonly length: number;
}): Type<N> => {
	const lengthPredicate = MString.hasLength(length);
	return make({
		name,
		reader: flow(
			MString.splitAt(length),
			Either.liftPredicate(
				flow(Tuple.getFirst, lengthPredicate),
				(s) =>
					`Reading placeholder '${name}': expected ${length} characters. Actual: ${s[0].length}`
			)
		),
		writer: flow(
			Either.liftPredicate(
				lengthPredicate,
				(s) => `Writing placeholder '${name}': expected ${length} characters. Actual: ${s.length}`
			)
		)
	});
};

/**
 * PlaceHolder instance that reads/writes a given list of strings.
 *
 * @category Instances
 */
export const literals = <N extends string>({
	name,
	strings
}: {
	readonly name: N;
	readonly strings: MTypes.OverOne<string>;
}): Type<N> => {
	const allStrings =
		strings.length === 1 ?
			`'${strings[0]}'`
		:	'one of ' +
			pipe(strings, Array.map(flow(MString.prepend("'"), MString.append("'"))), Array.join(', '));
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
					() => `Reading placeholder '${name}': expected ${allStrings} at the start of '${toRead}'`
				)
			),
		writer: (toWrite) =>
			pipe(
				Array.findFirst(strings, MFunction.strictEquals(toWrite)),
				Either.fromOption(
					() => `Writing placeholder '${name}': expected ${allStrings}. Received: '${toWrite}'`
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
export const fulfilling = <N extends string>({
	name,
	predicate
}: {
	readonly name: N;
	readonly predicate: Predicate.Predicate<string>;
}): Type<N> => {
	const negativePredicate = Predicate.not(predicate);

	return make({
		name,
		reader: flow(
			Array.splitWhere(negativePredicate),
			Tuple.mapBoth({ onFirst: Array.join(''), onSecond: Array.join('') }),
			Either.right
		),
		writer: Either.liftPredicate(
			flow(Array.fromIterable, Array.every(predicate)),
			() => `Writing placeholder '${name}': received disallowed character`
		)
	});
};

/**
 * PlaceHolder instance that reads/writes as long as `predicate` is not fulfilled. `predicate` must
 * be a predicate of a one-char string
 *
 * @category Instances
 */
export const notFulfilling: <N extends string>(params: {
	readonly name: N;
	readonly predicate: Predicate.Predicate<string>;
}) => Type<N> = flow(MStruct.evolve({ predicate: Predicate.not }), fulfilling);

/**
 * PlaceHolder instance that reads/writes anything that does not contain a space
 *
 * @category Instances
 */
export const noSpace: <N extends string>(params: { readonly name: N }) => Type<N> = flow(
	MStruct.append({ predicate: MString.fulfillsRegExp(MRegExp.space) }),
	notFulfilling
);

/**
 * PlaceHolder instance that reads/writes anything that is an uninterrupted list of digits
 *
 * @category Instances
 */
export const digits: <N extends string>(params: { readonly name: N }) => Type<N> = flow(
	MStruct.append({ predicate: MString.fulfillsRegExp(MRegExp.digit) }),
	fulfilling
);

/**
 * PlaceHolder instance that reads/writes anything that is different from `separator`. `separator`
 * must be a one-character string
 *
 * @category Instances
 */
export const allBut: <N extends string>(params: {
	readonly name: N;
	readonly separator: string;
}) => Type<N> = flow(
	MStruct.enrichWith({
		predicate: flow(Struct.get('separator'), MFunction.strictEquals)
	}),
	notFulfilling
);

/**
 * PlaceHolder instance that reads/writes the whole contents of what it receives. This PlaceHolder
 * should be used in final position only.
 *
 * @category Instances
 */
export const final = <N extends string>({ name }: { readonly name: N }): Type<N> =>
	make({
		name,
		reader: flow(Tuple.make, Tuple.appendElement(''), Either.right),
		writer: Either.right
	});
