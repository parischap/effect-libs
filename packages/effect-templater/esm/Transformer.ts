/**
 * This module implements a Transformer<A> which is used to transform a string into a value of type
 * A and vice versa. It is used within a Token (see Token.ts).
 *
 * @since 0.0.1
 */

import {
	MArray,
	MBrand,
	MCache,
	MFunction,
	MInspectable,
	MMatch,
	MNumber,
	MPipeable,
	MRegExp,
	MRegExpString,
	MString,
	MTuple,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Either,
	Number as ENumber,
	Option as EOption,
	Equal,
	Equivalence,
	String as EString,
	flow,
	Function,
	Hash,
	HashMap,
	Inspectable,
	pipe,
	Pipeable,
	Predicate,
	Struct,
	Tuple,
	Types
} from 'effect';
import * as Error from './Error.js';

const moduleTag = '@parischap/effect-templater/Transformer/';
const _moduleTag = moduleTag;
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
	 * Name of this Transformer instance. Useful when debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;
	/**
	 * Reads as much as it can from the start of the input string so that the read string can be
	 * converted into an A. If nothing can be read, returns a `left`. Otherwise carries out the
	 * conversion, and returns a `right` of the converted value and the rest of string
	 *
	 * @since 0.0.1
	 */
	readonly read: MTypes.OneArgFunction<
		string,
		Either.Either<readonly [value: A, rest: string], Error.Type>
	>;
	/**
	 * Tries to convert a value of type A into a string. Returns a `right` of the string if the
	 * conversion was successful. Otherwise, returns a `left`
	 *
	 * @since 0.0.1
	 */
	readonly write: MTypes.OneArgFunction<A, Either.Either<string, Error.Type>>;

	/** @internal */
	readonly [TypeId]: {
		readonly _A: Types.Invariant<A>;
	};
}

interface _Type<in out A> extends Type<A> {}

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

const _make = make;

/**
 * Composes the `self` Transformer (Transformer<string>) with the `that` Transformer
 * (Transformer<A>) and returns a new Transformer (Transformer<A>). The read method of the new
 * Transformer calls `self.read` and then `that.read` on the value returned by `self.read`. An error
 * is returned if the rest returned by `self.read` is not an empty string. The write method of the
 * new Transformer calls `that.write` and `self.write` on the output of `that.write`.
 *
 * @since 0.0.1
 * @category Utils
 */
export const compose =
	<A>(that: Type<A>) =>
	(self: Type<string>): Type<A> =>
		make({
			name: `${self.name} ${that.name}`,
			read: flow(
				self.read,
				Either.flatMap(
					flow(
						Tuple.mapBoth({
							onFirst: flow(
								that.read,
								Either.filterOrLeft(
									Predicate.tuple(Function.constTrue, EString.isEmpty),
									([_, thatRest]) =>
										new Error.Type({ message: `Found unexpected characters '${thatRest}'` })
								),
								Either.map(Tuple.getFirst)
							),
							onSecond: Either.right
						}),
						Either.all
					)
				)
			),
			write: flow(that.write, Either.flatMap(self.write))
		});

/**
 * Transformer instance that transforms the keys of `map` into their corresponding values. And
 * vice-versa. `map` must be a bijection. When reading from string, it tries to find one of `map`
 * keys at the start of `input` (Attention: the order of map keys matters as the search will stop on
 * first match). Upon success, it returns a `right` of the corresponding value. Upon failure, it
 * returns a `left` of an error.
 *
 * @since 0.0.1
 * @category Instances
 */
export const mapped = <
	A extends {
		readonly toString: () => string;
	}
>(
	map: HashMap.HashMap<string, A>,
	name: string,
	strictCase: boolean
): Type<A> => {
	const casedMapEntries = pipe(
		map,
		HashMap.toEntries,
		MFunction.fIfTrue({ condition: !strictCase, f: Array.map(Tuple.mapFirst(EString.toLowerCase)) })
	);
	const casedMap = HashMap.fromIterable(casedMapEntries);
	const reversedMap = pipe(casedMapEntries, Array.map(Tuple.swap), HashMap.fromIterable);
	const keys = Array.map(casedMapEntries, Tuple.getFirst);
	const values = Array.map(casedMapEntries, Tuple.getSecond);
	const regExp = pipe(
		keys,
		Array.map(MRegExpString.escape),
		Function.tupled(MRegExpString.either),
		MRegExpString.atStart,
		MRegExp.fromRegExpString()
	);

	return make({
		name,
		read: (input) =>
			pipe(
				input,
				MFunction.fIfTrue({ condition: !strictCase, f: EString.toLowerCase }),
				MString.match(regExp),
				EOption.map(
					MTuple.makeBothBy({
						toFirst: MFunction.flipDual(HashMap.unsafeGet<string, A, string>)(casedMap),
						toSecond: flow(EString.length, Function.flip(MString.takeRightBut)(input))
					})
				),
				Either.fromOption(
					() =>
						new Error.Type({
							message: `Expected '${input}' to start with one of the following: ${pipe(keys, Array.map(flow(MString.prepend("'"), MString.append("'"))), Array.join(','))}`
						})
				)
			),
		write: (input) =>
			pipe(
				input,
				MFunction.flipDual(HashMap.get<A, string, A>)(reversedMap),
				Either.fromOption(
					() =>
						new Error.Type({
							message: `Expected '${input.toString()}' to be one of: ${pipe(
								values,
								Array.map((value) =>
									pipe(value.toString(), MString.prepend("'"), MString.append("'"))
								),
								Array.join(',')
							)}`
						})
				)
			)
	});
};

/**
 * This namespace implements Transformers to and from string
 *
 * @since 0.0.1
 */

export namespace String {
	export interface Type extends _Type<string> {}

	/**
	 * Transformer instance that reads/writes a string. The read method returns the rest of its input.
	 * The write method returns its input.
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const rest: Type = make({
		name: `string`,
		read: flow(Tuple.make, Tuple.appendElement(''), Either.right),
		write: Either.right
	});

	/**
	 * Transformer instance that reads/writes a string of exactly `length` characters. The read method
	 * returns an error if there are less than `length` characters left to read. Othewise, it reads
	 * `length` characters from its input and optionnally trims `leftPadding` and `rightPadding`. The
	 * write method will return an error if the value to write is more than `length` characters long.
	 * Otherwise, it will first pad its input to the left, then to the right, i.e if both
	 * `leftPadding` and `rightPadding` are non-empty strings, only `leftPadding` will be applied.
	 * `leftPadding` and `rightPadding` must be at most one character long.
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const fixedLength = (length: number, leftPadding = '', rightPadding = ''): Type =>
		make({
			name: `string${length}`,
			read: flow(
				MString.splitAt(length),
				Either.liftPredicate(
					Predicate.tuple(MString.hasLength(length), Function.constTrue),
					([left]) =>
						new Error.Type({ message: `'${left}' does not have ${length} characters to read.` })
				),
				Either.map(
					Tuple.mapFirst(
						flow(
							MFunction.fIfTrue({
								condition: leftPadding !== '',
								f: MString.trimStart(leftPadding)
							}),
							MFunction.fIfTrue({
								condition: rightPadding !== '',
								f: MString.trimEnd(rightPadding)
							})
						)
					)
				)
			),
			write:
				leftPadding === '' && rightPadding === '' ?
					Either.liftPredicate(
						MString.hasLength(length),
						(input) => new Error.Type({ message: `'${input}' is not ${length} characters long.` })
					)
				:	flow(
						MFunction.fIfTrue({
							condition: leftPadding !== '',
							f: EString.padStart(length, leftPadding)
						}),
						MFunction.fIfTrue({
							condition: rightPadding !== '',
							f: EString.padEnd(length, rightPadding)
						}),
						Either.liftPredicate(
							MString.hasLength(length),
							(input) =>
								new Error.Type({ message: `'${input}' is more than ${length} characters long.` })
						)
					)
		});
}

/**
 * This namespace implements Transformers to and from number
 *
 * @since 0.0.1
 */
export namespace Number {
	/**
	 * Type of a number Transformer
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export interface Type extends _Type<number> {}

	const MAX_MAX_FRACTIONAL_DIGITS = 100;

	/** Cache for number Transformers in different formats */
	const _cache = MCache.make({
		lookUp: ({ key }: { readonly key: Option.Type }) => {
			return pipe(
				_make({
					name: `number-${Option.name(key)}`,

					read: Option.toReader(key),

					write: Option.toWriter(key)
				}),
				Tuple.make,
				Tuple.appendElement(true)
			);
		},
		capacity: 30
	});

	/**
	 * Cached transformer instance that reads/writes a number.
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const make = (options: Option.Type): Type => pipe(_cache, MCache.get(options));

	/**
	 * Possible sign options
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export enum SignOption {
		/**
		 * No sign allowed - Negative numbers cannot be converted to a string with that option.
		 *
		 * @since 0.0.1
		 */
		None = 0,
		/**
		 * A sign must be present
		 *
		 * @since 0.0.1
		 */
		Mandatory = 1,
		/**
		 * A minus sign may be present
		 *
		 * @since 0.0.1
		 */
		MinusAllowed = 2,
		/**
		 * A plus sign and a minus sign may be present when reading from string. When writing to string,
		 * plus sign is not displayed.
		 *
		 * @since 0.0.1
		 */
		Optional = 3
	}

	/**
	 * Namespace for sign options
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export namespace SignOption {
		/**
		 * Turns a sign option into a regular expression string
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toRegExpString: (self: SignOption) => string = flow(
			MMatch.make,
			MMatch.whenIs(SignOption.None, () => ''),
			MMatch.whenIs(SignOption.Mandatory, () => MRegExpString.sign),
			MMatch.whenIs(SignOption.MinusAllowed, () => MRegExpString.optional(MRegExpString.minus)),
			MMatch.whenIs(SignOption.Optional, () => MRegExpString.optional(MRegExpString.sign)),
			MMatch.exhaustive,
			MRegExpString.capture
		);

		/**
		 * Turns a sign option into a function that takes a number and returns a string representing its
		 * sign, or an error if the sign cannot be represented with these options.
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toWriter: (
			self: SignOption
		) => MTypes.OneArgFunction<number, Either.Either<string, Error.Type>> = flow(
			MMatch.make,
			MMatch.whenIs(SignOption.None, () =>
				flow(
					Either.liftPredicate<number, Error.Type>(
						ENumber.greaterThanOrEqualTo(0),
						(input) =>
							new Error.Type({
								message: `Negative number '${input}' cannot be displayed with signOption 'None'`
							})
					),
					Either.map(() => '')
				)
			),
			MMatch.whenIs(SignOption.Mandatory, () =>
				flow(
					EOption.liftPredicate(ENumber.greaterThanOrEqualTo(0)),
					EOption.map(() => '+'),
					EOption.getOrElse(() => '-'),
					Either.right
				)
			),
			MMatch.whenIsOr(SignOption.MinusAllowed, SignOption.Optional, () =>
				flow(
					EOption.liftPredicate(ENumber.greaterThanOrEqualTo(0)),
					EOption.map(() => ''),
					EOption.getOrElse(() => '-'),
					Either.right
				)
			),
			MMatch.exhaustive
		);

		/**
		 * Turns a sign option into its name
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const name: (self: SignOption) => string = flow(
			MMatch.make,
			MMatch.whenIs(SignOption.None, () => 'no sign'),
			MMatch.whenIs(SignOption.Mandatory, () => 'mandatory sign'),
			MMatch.whenIs(SignOption.MinusAllowed, () => 'optional - sign'),
			MMatch.whenIs(SignOption.Optional, () => 'optional +/- sign'),
			MMatch.exhaustive
		);
	}

	/**
	 * Possible e-notation options
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export enum ENotationOption {
		/**
		 * E-notation is disallowed
		 *
		 * @since 0.0.1
		 */
		None = 0,
		/**
		 * E-notation may be present with a lowercase e
		 *
		 * @since 0.0.1
		 */
		Lowercase = 1,
		/**
		 * E-notation may be present with an uppercase E
		 *
		 * @since 0.0.1
		 */
		Uppercase = 2
	}

	/**
	 * Namespace for e-notation options
	 *
	 * @since 0.0.1
	 */
	export namespace ENotationOption {
		const _regExpString = (expMark: string): string =>
			pipe(
				MRegExpString.int(),
				MRegExpString.capture,
				MString.prepend(expMark),
				MRegExpString.optional
			);
		/**
		 * Turns an e-notation option into a regular expression string
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toRegExpString: (self: ENotationOption) => string = flow(
			MMatch.make,
			MMatch.whenIs(ENotationOption.None, () => MRegExpString.emptyCapture),
			MMatch.whenIs(ENotationOption.Lowercase, () => _regExpString('e')),
			MMatch.whenIs(ENotationOption.Uppercase, () => _regExpString('E')),
			MMatch.exhaustive
		);

		export const isAllowed: Predicate.Predicate<ENotationOption> = Predicate.not(
			MFunction.strictEquals(ENotationOption.None)
		);

		/**
		 * Turns an e-notation option into a function that takes an exponent and returns a string
		 * representing this exponent.
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toWriter: (self: ENotationOption) => MTypes.OneArgFunction<number, string> = flow(
			MMatch.make,
			MMatch.whenIs(ENotationOption.None, () => Function.constant('')),
			MMatch.whenIs(ENotationOption.Lowercase, () =>
				flow(MString.fromNonNullablePrimitive, MString.prepend('e'))
			),
			MMatch.whenIs(ENotationOption.Uppercase, () =>
				flow(MString.fromNonNullablePrimitive, MString.prepend('E'))
			),
			MMatch.exhaustive
		);
	}

	/**
	 * This namespace implements a Transformer for base 10 real numbers.
	 *
	 * @since 0.0.1
	 */
	export namespace Option {
		const moduleTag = _moduleTag + 'Real/Option/';
		const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
		type TypeId = typeof TypeId;

		/**
		 * Transformer.Real options
		 *
		 * @since 0.0.1
		 */
		export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
			/**
			 * SignOption options
			 *
			 * @since 0.0.1
			 */
			readonly signOption: SignOption;

			/**
			 * Fractional separator. `fractionalSep` should not contain or be included in `thousandsSep`.
			 *
			 * @since 0.0.1
			 */
			readonly fractionalSep: string;

			/**
			 * Thousand separator. Use an empty string for no separator. `thousandsSep` should not contain
			 * or be included in `fractionalSep`.
			 *
			 * @since 0.0.1
			 */
			readonly thousandsSep: string;

			/**
			 * Minimal number of decimal digits. Note that numbers starting with `0.` (for instance `0.5`)
			 * are considered to be equivalent to numbers starting with `.` (for instance `.5`) and are
			 * therefore considered to have 0 decimal digits. Must be a positive integer less than or
			 * equal to `maxDecimalDigits`. When reading from a string, this is the minimal number of
			 * digits that will be read for the decimal part. When writing to a string, the behaviour
			 * depends on the value of the `eNotationOption`. If `eNotationOption` is set to
			 * `ENotationOption.None`, trying to write strictly less than `minDecimalDigits` will result
			 * in an error. If `eNotationOption` is not set to `ENotationOption.None`, the number to write
			 * is multiplied by a 10^(-n) factor so that the [`minDecimalDigits`,`maxDecimalDigits`]
			 * constraint is respected. And a 10^n exponent will be added to the final string. When
			 * writing a number whose absolute value is strictly less than 1, a leading 0 is always added
			 * before the fractionalSep.
			 *
			 * @since 0.0.1
			 */
			readonly minDecimalDigits: number;

			/**
			 * Maximal number of decimal digits. Note that numbers starting with `0.` (for instance `0.5`)
			 * are considered to be equivalent to numbers starting with `.` (for instance `.5`) and are
			 * therefore considered to have 0 decimal digits. Must be a positive integer greater than or
			 * equal to `minDecimalDigits` (+Infinity is allowed). When reading from a string, this is the
			 * maximal number of digits that will be read for the decimal part. When writing to a string,
			 * the behaviour depends on the value of the `eNotationOption`. If `eNotationOption` is set to
			 * `ENotationOption.None`, trying to write strictly more than `maxDecimalDigits` will result
			 * in an error. If `eNotationOption` is not set to `ENotationOption.None`, the number to write
			 * is multiplied by a 10^(-n) factor so that the [`minDecimalDigits`,`maxDecimalDigits`]
			 * constraint is respected. And a 10^n exponent will be added to the final string. Do not set
			 * `maxDecimalDigits` and `maxFractionalDigits` simultaneously to 0. When writing a number
			 * whose absolute value is strictly less than 1, a leading 0 is always added before the
			 * fractionalSep.
			 *
			 * @since 0.0.1
			 */
			readonly maxDecimalDigits: number;

			/**
			 * Minimum number of fractional digits. Must be a positive integer less than or equal to
			 * `maxFractionalDigits`. Use 0 for integers. When reading from a string, this is the minimal
			 * number of digits that will be read for the fractional part. When writing to a string, the
			 * fractional part will be right-padded with zeros if necessary.
			 *
			 * @since 0.0.1
			 */
			readonly minFractionalDigits: number;

			/**
			 * Maximum number of fractional digits. Must be a positive integer greater than or equal to
			 * `minFractionalDigits` (+Infinity is allowed). Use 0 for integers. When reading from a
			 * string, this is the maximal number of digits that will be read for the fractional part.
			 * When writing to a string, the fractional part will be truncated to the min of that length
			 * and `MAX_MAX_FRACTIONAL_DIGITS` if necessary (the last digit will be rounded up if the
			 * digit before it is superior or equal to 5; rounded down otherwise). Do not set
			 * `maxDecimalDigits` and `maxFractionalDigits` simultaneously to 0.
			 *
			 * @since 0.0.1
			 */
			readonly maxFractionalDigits: number;

			/**
			 * E-notation options
			 *
			 * @since 0.0.1
			 */
			readonly eNotationOption: ENotationOption;

			/** @internal */
			readonly [TypeId]: TypeId;
		}

		/**
		 * Type guard
		 *
		 * @since 0.0.1
		 * @category Guards
		 */
		export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

		/**
		 * Equivalence
		 *
		 * @since 0.0.1
		 * @category Equivalences
		 */
		export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
			that.signOption === self.signOption &&
			that.fractionalSep === self.fractionalSep &&
			that.thousandsSep === self.thousandsSep &&
			that.minDecimalDigits === self.minDecimalDigits &&
			that.maxDecimalDigits === self.maxDecimalDigits &&
			that.minFractionalDigits === self.minFractionalDigits &&
			that.maxFractionalDigits === self.maxFractionalDigits &&
			that.eNotationOption === self.eNotationOption;

		/** Prototype */
		const proto: MTypes.Proto<Type> = {
			[TypeId]: TypeId,
			[Equal.symbol](this: Type, that: unknown): boolean {
				return has(that) && equivalence(this, that);
			},
			[Hash.symbol](this: Type) {
				return Hash.cached(this, Hash.structure(this));
			},
			...MInspectable.BaseProto(moduleTag),
			...MPipeable.BaseProto
		};

		/**
		 * Constructor
		 *
		 * @since 0.0.1
		 * @category Constructors
		 */
		export const make = (params: MTypes.Data<Type>): Type =>
			MTypes.objectFromDataAndProto(proto, params);

		/**
		 * Returns a copy of `self` where any missing property is filled with its default value
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const defaults: Type = make({
			signOption: SignOption.MinusAllowed,
			fractionalSep: '.',
			thousandsSep: ',',
			minDecimalDigits: 0,
			maxDecimalDigits: +Infinity,
			minFractionalDigits: 0,
			maxFractionalDigits: 4,
			eNotationOption: ENotationOption.None
		});

		/**
		 * Returns a copy of `self` where `sign` is set to `SignOption.None`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoSign = (self: Type): Type => make({ ...self, signOption: SignOption.None });

		/**
		 * Returns a copy of `self` where `sign` is set to `SignOption.Mandatory`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withMandatorySign = (self: Type): Type =>
			make({ ...self, signOption: SignOption.Mandatory });

		/**
		 * Returns a copy of `self` where `sign` is set to `SignOption.Optional`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withOptionalSign = (self: Type): Type =>
			make({ ...self, signOption: SignOption.Optional });

		/**
		 * Returns a copy of `self` where `sign` is set to `SignOption.MinusAllowed`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withMinusSignAllowed = (self: Type): Type =>
			make({ ...self, signOption: SignOption.MinusAllowed });

		/**
		 * Returns a copy of `self` where `minFractionalDigits` and `maxFractionalDigits` are set to 0
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoFractionalPart = (self: Type): Type =>
			make({ ...self, minFractionalDigits: 0, maxFractionalDigits: 0 });

		/**
		 * Returns a copy of `self` where `maxDecimalDigits` is set to 0
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoDecimalPart = (self: Type): Type =>
			make({ ...self, minDecimalDigits: 0, maxDecimalDigits: 0 });

		/**
		 * Returns a copy of `self` that does not allow e-notation
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoENotation = (self: Type): Type =>
			make({ ...self, eNotationOption: ENotationOption.None });

		/**
		 * Returns a copy of `self` that allows lowercase e-notation
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withLowercaseENotation = (self: Type): Type =>
			make({ ...self, eNotationOption: ENotationOption.Lowercase });

		/**
		 * Returns a copy of `self` that allows uppercase e-notation
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withUppercaseENotation = (self: Type): Type =>
			make({ ...self, eNotationOption: ENotationOption.Uppercase });

		/**
		 * Returns a copy of `self` where `thousandsSep` is set to the empty string
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoThousandSep = (self: Type): Type => make({ ...self, thousandsSep: '' });

		/**
		 * Returns a copy of `self` where `maxFractionalDigits` and `minFractionalDigits` are set to 2
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withTwoFractionalDigits = (self: Type): Type =>
			make({ ...self, minFractionalDigits: 2, maxFractionalDigits: 2 });

		/**
		 * Returns a copy of `self` where `minDecimalDigits` and `maxDecimalDigits` are set to 1 and
		 * `eNotationOption` is set to `ENotationOption.Lowercase`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withScientific = (self: Type): Type =>
			make({
				...self,
				minDecimalDigits: 1,
				maxDecimalDigits: 1,
				eNotationOption: ENotationOption.Lowercase
			});

		/**
		 * Returns a name for `self`
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const name = (self: Type): string =>
			`${self.signOption}-${self.fractionalSep}-${self.thousandsSep}-${self.minDecimalDigits}-${self.maxDecimalDigits}-${self.minFractionalDigits}-${self.maxFractionalDigits}-${self.eNotationOption}`;

		/**
		 * Returns a regular expression string representing `self`. The returned regular expression
		 * string allows the decimalPart and fractionalPart to be simultaneously absent. This is
		 * incorrect. We could have used a regular expression alternative (`|`) to handle this case but
		 * it creates a mess with capturing groups. So this case has to be handled programmatically by
		 * the function that uses this regular expression string.
		 */
		const toRegExpString = ({
			signOption,
			fractionalSep,
			thousandsSep,
			minDecimalDigits,
			maxDecimalDigits,
			minFractionalDigits,
			maxFractionalDigits,
			eNotationOption
		}: Type): string => {
			const signPart = SignOption.toRegExpString(signOption);

			const eNotationPart = ENotationOption.toRegExpString(eNotationOption);

			const decimalPart = MRegExpString.capture(
				maxDecimalDigits <= 0 ? MRegExpString.optional('0')
				: minDecimalDigits <= 0 ?
					pipe(MRegExpString.positiveInt(maxDecimalDigits, 1, thousandsSep), MRegExpString.optional)
				:	MRegExpString.strictlyPositiveInt(maxDecimalDigits, minDecimalDigits, thousandsSep)
			);

			const fractionalPart =
				maxFractionalDigits <= 0 ?
					MRegExpString.emptyCapture
				:	pipe(
						MRegExpString.digit,
						MRegExpString.repeatBetween(Math.max(1, minFractionalDigits), maxFractionalDigits),
						MRegExpString.capture,
						MString.prepend(MRegExpString.escape(fractionalSep)),
						MFunction.fIfTrue({ condition: minFractionalDigits <= 0, f: MRegExpString.optional })
					);

			return signPart + decimalPart + fractionalPart + eNotationPart;
		};

		/** Cache for regular expressions representing numbers in different formats */
		const _cache = MCache.make({
			lookUp: ({ key }: { readonly key: Type }) =>
				pipe(
					key,
					toRegExpString,
					MRegExpString.atStart,
					MRegExp.fromRegExpString(),
					Tuple.make,
					Tuple.appendElement(true)
				),
			capacity: 30
		});

		/**
		 * Returns a cached regular expression representing `self`
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toRegExp = (self: Type): RegExp => pipe(_cache, MCache.get(self));

		/**
		 * Turns a `Transformer.Option` into a function that tries to read a number from the start of a
		 * string with the options represented by `self`. The returned function returns, if successful,
		 * a `some` of the part of the string that represents an `MBrand.Real` and the rest of the
		 * string. Otherwise, it returns a `none`.
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toStringStartReader = (
			self: Type
		): MTypes.OneArgFunction<
			string,
			EOption.Option<
				[
					numberParts: [
						number: string,
						signPart: string,
						decimalPart: string,
						fractionalPart: string,
						exponentPart: string
					],
					rest: string
				]
			>
		> => {
			const regExp = toRegExp(self);

			return (input) =>
				pipe(
					input,
					MString.matchAndGroups(regExp),
					// Take care of numbers with simultaneously no decimal and no fractional parts (see toRegExpString)
					EOption.filter(
						Predicate.or(
							flow(MArray.unsafeGet(2), EString.isNonEmpty),
							flow(MArray.unsafeGet(3), EString.isNonEmpty)
						)
					),
					EOption.map(
						MTuple.makeBothBy({
							toFirst: Function.unsafeCoerce<ReadonlyArray<string>, never>,
							toSecond: flow(
								MArray.unsafeGet(0),
								EString.length,
								Function.flip(MString.takeRightBut)(input)
							)
						})
					)
				);
		};

		/**
		 * Turns a `Transformer.Option` into a function that takes a string and returns `true` if that
		 * string represents a `MBrand.Real` with the options represented by `self` and `false`
		 * otherwise
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toTester = (self: Type): MTypes.OneArgFunction<string, boolean> =>
			flow(
				toStringStartReader(self),
				EOption.filter(flow(Tuple.getSecond, EString.isEmpty)),
				EOption.isSome
			);

		/**
		 * Turns a `Transformer.Option` into a function that tries to read a number from the start of a
		 * string with the options represented by `self`. The returned function returns, if successful,
		 * a `right` of the read `MBrand.Real` and the rest of the string. If not successful, it returns
		 * a `left`.
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toReader = (
			self: Type
		): MTypes.OneArgFunction<
			string,
			Either.Either<readonly [value: number, rest: string], Error.Type>
		> => {
			const digitGroupAndSepLength = self.thousandsSep.length + MRegExpString.DIGIT_GROUP_SIZE;
			const reader = Option.toStringStartReader(self);
			const takeGroupFromRight = EString.takeRight(MRegExpString.DIGIT_GROUP_SIZE);

			return (input) =>
				pipe(
					input,
					reader,
					EOption.map(
						Tuple.mapFirst(([_, signPart, decimalPart, fractionalPart, exponentPart]) =>
							pipe(
								decimalPart,
								MString.splitEquallyRestAtStart(digitGroupAndSepLength),
								MArray.modifyTail(takeGroupFromRight),
								Array.join(''),
								MString.prepend(signPart),
								MString.append(fractionalPart !== '' ? '.' + fractionalPart : ''),
								MString.append(exponentPart !== '' ? 'e' + exponentPart : ''),
								MNumber.unsafeFromString
							)
						)
					),
					Either.fromOption(
						() => new Error.Type({ message: `Could not read number from start of ${input}` })
					)
				);
		};

		/**
		 * Turns a `Transformer.Option` into a function that tries to convert a `MBrand.Real` into a a
		 * string with the options represented by `self`. The returned function returns, if successful,
		 * a `right` of the string. If not successful, it returns a `left`.
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toWriter = (
			self: Type
		): MTypes.OneArgFunction<number, Either.Either<string, Error.Type>> => {
			const allowsENotation = ENotationOption.isAllowed(self.eNotationOption);
			const signWriter = SignOption.toWriter(self.signOption);
			const eNotationWriter = ENotationOption.toWriter(self.eNotationOption);
			const toppedMaxFractionalDigit = Math.min(
				MAX_MAX_FRACTIONAL_DIGITS,
				self.maxFractionalDigits
			);

			return (input) =>
				Either.gen(function* () {
					const sign = yield* signWriter(input);

					const absInput = Math.abs(input);

					const exponent = yield* pipe(
						absInput,
						MMatch.make,
						MMatch.when(ENumber.lessThanOrEqualTo(MNumber.EPSILON), () =>
							self.minDecimalDigits <= 0 ?
								Either.right(0)
							:	Either.left(
									new Error.Type({
										message: `Number '${input}' cannot be displayed with at least ${self.minDecimalDigits} decimal digits`
									})
								)
						),
						MMatch.orElse(
							flow(
								Math.log10,
								// Attention: Math.ceil(x) is not the same as Math.floor(x) + 1. Try with 10 for instance
								Math.floor,
								ENumber.increment,
								MTuple.makeBothBy({
									toFirst: ENumber.subtract(self.minDecimalDigits),
									toSecond: ENumber.subtract(self.maxDecimalDigits)
								}),
								MMatch.make,
								MMatch.when(
									Predicate.tuple(ENumber.greaterThan(0), ENumber.greaterThan(0)),
									Tuple.getSecond
								),
								MMatch.when(
									Predicate.tuple(ENumber.lessThan(0), ENumber.lessThan(0)),
									self.minDecimalDigits <= 0 ? Function.constant(0) : Tuple.getFirst
								),
								MMatch.orElse(Function.constant(0)),
								allowsENotation ?
									Either.right
								:	Either.liftPredicate(
										MFunction.strictEquals(0),
										() =>
											new Error.Type({
												message: `Number '${input}' cannot be displayed with at least ${self.minDecimalDigits} and at most ${self.maxDecimalDigits} decimal digits`
											})
									)
							)
						)
					);

					const [dec, frac] = pipe(
						absInput,
						MNumber.shift(-exponent),
						MNumber.decAndFracParts,
						Tuple.mapBoth({
							onFirst: flow(
								MString.fromNonNullablePrimitive,
								MString.splitEquallyRestAtStart(MRegExpString.DIGIT_GROUP_SIZE),
								Array.join(self.thousandsSep)
							),
							onSecond:
								self.maxFractionalDigits <= 0 ?
									() => ''
								:	flow(
										MNumber.shift(toppedMaxFractionalDigit),
										Math.round,
										MString.fromNonNullablePrimitive,
										EString.padStart(self.maxFractionalDigits, '0'),
										(frac) =>
											pipe(
												frac,
												MString.searchRight(MRegExp.nonZeroDigit),
												EOption.map(flow(Struct.get('startIndex'), ENumber.increment)),
												EOption.getOrElse(Function.constant(0)),
												ENumber.max(self.minFractionalDigits),
												MFunction.flipDual(EString.takeLeft)(frac),
												EOption.liftPredicate(EString.isNonEmpty),
												EOption.map(MString.prepend(self.fractionalSep)),
												EOption.getOrElse(Function.constant(''))
											)
									)
						})
					);

					return pipe(
						sign,
						MString.append(dec),
						MString.append(frac),
						MString.append(eNotationWriter(exponent))
					);
				});
		};

		export namespace Real {
			/**
			 * Option instance that represents a real number with no thousand separator
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const standard: Type = pipe(defaults, withNoThousandSep);

			/**
			 * Option instance that represents a UK-style real number
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const uk: Type = defaults;

			/**
			 * Option instance that represents a German-style real number
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const german: Type = make({ ...defaults, thousandsSep: '.', fractionalSep: ',' });

			/**
			 * Option instance that represents a French-style real number
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const french: Type = make({ ...defaults, thousandsSep: ' ', fractionalSep: ',' });

			/**
			 * Option instance that represents a real number with two fractional digits and no thousand
			 * separator
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const standard2FractionalDigits: Type = pipe(standard, withTwoFractionalDigits);

			/**
			 * Option instance that represents a UK-style real number with two fractional digits.
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const uk2FractionalDigits: Type = pipe(uk, withTwoFractionalDigits);

			/**
			 * Option instance that represents a German-style real number with two fractional digits.
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const german2FractionalDigits: Type = pipe(german, withTwoFractionalDigits);

			/**
			 * Option instance that represents a French-style real number with two fractional digits.
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const french2FractionalDigits: Type = pipe(french, withTwoFractionalDigits);

			/**
			 * Option instance that represents a number in scientific notation
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const scientific: Type = pipe(standard, withScientific);

			/**
			 * Option instance that represents a number in UK-style scientific notation
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const ukScientific: Type = pipe(uk, withScientific);

			/**
			 * Option instance that represents a number in German-style scientific notation
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const germanScientific: Type = pipe(german, withScientific);

			/**
			 * Option instance that represents a number in French-style scientific notation
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const frenchScientific: Type = pipe(french, withScientific);

			/**
			 * Option instance that represents a number with no decimal part
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const fractional: Type = pipe(standard, withNoDecimalPart);

			/**
			 * Option instance that represents a UK-style number with no decimal part
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const ukFractional: Type = pipe(uk, withNoDecimalPart);

			/**
			 * Option instance that represents a German-style number with no decimal part
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const germanFractional: Type = pipe(german, withNoDecimalPart);

			/**
			 * Option instance that represents a French-style number with no decimal part
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const frenchFractional: Type = pipe(french, withNoDecimalPart);
		}

		export namespace Int {
			/**
			 * Option instance that represents an integer with no thousand separator
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const standard: Type = pipe(Real.standard, withNoFractionalPart);

			/**
			 * Option instance that represents an integer with no thousand separator
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const signed: Type = pipe(standard, withMandatorySign);

			/**
			 * Option instance that represents an integer with no thousand separator that may receive a
			 * plus sign for positive values
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const plussed: Type = pipe(standard, withOptionalSign);

			/**
			 * Option instance that represents a UK-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const uk: Type = pipe(Real.uk, withNoFractionalPart);

			/**
			 * Option instance that represents a signed UK-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const signedUk: Type = pipe(uk, withMandatorySign);

			/**
			 * Option instance that represents a UK-style integer that may receive a plus sign for
			 * positive values.
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const plussedUk: Type = pipe(uk, withOptionalSign);

			/**
			 * Option instance that represents a German-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const german: Type = pipe(Real.german, withNoFractionalPart);

			/**
			 * Option instance that represents a signed German-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const signedGerman: Type = pipe(german, withMandatorySign);

			/**
			 * Option instance that represents a German-style integer that may receive a plus sign for
			 * positive values.
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const plussedGerman: Type = pipe(german, withOptionalSign);

			/**
			 * Option instance that represents a French-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const french: Type = pipe(Real.french, withNoFractionalPart);

			/**
			 * Option instance that represents a signed French-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const signedFrench: Type = pipe(french, withMandatorySign);

			/**
			 * Option instance that represents a French-style integer that may receive a plus sign for
			 * positive values.
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const plussedFrench: Type = pipe(french, withOptionalSign);
		}

		export namespace PositiveInt {
			/**
			 * Option instance that represents a positive integer with no thousand separator
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const standard: Type = pipe(Int.standard, withNoSign);

			/**
			 * Option instance that represents a positive UK-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const uk: Type = pipe(Int.uk, withNoSign);

			/**
			 * Option instance that represents a positive German-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const german: Type = pipe(Int.german, withNoSign);

			/**
			 * Option instance that represents a positive French-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const french: Type = pipe(Int.french, withNoSign);
		}
	}

	/**
	 * This namespace implements Transformers to and from MBrand.Real
	 *
	 * @since 0.0.1
	 */
	export namespace Real {
		/**
		 * Type of a Real Transformer
		 *
		 * @since 0.0.1
		 * @category Models
		 */
		export interface Type extends _Type<MBrand.Real.Type> {}

		/**
		 * Cached transformer instance that reads/writes a real number with no thousand separator
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const standard: Type = make(Option.Real.standard) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a UK-style real number
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const uk: Type = make(Option.Real.uk) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a German-style real number
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const german: Type = make(Option.Real.german) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a French-style real number
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const french: Type = make(Option.Real.french) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a real number with two fractional digits and no
		 * thousand separator
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const standard2FractionalDigits: Type = make(
			Option.Real.standard2FractionalDigits
		) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a UK-style real number with two fractional
		 * digits.
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const uk2FractionalDigits: Type = make(
			Option.Real.uk2FractionalDigits
		) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a German-style real number with two fractional
		 * digits.
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const german2FractionalDigits: Type = make(
			Option.Real.german2FractionalDigits
		) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a French-style real number with two fractional
		 * digits.
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const french2FractionalDigits: Type = make(
			Option.Real.french2FractionalDigits
		) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a number in scientific notation
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const scientific: Type = make(Option.Real.scientific) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a number in UK-style scientific notation
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const ukScientific: Type = make(Option.Real.ukScientific) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a number in German-style scientific notation
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const germanScientific: Type = make(Option.Real.germanScientific) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a number in French-style scientific notation
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const frenchScientific: Type = make(Option.Real.frenchScientific) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a number with no decimal part
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const fractional: Type = make(Option.Real.fractional) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a UK-style number with no decimal part
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const ukFractional: Type = make(Option.Real.ukFractional) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a German-style number with no decimal part
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const germanFractional: Type = make(Option.Real.germanFractional) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a French-style number with no decimal part
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const frenchFractional: Type = make(Option.Real.frenchFractional) as unknown as Type;
	}

	/**
	 * This namespace implements Transformers to and from MBrand.Int
	 *
	 * @since 0.0.1
	 */
	export namespace Int {
		/**
		 * Type of an Int Transformer
		 *
		 * @since 0.0.1
		 * @category Models
		 */
		export interface Type extends _Type<MBrand.Int.Type> {}

		/**
		 * Cached transformer instance that reads/writes an integer with no thousand separator
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const standard = make(Option.Int.standard) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes an integer with no thousand separator
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const signed = make(Option.Int.signed) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes an integer with no thousand separator that may
		 * receive a plus sign for positive values
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const plussed = make(Option.Int.plussed) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a UK-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const uk = make(Option.Int.uk) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a UK-style signed integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const signedUk = make(Option.Int.signedUk) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a UK-style integer that may receive a plus sign
		 * for positive values
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const plussedUk = make(Option.Int.plussedUk) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a German-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const german = make(Option.Int.german) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a German-style signed integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const signedGerman = make(Option.Int.signedGerman) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a German-style integer that may receive a plus
		 * sign for positive values
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const plussedGerman = make(Option.Int.plussedGerman) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a French-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const french = make(Option.Int.french) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a French-style signed integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const signedFrench = make(Option.Int.signedFrench) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a French-style integer that may receive a plus
		 * sign for positive values
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const plussedFrench = make(Option.Int.plussedFrench) as unknown as Type;
	}

	/**
	 * This namespace implements Transformers to and from MBrand.PositiveInt
	 *
	 * @since 0.0.1
	 */
	export namespace PositiveInt {
		/**
		 * Type of a PositiveInt Transformer
		 *
		 * @since 0.0.1
		 * @category Models
		 */
		export interface Type extends _Type<MBrand.PositiveInt.Type> {}

		/**
		 * Transformer instance for a positive integer expressed in basis `radix` whose string
		 * representation must comply with `regExp`
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const inBasis = (name: string, regExp: RegExp, radix: number): Type =>
			_make({
				name,
				read: (input) =>
					pipe(
						input,
						MString.match(regExp),
						EOption.map(
							MTuple.makeBothBy({
								toFirst: flow(
									MNumber.unsafeIntFromString(radix),
									MBrand.PositiveInt.unsafeFromNumber
								),
								toSecond: flow(EString.length, Function.flip(MString.takeRightBut)(input))
							})
						),
						Either.fromOption(
							() =>
								new Error.Type({
									message: `Could not read ${name} number from start of '${input}'`
								})
						)
					),
				write: flow(MString.fromNumber(radix), Either.right)
			});

		/**
		 * Transformer instance that reads/writes a binary positive integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const binary = inBasis('binary', MRegExp.binaryIntAtStart, 2);

		/**
		 * Transformer instance that reads/writes an octal positive integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const octal = inBasis('octal', MRegExp.octalIntAtStart, 8);

		/**
		 * Transformer instance that reads/writes an hexadecimal positive integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const hexadecimal = inBasis('hexadecimal', MRegExp.hexaIntAtStart, 16);

		/**
		 * Cached transformer instance that reads/writes a positive integer with no thousand separator
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const standard = make(Option.PositiveInt.standard) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a UK-style positive integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const uk = make(Option.PositiveInt.uk) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a German-style positive integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const german = make(Option.PositiveInt.german) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a French-style positive integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const french = make(Option.PositiveInt.french) as unknown as Type;
	}
}
