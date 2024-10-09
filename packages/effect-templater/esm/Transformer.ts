/**
 * A Transformer<A> is used to transform a string into a value of type A and vice versa. It is used
 * within a Token (see Token.ts).
 *
 * @since 0.0.1
 */

import {
	MBrand,
	MInspectable,
	MNumber,
	MPipeable,
	MRegExpString,
	MString,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Either,
	Equal,
	Equivalence,
	flow,
	Hash,
	Inspectable,
	MutableHashMap,
	Option,
	pipe,
	Pipeable,
	Predicate,
	String,
	Tuple,
	Types
} from 'effect';
import * as Error from './Error.js';

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
		return this.name;
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

/** Cache for Transformers */
const cache = MutableHashMap.empty<string, Type<unknown>>();

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
 * Cached transformer instance that reads/writes a real number in floating point format.
 *
 * @since 0.0.1
 * @category Instances
 */
export const realNumber = (
	options: Partial<MRegExpString.RealNumberOptions.Type>
): Type<MBrand.Real.Type> => {
	const withDefaults = MRegExpString.RealNumberOptions.withDefaults(options);
	const name = `realNumber-${MRegExpString.RealNumberOptions.name(withDefaults)}`;

	return pipe(
		cache,
		MutableHashMap.get(name),
		Option.getOrElse(() => {
			const digitGroupAndSepLength = withDefaults.thousandSep.length + 3;

			const signPartOptions = pipe(
				withDefaults,
				MRegExpString.RealNumberOptions.withNoDecimalPart,
				MRegExpString.RealNumberOptions.withNoFractionalPart,
				MRegExpString.RealNumberOptions.withNoENotation
			);

			const decPartOptions = pipe(
				withDefaults,
				MRegExpString.RealNumberOptions.withNoSign,
				MRegExpString.RealNumberOptions.withNoFractionalPart,
				MRegExpString.RealNumberOptions.withNoENotation
			);

			const fracPartOptions = pipe(
				withDefaults,
				MRegExpString.RealNumberOptions.withNoSign,
				MRegExpString.RealNumberOptions.withNoDecimalPart
			);

			const signPartRegExp = MRegExpString.realNumberAtStart(signPartOptions);
			const decPartRegExp = MRegExpString.realNumberAtStart(decPartOptions);
			const fracPartRegExp = MRegExpString.realNumberAtStart(fracPartOptions);

			return make({
				name,

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
						Option.liftPredicate(String.isNonEmpty),
						Option.map(
							flow(
								MString.splitEquallyRestAtStart(digitGroupAndSepLength),
								Array.map(String.takeRight(3)),
								Array.join('')
							)
						),
						Option.getOrElse(() => '')
					);

					const fracPartWithJavascriptFracSep = pipe(
						fracPart,
						Option.liftPredicate(String.isNonEmpty),
						Option.map(
							flow(MString.takeRightBut(withDefaults.fractionalSep.length), MString.prepend('.'))
						),
						Option.getOrElse(() => '')
					);

					return pipe(
						signPart + decPartWithoutSep + fracPartWithJavascriptFracSep,
						Either.liftPredicate(
							String.isNonEmpty,
							() => new Error.Type({ message: `Could not read real number from ${input}` })
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
		})
	) as Type<MBrand.Real.Type>;
};
