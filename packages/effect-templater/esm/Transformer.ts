/**
 * A Transformer<A> is used to transform a string into a value of type A and vice versa. It is used
 * within a Token (see Token.ts).
 *
 * @since 0.0.1
 */

import {
	MCache,
	MInspectable,
	MNumber,
	MPipeable,
	MString,
	MTypes,
	Real
} from '@parischap/effect-lib';
import { MRegExp } from '@parischap/js-lib';
import {
	Array,
	Brand,
	Either,
	Equal,
	Equivalence,
	flow,
	Hash,
	Inspectable,
	Option,
	pipe,
	Pipeable,
	Predicate,
	String,
	Tuple,
	Types
} from 'effect';
import * as Error from './Error.js';
import * as FloatingPointOptions from './FloatingPointOptions.js';

const moduleTag = '@parischap/effect-templater/Transformer/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a Transformer.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type<in out A> extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this ByPasser instance. Useful when debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;
	/**
	 * Reads as much as it can from the start of the `input` string so that the read string can be
	 * converted into an A. If nothing can be read, returns a `None`. Otherwise carries out the
	 * conversion, and returns a `Some` of the converted value and the rest of string
	 *
	 * @since 0.0.1
	 */
	readonly read: (input: string) => Either.Either<readonly [value: A, rest: string], Error.Type>;
	/**
	 * Converts a value of type A into a string.
	 *
	 * @since 0.0.1
	 */
	readonly write: (value: A) => Either.Either<string, Error.Type>;
	/** @internal */
	readonly [TypeId]: {
		readonly _A: Types.Invariant<A>;
	};
}

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */
export const has = (u: unknown): u is Type<unknown> => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const equivalence: Equivalence.Equivalence<Type<any>> = (self, that) =>
	that.name === self.name;

/** Prototype */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<any>> = {
	[TypeId]: {
		_A: MTypes.invariantValue
	},
	[Equal.symbol]<A>(this: Type<A>, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol]<A>(this: Type<A>) {
		return Hash.cached(this, Hash.hash(this.name));
	},
	...MInspectable.BaseProto(moduleTag),
	toJSON<A>(this: Type<A>) {
		return this.name === '' ? this : this.name;
	},
	...MPipeable.BaseProto
};

/**
 * Constructor
 *
 * @since 0.0.1
 * @category Constructors
 */
export const make = <A>(params: MTypes.Data<Type<A>>): Type<A> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Transformer instance that reads/writes a string
 *
 * @since 0.0.1
 * @category Instances
 */
export const string: Type<string> = make({
	name: 'string',
	read: flow(Tuple.make, Tuple.appendElement(''), Either.right),
	write: Either.right
});

/**
 * Cache instance that stores regular expressions to read real numbers in floating point format from
 * the start of a string
 */
const floatingPointRegExpCache = MCache.make({
	lookUp: ({ key }: { readonly key: FloatingPointOptions.Type }) =>
		Tuple.make(
			new RegExp(
				MRegExp.atStart(
					MRegExp.floatingPoint(
						key.signOption,
						key.fractionalSep,
						key.thousandSep,
						key.maxDecimalDigits,
						key.minFractionalDigits,
						key.maxFractionalDigits
					)
				)
			),
			true
		)
});

/**
 * Transformer instance that reads/writes a real number in floating point format.
 *
 * @since 0.0.1
 * @category Instances
 */
export const floatingPoint = (options: FloatingPointOptions.Type): Type<Real.Type> => {
	const digitAndSepLength = options.thousandSep.length + 3;

	const signPartOptions = pipe(
		options,
		FloatingPointOptions.withNoDecimalPart,
		FloatingPointOptions.withNoFractionalPart,
		FloatingPointOptions.withNoENotation
	);

	const decPartOptions = pipe(
		options,
		FloatingPointOptions.withNoSign,
		FloatingPointOptions.withNoFractionalPart,
		FloatingPointOptions.withNoENotation
	);

	const fracPartOptions = pipe(
		options,
		FloatingPointOptions.withNoSign,
		FloatingPointOptions.withNoDecimalPart
	);

	const signPartRegExp = pipe(floatingPointRegExpCache, MCache.get(signPartOptions));
	const decPartRegExp = pipe(floatingPointRegExpCache, MCache.get(decPartOptions));
	const fracPartRegExp = pipe(floatingPointRegExpCache, MCache.get(fracPartOptions));

	return make({
		name: `floatingPoint-${FloatingPointOptions.name(options)}`,

		read: (input) => {
			const signPart = pipe(
				input,
				MString.match(signPartRegExp),
				Option.getOrElse(() => '')
			);

			const withoutSign = pipe(input, MString.takeRightBut(signPart.length));
			const decPart = pipe(
				withoutSign,
				MString.match(decPartRegExp),
				Option.getOrElse(() => '')
			);

			const withoutSignAndDecPart = pipe(withoutSign, MString.takeRightBut(decPart.length));
			const fracPart = pipe(
				withoutSignAndDecPart,
				MString.match(fracPartRegExp),
				Option.getOrElse(() => '')
			);

			const rest = pipe(withoutSignAndDecPart, MString.takeRightBut(fracPart.length));

			const decPartWithoutSep = pipe(
				decPart,
				MString.splitEquallyRestAtStart(digitAndSepLength),
				Array.map(String.takeRight(3)),
				Array.join('')
			);

			return pipe(
				signPart + decPartWithoutSep + fracPart,
				Either.liftPredicate(String.isNonEmpty, () =>
					Brand.error(`Could not read real number from ${input}`)
				),
				Either.map(flow(MNumber.unsafeFromString, Tuple.make, Tuple.appendElement(rest)))
			);
		},
		write: (input) =>
			pipe(
				input,
				MString.fromPrimitive,
				MString.splitEquallyRestAtStart(3),
				Array.join(thousandSeparator)
			) as never
	});
};
