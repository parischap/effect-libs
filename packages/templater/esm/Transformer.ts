/**
 * This module implements a Transformer<A> which is used to transform a string into a value of type
 * A and vice versa. It is used within a Pattern (see Pattern.ts).
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
	MStruct,
	MTuple,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Either,
	Number as ENumber,
	Equal,
	Equivalence,
	String as EString,
	flow,
	Function,
	Hash,
	HashMap,
	Inspectable,
	Option,
	pipe,
	Pipeable,
	Predicate,
	Struct,
	Tuple,
	Types
} from 'effect';
import * as Error from './Error.js';

const moduleTag = '@parischap/templater/Transformer/';
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
	 * Id of this Transformer instance. Only useful for debugging purposes.
	 *
	 * @since 0.0.1
	 */
	readonly id: string;
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
export const equivalence: Equivalence.Equivalence<Type<any>> = (self, that) => that.id === self.id;

/** Prototype */
const _TypeIdHash = Hash.hash(TypeId);
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<any>> = {
	[TypeId]: {
		_A: MTypes.invariantValue
	},
	[Equal.symbol]<A>(this: Type<A>, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol]<A>(this: Type<A>) {
		return pipe(this.id, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
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
			id: `${self.id} ${that.id}`,
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
 * keys (equivalence is based on Equal.equals) at the start of `input` (Attention: the order of map
 * keys matters as the search will stop on first match). Upon success, it returns a `right` of the
 * corresponding value. Upon failure, it returns a `left` of an error. When writing to a string, it
 * tries to find `input` among one of `map` values (equivalence is based on Equal.equals). Upon
 * success, it returns a `right` of the corresponding key. Upon failure, it returns a `left` of an
 * error.
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
	id: string,
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
		RegExp
	);

	return make({
		id,
		read: (input) =>
			pipe(
				input,
				MFunction.fIfTrue({ condition: !strictCase, f: EString.toLowerCase }),
				MString.match(regExp),
				Option.map(
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
		id: `string`,
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
			id: `string${length}`,
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
		lookUp: ({ key }: { readonly key: Options.Type }) => {
			return pipe(
				_make({
					id: `number-${Options.id(key)}`,

					read: Options.toReader(key),

					write: Options.toWriter(key)
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
	export const make = (options: Options.Type): Type => pipe(_cache, MCache.get(options));

	/**
	 * Possible sign options
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export enum SignOptions {
		/**
		 * No sign allowed - Negative numbers cannot be converted to a string with that options.
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
	export namespace SignOptions {
		/**
		 * Turns a `SignOptions` into a regular expression string
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toRegExpString: (self: SignOptions) => string = flow(
			MMatch.make,
			MMatch.whenIs(SignOptions.None, () => ''),
			MMatch.whenIs(SignOptions.Mandatory, () => MRegExpString.sign),
			MMatch.whenIs(SignOptions.MinusAllowed, () => MRegExpString.optional(MRegExpString.minus)),
			MMatch.whenIs(SignOptions.Optional, () => MRegExpString.optional(MRegExpString.sign)),
			MMatch.exhaustive,
			MRegExpString.capture
		);

		/**
		 * Turns a `SignOptions` into a function that takes a number and returns a string representing
		 * its sign, or an error if the sign cannot be represented with these options.
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toWriter: (
			self: SignOptions
		) => MTypes.OneArgFunction<number, Either.Either<string, Error.Type>> = flow(
			MMatch.make,
			MMatch.whenIs(SignOptions.None, () =>
				flow(
					Either.liftPredicate<number, Error.Type>(
						ENumber.greaterThanOrEqualTo(0),
						(input) =>
							new Error.Type({
								message: `Negative number '${input}' cannot be displayed with 'SignOptions.None'`
							})
					),
					Either.map(() => '')
				)
			),
			MMatch.whenIs(SignOptions.Mandatory, () =>
				flow(
					Option.liftPredicate(ENumber.greaterThanOrEqualTo(0)),
					Option.map(() => '+'),
					Option.getOrElse(() => '-'),
					Either.right
				)
			),
			MMatch.whenIsOr(SignOptions.MinusAllowed, SignOptions.Optional, () =>
				flow(
					Option.liftPredicate(ENumber.greaterThanOrEqualTo(0)),
					Option.map(() => ''),
					Option.getOrElse(() => '-'),
					Either.right
				)
			),
			MMatch.exhaustive
		);

		/**
		 * Turns a `SignOptions` into its id
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const id: (self: SignOptions) => string = flow(
			MMatch.make,
			MMatch.whenIs(SignOptions.None, () => 'no sign'),
			MMatch.whenIs(SignOptions.Mandatory, () => 'mandatory sign'),
			MMatch.whenIs(SignOptions.MinusAllowed, () => 'optional - sign'),
			MMatch.whenIs(SignOptions.Optional, () => 'optional +/- sign'),
			MMatch.exhaustive
		);
	}

	/**
	 * Possible e-notation options
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export enum ENotationOptions {
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
	export namespace ENotationOptions {
		const _regExpString = (expMark: string): string =>
			pipe(
				MRegExpString.int(),
				MRegExpString.capture,
				MString.prepend(expMark),
				MRegExpString.optional
			);
		/**
		 * Turns an `ENotationOptions` into a regular expression string
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toRegExpString: (self: ENotationOptions) => string = flow(
			MMatch.make,
			MMatch.whenIs(ENotationOptions.None, () => MRegExpString.emptyCapture),
			MMatch.whenIs(ENotationOptions.Lowercase, () => _regExpString('e')),
			MMatch.whenIs(ENotationOptions.Uppercase, () => _regExpString('E')),
			MMatch.exhaustive
		);

		export const isAllowed: Predicate.Predicate<ENotationOptions> = Predicate.not(
			MFunction.strictEquals(ENotationOptions.None)
		);

		/**
		 * Turns an `ENotationOptions` into a function that takes an exponent and returns a string
		 * representing this exponent.
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toWriter: (self: ENotationOptions) => MTypes.OneArgFunction<number, string> = flow(
			MMatch.make,
			MMatch.whenIs(ENotationOptions.None, () => MFunction.constEmptyString),
			MMatch.whenIs(ENotationOptions.Lowercase, () =>
				flow(MString.fromNonNullablePrimitive, MString.prepend('e'))
			),
			MMatch.whenIs(ENotationOptions.Uppercase, () =>
				flow(MString.fromNonNullablePrimitive, MString.prepend('E'))
			),
			MMatch.exhaustive
		);
	}

	/**
	 * This namespace implements the Options to Transformer.Number.make.
	 *
	 * @since 0.0.1
	 */
	export namespace Options {
		const moduleTag = _moduleTag + 'Real/Options/';
		const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
		type TypeId = typeof TypeId;

		/**
		 * Transformer.Real options
		 *
		 * @since 0.0.1
		 */
		export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
			/**
			 * Sign options
			 *
			 * @since 0.0.1
			 */
			readonly signOptions: SignOptions;

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
			 * depends on the value of `eNotationOptions`. If `eNotationOptions` is set to
			 * `ENotationOptions.None`, trying to write strictly less than `minDecimalDigits` will result
			 * in an error. If `eNotationOptions` is not set to `ENotationOptions.None`, the number to
			 * write is multiplied by a 10^(-n) factor so that the [`minDecimalDigits`,`maxDecimalDigits`]
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
			 * the behaviour depends on the value of `eNotationOptions`. If `eNotationOptions` is set to
			 * `ENotationOptions.None`, trying to write strictly more than `maxDecimalDigits` will result
			 * in an error. If `eNotationOptions` is not set to `ENotationOptions.None`, the number to
			 * write is multiplied by a 10^(-n) factor so that the [`minDecimalDigits`,`maxDecimalDigits`]
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
			readonly eNotationOptions: ENotationOptions;

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
			that.signOptions === self.signOptions &&
			that.fractionalSep === self.fractionalSep &&
			that.thousandsSep === self.thousandsSep &&
			that.minDecimalDigits === self.minDecimalDigits &&
			that.maxDecimalDigits === self.maxDecimalDigits &&
			that.minFractionalDigits === self.minFractionalDigits &&
			that.maxFractionalDigits === self.maxFractionalDigits &&
			that.eNotationOptions === self.eNotationOptions;

		/** Prototype */
		const _TypeIdHash = Hash.hash(TypeId);
		const proto: MTypes.Proto<Type> = {
			[TypeId]: TypeId,
			[Equal.symbol](this: Type, that: unknown): boolean {
				return has(that) && equivalence(this, that);
			},
			[Hash.symbol](this: Type) {
				return pipe(
					this.signOptions,
					Hash.hash,
					Hash.combine(Hash.hash(this.fractionalSep)),
					Hash.combine(Hash.hash(this.thousandsSep)),
					Hash.combine(Hash.hash(this.minDecimalDigits)),
					Hash.combine(Hash.hash(this.maxDecimalDigits)),
					Hash.combine(Hash.hash(this.minFractionalDigits)),
					Hash.combine(Hash.hash(this.maxFractionalDigits)),
					Hash.combine(Hash.hash(this.eNotationOptions)),
					Hash.combine(_TypeIdHash),
					Hash.cached(this)
				);
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
			signOptions: SignOptions.MinusAllowed,
			fractionalSep: '.',
			thousandsSep: ',',
			minDecimalDigits: 0,
			maxDecimalDigits: +Infinity,
			minFractionalDigits: 0,
			maxFractionalDigits: 4,
			eNotationOptions: ENotationOptions.None
		});

		/**
		 * Returns a copy of `self` where `sign` is set to `SignOptions.None`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoSign: (self: Type) => Type = flow(
			MStruct.set({ signOptions: SignOptions.None }),
			make
		);

		/**
		 * Returns a copy of `self` where `sign` is set to `SignOptions.Mandatory`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withMandatorySign: (self: Type) => Type = flow(
			MStruct.set({ signOptions: SignOptions.Mandatory }),
			make
		);

		/**
		 * Returns a copy of `self` where `sign` is set to `SignOptions.Optional`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withOptionalSign: (self: Type) => Type = flow(
			MStruct.set({ signOptions: SignOptions.Optional }),
			make
		);

		/**
		 * Returns a copy of `self` where `sign` is set to `SignOptions.MinusAllowed`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withMinusSignAllowed: (self: Type) => Type = flow(
			MStruct.set({ signOptions: SignOptions.MinusAllowed }),
			make
		);

		/**
		 * Returns a copy of `self` where `minFractionalDigits` and `maxFractionalDigits` are set to 0
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoFractionalPart: (self: Type) => Type = flow(
			MStruct.set({ minFractionalDigits: 0, maxFractionalDigits: 0 }),
			make
		);

		/**
		 * Returns a copy of `self` where `maxDecimalDigits` is set to 0
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoDecimalPart: (self: Type) => Type = flow(
			MStruct.set({ minDecimalDigits: 0, maxDecimalDigits: 0 }),
			make
		);

		/**
		 * Returns a copy of `self` that does not allow e-notation
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoENotation: (self: Type) => Type = flow(
			MStruct.set({ eNotationOptions: ENotationOptions.None }),
			make
		);

		/**
		 * Returns a copy of `self` that allows lowercase e-notation
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withLowercaseENotation: (self: Type) => Type = flow(
			MStruct.set({ eNotationOptions: ENotationOptions.Lowercase }),
			make
		);

		/**
		 * Returns a copy of `self` that allows uppercase e-notation
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withUppercaseENotation: (self: Type) => Type = flow(
			MStruct.set({ eNotationOptions: ENotationOptions.Uppercase }),
			make
		);

		/**
		 * Returns a copy of `self` where `thousandsSep` is set to the empty string
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withNoThousandSep: (self: Type) => Type = flow(
			MStruct.set({ thousandsSep: '' }),
			make
		);

		/**
		 * Returns a copy of `self` where `maxFractionalDigits` and `minFractionalDigits` are set to 2
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withTwoFractionalDigits: (self: Type) => Type = flow(
			MStruct.set({ minFractionalDigits: 2, maxFractionalDigits: 2 }),
			make
		);

		/**
		 * Returns a copy of `self` where `minDecimalDigits` and `maxDecimalDigits` are set to 1 and
		 * `eNotationOptions` is set to `ENotationOptions.Lowercase`
		 *
		 * @since 0.0.1
		 * @category Utils
		 */
		export const withScientific: (self: Type) => Type = flow(
			MStruct.set({
				minDecimalDigits: 1,
				maxDecimalDigits: 1,
				eNotationOptions: ENotationOptions.Lowercase
			}),
			make
		);

		/**
		 * Returns a id for `self`
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const id = (self: Type): string =>
			`${self.signOptions}-${self.fractionalSep}-${self.thousandsSep}-${self.minDecimalDigits}-${self.maxDecimalDigits}-${self.minFractionalDigits}-${self.maxFractionalDigits}-${self.eNotationOptions}`;

		/**
		 * Returns a regular expression string representing `self`. The returned regular expression
		 * string allows the decimalPart and fractionalPart to be simultaneously absent. This is
		 * incorrect. We could have used a regular expression alternative (`|`) to handle this case but
		 * it creates a mess with capturing groups. So this case has to be handled programmatically by
		 * the function that uses this regular expression string.
		 */
		const toRegExpString = ({
			signOptions,
			fractionalSep,
			thousandsSep,
			minDecimalDigits,
			maxDecimalDigits,
			minFractionalDigits,
			maxFractionalDigits,
			eNotationOptions
		}: Type): string => {
			const signPart = SignOptions.toRegExpString(signOptions);

			const eNotationPart = ENotationOptions.toRegExpString(eNotationOptions);

			const decimalPart = MRegExpString.capture(
				maxDecimalDigits <= 0 ? MRegExpString.optional('0')
				: minDecimalDigits <= 0 ?
					pipe(
						MRegExpString.unsignedBase10Int(maxDecimalDigits, 1, thousandsSep),
						MRegExpString.optional
					)
				:	MRegExpString.unsignedNonNullBase10Int(maxDecimalDigits, minDecimalDigits, thousandsSep)
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
					RegExp,
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
		 * Turns a `Transformer.Options` into a function that tries to read a number from the start of a
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
			Option.Option<
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
					Option.filter(
						Predicate.or(
							flow(MArray.unsafeGet(2), EString.isNonEmpty),
							flow(MArray.unsafeGet(3), EString.isNonEmpty)
						)
					),
					Option.map(
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
		 * Turns a `Transformer.Options` into a function that takes a string and returns `true` if that
		 * string represents a `MBrand.Real` with the options represented by `self` and `false`
		 * otherwise
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toTester = (self: Type): MTypes.OneArgFunction<string, boolean> =>
			flow(
				toStringStartReader(self),
				Option.filter(flow(Tuple.getSecond, EString.isEmpty)),
				Option.isSome
			);

		/**
		 * Turns a `Transformer.Options` into a function that tries to read a number from the start of a
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
			const reader = Options.toStringStartReader(self);
			const takeGroupFromRight = EString.takeRight(MRegExpString.DIGIT_GROUP_SIZE);

			return (input) =>
				pipe(
					input,
					reader,
					Option.map(
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
		 * Turns a `Transformer.Options` into a function that tries to convert a `MBrand.Real` into a a
		 * string with the options represented by `self`. The returned function returns, if successful,
		 * a `right` of the string. If not successful, it returns a `left`.
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toWriter = (
			self: Type
		): MTypes.OneArgFunction<number, Either.Either<string, Error.Type>> => {
			const allowsENotation = ENotationOptions.isAllowed(self.eNotationOptions);
			const signWriter = SignOptions.toWriter(self.signOptions);
			const eNotationWriter = ENotationOptions.toWriter(self.eNotationOptions);
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
						MNumber.integerAndFractionalParts,
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
												Option.map(flow(Struct.get('startIndex'), ENumber.increment)),
												Option.getOrElse(() => 0),
												ENumber.max(self.minFractionalDigits),
												MFunction.flipDual(EString.takeLeft)(frac),
												Option.liftPredicate(EString.isNonEmpty),
												Option.map(MString.prepend(self.fractionalSep)),
												Option.getOrElse(MFunction.constEmptyString)
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
			 * Options instance that represents a real number with no thousand separator
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const standard: Type = pipe(defaults, withNoThousandSep);

			/**
			 * Options instance that represents a UK-style real number
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const uk: Type = defaults;

			/**
			 * Options instance that represents a German-style real number
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const german: Type = pipe(
				defaults,
				MStruct.set({ thousandsSep: '.', fractionalSep: ',' }),
				make
			);

			/**
			 * Options instance that represents a French-style real number
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const french: Type = pipe(
				defaults,
				MStruct.set({ thousandsSep: ' ', fractionalSep: ',' }),
				make
			);

			/**
			 * Options instance that represents a real number with two fractional digits and no thousand
			 * separator
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const standard2FractionalDigits: Type = withTwoFractionalDigits(standard);

			/**
			 * Options instance that represents a UK-style real number with two fractional digits.
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const uk2FractionalDigits: Type = withTwoFractionalDigits(uk);

			/**
			 * Options instance that represents a German-style real number with two fractional digits.
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const german2FractionalDigits: Type = withTwoFractionalDigits(german);

			/**
			 * Options instance that represents a French-style real number with two fractional digits.
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const french2FractionalDigits: Type = withTwoFractionalDigits(french);

			/**
			 * Options instance that represents a number in scientific notation
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const scientific: Type = withScientific(standard);

			/**
			 * Options instance that represents a number in UK-style scientific notation
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const ukScientific: Type = withScientific(uk);

			/**
			 * Options instance that represents a number in German-style scientific notation
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const germanScientific: Type = withScientific(german);

			/**
			 * Options instance that represents a number in French-style scientific notation
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const frenchScientific: Type = withScientific(french);

			/**
			 * Options instance that represents a number with no decimal part
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const fractional: Type = withNoDecimalPart(standard);

			/**
			 * Options instance that represents a UK-style number with no decimal part
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const ukFractional: Type = withNoDecimalPart(uk);

			/**
			 * Options instance that represents a German-style number with no decimal part
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const germanFractional: Type = withNoDecimalPart(german);

			/**
			 * Options instance that represents a French-style number with no decimal part
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const frenchFractional: Type = withNoDecimalPart(french);
		}

		export namespace Int {
			/**
			 * Options instance that represents an integer with no thousand separator
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const standard: Type = withNoFractionalPart(Real.standard);

			/**
			 * Options instance that represents an integer with no thousand separator
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const signed: Type = withMandatorySign(standard);

			/**
			 * Options instance that represents an integer with no thousand separator that may receive a
			 * plus sign for positive values
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const plussed: Type = withOptionalSign(standard);

			/**
			 * Options instance that represents a UK-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const uk: Type = withNoFractionalPart(Real.uk);

			/**
			 * Options instance that represents a signed UK-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const signedUk: Type = withMandatorySign(uk);

			/**
			 * Options instance that represents a UK-style integer that may receive a plus sign for
			 * positive values.
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const plussedUk: Type = withOptionalSign(uk);

			/**
			 * Options instance that represents a German-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const german: Type = withNoFractionalPart(Real.german);

			/**
			 * Options instance that represents a signed German-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const signedGerman: Type = withMandatorySign(german);

			/**
			 * Options instance that represents a German-style integer that may receive a plus sign for
			 * positive values.
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const plussedGerman: Type = withOptionalSign(german);

			/**
			 * Options instance that represents a French-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const french: Type = withNoFractionalPart(Real.french);

			/**
			 * Options instance that represents a signed French-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const signedFrench: Type = withMandatorySign(french);

			/**
			 * Options instance that represents a French-style integer that may receive a plus sign for
			 * positive values.
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const plussedFrench: Type = withOptionalSign(french);
		}

		export namespace PositiveInt {
			/**
			 * Options instance that represents a positive integer with no thousand separator
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const standard: Type = withNoSign(Int.standard);

			/**
			 * Options instance that represents a positive UK-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const uk: Type = withNoSign(Int.uk);

			/**
			 * Options instance that represents a positive German-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const german: Type = withNoSign(Int.german);

			/**
			 * Options instance that represents a positive French-style integer
			 *
			 * @since 0.0.1
			 * @category Instances
			 */
			export const french: Type = withNoSign(Int.french);
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
		export const standard: Type = make(Options.Real.standard) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a UK-style real number
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const uk: Type = make(Options.Real.uk) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a German-style real number
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const german: Type = make(Options.Real.german) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a French-style real number
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const french: Type = make(Options.Real.french) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a real number with two fractional digits and no
		 * thousand separator
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const standard2FractionalDigits: Type = make(
			Options.Real.standard2FractionalDigits
		) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a UK-style real number with two fractional
		 * digits.
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const uk2FractionalDigits: Type = make(
			Options.Real.uk2FractionalDigits
		) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a German-style real number with two fractional
		 * digits.
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const german2FractionalDigits: Type = make(
			Options.Real.german2FractionalDigits
		) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a French-style real number with two fractional
		 * digits.
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const french2FractionalDigits: Type = make(
			Options.Real.french2FractionalDigits
		) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a number in scientific notation
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const scientific: Type = make(Options.Real.scientific) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a number in UK-style scientific notation
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const ukScientific: Type = make(Options.Real.ukScientific) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a number in German-style scientific notation
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const germanScientific: Type = make(Options.Real.germanScientific) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a number in French-style scientific notation
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const frenchScientific: Type = make(Options.Real.frenchScientific) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a number with no decimal part
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const fractional: Type = make(Options.Real.fractional) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a UK-style number with no decimal part
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const ukFractional: Type = make(Options.Real.ukFractional) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a German-style number with no decimal part
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const germanFractional: Type = make(Options.Real.germanFractional) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a French-style number with no decimal part
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const frenchFractional: Type = make(Options.Real.frenchFractional) as unknown as Type;
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
		export const standard = make(Options.Int.standard) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes an integer with no thousand separator
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const signed = make(Options.Int.signed) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes an integer with no thousand separator that may
		 * receive a plus sign for positive values
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const plussed = make(Options.Int.plussed) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a UK-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const uk = make(Options.Int.uk) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a UK-style signed integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const signedUk = make(Options.Int.signedUk) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a UK-style integer that may receive a plus sign
		 * for positive values
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const plussedUk = make(Options.Int.plussedUk) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a German-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const german = make(Options.Int.german) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a German-style signed integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const signedGerman = make(Options.Int.signedGerman) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a German-style integer that may receive a plus
		 * sign for positive values
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const plussedGerman = make(Options.Int.plussedGerman) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a French-style integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const french = make(Options.Int.french) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a French-style signed integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const signedFrench = make(Options.Int.signedFrench) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a French-style integer that may receive a plus
		 * sign for positive values
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const plussedFrench = make(Options.Int.plussedFrench) as unknown as Type;
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
		export const inBasis = (id: string, regExp: RegExp, radix: number): Type =>
			_make({
				id,
				read: (input) =>
					pipe(
						input,
						MString.match(regExp),
						Option.map(
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
									message: `Could not read ${id} number from start of '${input}'`
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
		export const standard = make(Options.PositiveInt.standard) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a UK-style positive integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const uk = make(Options.PositiveInt.uk) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a German-style positive integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const german = make(Options.PositiveInt.german) as unknown as Type;

		/**
		 * Cached transformer instance that reads/writes a French-style positive integer
		 *
		 * @since 0.0.1
		 * @category Instances
		 */
		export const french = make(Options.PositiveInt.french) as unknown as Type;
	}
}
