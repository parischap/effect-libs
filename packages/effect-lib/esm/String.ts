/** A simple extension to the Effect String module */

import {
	Array,
	BigDecimal,
	Equal,
	Equivalence,
	Function,
	Hash,
	Inspectable,
	Option,
	Order,
	Pipeable,
	Predicate,
	String,
	Struct,
	Tuple,
	flow,
	pipe
} from 'effect';
import * as MArray from './Array.js';
import * as MBrand from './Brand.js';
import * as MFunction from './Function.js';
import { MBigDecimal } from './index.js';
import * as MInspectable from './Inspectable.js';
import * as MMatch from './Match.js';
import * as MPipeable from './Pipeable.js';
import * as MRegExp from './RegExp.js';
import * as MRegExpString from './RegExpString.js';
import * as MTuple from './Tuple.js';
import * as MTypes from './types.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/effect-lib/String/';

/**
 * This namespace implements a type that represents the result of the search of a string in another
 * string.
 *
 * @category Models
 */
export namespace SearchResult {
	const namespaceTag = moduleTag + 'SearchResult/';
	const _TypeId: unique symbol = Symbol.for(namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;

	/**
	 * Interface that represents a SearchResult
	 *
	 * @category Models
	 */
	export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
		/** The index where the match was found in the target string */
		readonly startIndex: number;
		/** The index of the character following the match in the target string */
		readonly endIndex: number;
		/** The match */
		readonly match: string;
		/** @internal */
		readonly [_TypeId]: _TypeId;
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

	/**
	 * Equivalence
	 *
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
		that.startIndex === self.startIndex &&
		that.endIndex === self.endIndex &&
		that.match === self.match;

	/**
	 * Equivalence that considers two SearchResult's to be equivalent when they overlap
	 *
	 * @since 0.0.6 Equivalence
	 */
	export const areOverlapping: Equivalence.Equivalence<Type> = (self, that) =>
		self.endIndex >= that.startIndex && self.startIndex <= that.endIndex;

	/** Prototype */
	const _TypeIdHash = Hash.hash(_TypeId);
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: _TypeId,
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return pipe(
				this.startIndex,
				Hash.hash,
				Hash.combine(Hash.hash(this.endIndex)),
				Hash.combine(Hash.hash(this.match)),
				Hash.combine(_TypeIdHash),
				Hash.cached(this)
			);
		},
		...MInspectable.BaseProto(namespaceTag),
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
	 * SearchResult Order based on the startIndex
	 *
	 * @category Ordering
	 */
	export const byStartIndex: Order.Order<Type> = Order.mapInput(
		Order.number,
		(self: Type) => self.startIndex
	);

	/**
	 * SearchResult Order based on the endIndex
	 *
	 * @category Ordering
	 */
	export const byEndIndex: Order.Order<Type> = Order.mapInput(
		Order.number,
		(self: Type) => self.endIndex
	);

	/**
	 * SearchResult Order that gives precedence to the first longest SearchResult.
	 *
	 * @category Ordering
	 */
	export const byLongestFirst: Order.Order<Type> = Order.combine(
		byStartIndex,
		Order.reverse(byEndIndex)
	);

	/**
	 * Returns the `startIndex` property of `self`
	 *
	 * @category Destructors
	 */
	export const startIndex: MTypes.OneArgFunction<Type, number> = Struct.get('startIndex');

	/**
	 * Returns the `endIndex` property of `self`
	 *
	 * @category Destructors
	 */
	export const endIndex: MTypes.OneArgFunction<Type, number> = Struct.get('endIndex');

	/**
	 * Returns the `match` property of `self`
	 *
	 * @category Destructors
	 */
	export const match: MTypes.OneArgFunction<Type, string> = Struct.get('match');
}

/**
 * Builds a string from a primitive value other than `null` and `undefined`.
 *
 * @category Constructors
 */
export const fromNonNullablePrimitive = (u: MTypes.NonNullablePrimitive): string => u.toString();

/**
 * Builds a string from a primitive value. `null` is converted to the string "null" and `undefined`
 * to the string "undefined"
 *
 * @category Constructors
 */
export const fromPrimitive: MTypes.OneArgFunction<MTypes.Primitive, string> = flow(
	MMatch.make,
	MMatch.when(MTypes.isNotNullable, fromNonNullablePrimitive),
	MMatch.orElse((s) => `${s}`)
);

/**
 * Builds a string from a number using the passed `radix`.
 *
 * @category Constructors
 */
export const fromNumber =
	(radix?: number): MTypes.NumberToString =>
	(u) =>
		u.toString(radix);

/**
 * Searches for the first occurence of `regexp` in `self` and returns a SearchResult. You can
 * optionnally provide the index from which to start searching. 'g' flag needs not be set if you
 * pass a regular expression. As opposed to String.search, regexp special characters need not be
 * escaped when passing a string regexp
 *
 * @category Utils
 */
export const search =
	(regexp: RegExp | string, startIndex = 0) =>
	(self: string): Option.Option<SearchResult.Type> => {
		if (MTypes.isString(regexp)) {
			const pos = self.indexOf(regexp, startIndex);
			if (pos === -1) return Option.none();
			return Option.some(
				SearchResult.make({ startIndex: pos, endIndex: pos + regexp.length, match: regexp })
			);
		}
		const target = self.slice(startIndex);
		/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
		regexp.lastIndex = 0;
		const result = regexp.exec(target);
		if (MTypes.isNull(result)) return Option.none();
		const offsetPos = startIndex + result.index;
		const match = result[0];
		return Option.some(
			SearchResult.make({ startIndex: offsetPos, endIndex: offsetPos + match.length, match })
		);
	};

/**
 * Searches for all occurences of `regexp` in `self` and returns an array of SearchResults. 'g' flag
 * needs not be set if you pass a regular expression.
 *
 * @category Utils
 */
export const searchAll =
	(regexp: RegExp | string) =>
	(self: string): Array<SearchResult.Type> =>
		Array.unfold(0, (pos) =>
			pipe(
				self,
				search(regexp, pos),
				Option.map(
					MTuple.makeBothBy({
						toFirst: Function.identity,
						toSecond: Struct.get('endIndex')
					})
				)
			)
		);

/**
 * Searches for the last occurence of `regexp` in `self` and returns a SearchResult. 'g' flag needs
 * not be set if you pass a regular expression.
 *
 * @category Utils
 */
export const searchRight =
	(regexp: RegExp | string) =>
	(self: string): Option.Option<SearchResult.Type> => {
		if (MTypes.isString(regexp)) {
			const pos = self.lastIndexOf(regexp);
			if (pos === -1) return Option.none();
			return Option.some(
				SearchResult.make({ startIndex: pos, endIndex: pos + regexp.length, match: regexp })
			);
		}
		return pipe(self, searchAll(regexp), Array.last);
	};

/**
 * Looks from the left for the first substring of `self` that matches `regexp` and returns all
 * characters before that substring. If no occurence is found, returns `self`. 'g' flag has no
 * incidence if you pass a regular expression.
 *
 * @category Utils
 */
export const takeLeftTo =
	(regexp: RegExp | string): MTypes.StringTransformer =>
	(self) =>
		pipe(
			self,
			search(regexp),
			Option.map(SearchResult.startIndex),
			Option.getOrElse(() => self.length),
			MFunction.flipDual(String.takeLeft)(self)
		);

/**
 * Looks from the right for the first substring of `self` that matches `regexp` and returns all
 * characters after that substring. If no occurence is found, returns `self`. 'g' flag needs not be
 * set if you pass a regular expression.
 *
 * @category Utils
 */
export const takeRightFrom =
	(regexp: RegExp | string): MTypes.StringTransformer =>
	(self) =>
		pipe(
			self,
			searchRight(regexp),
			Option.map((searchResult) => searchResult.endIndex),
			Option.getOrElse(() => 0),
			Function.flip(String.slice)(self)
		);

/**
 * Takes all characters from `self` except the `n` last characters
 *
 * @category Utils
 */
export const takeLeftBut =
	(n: number): MTypes.StringTransformer =>
	(self) =>
		String.takeLeft(self, self.length - n);

/**
 * Takes all characters from `self` except the `n` first characters
 *
 * @category Utils
 */
export const takeRightBut =
	(n: number): MTypes.StringTransformer =>
	(self) =>
		String.takeRight(self, self.length - n);

/**
 * Same as String.trimStart but the character to remove can be specified
 *
 * @category Utils
 */
export const trimStart = (charToRemove: string): MTypes.StringTransformer =>
	flow(Array.dropWhile(MFunction.strictEquals(charToRemove)), Array.join(''));

/**
 * Same as String.trimEnd but the character to remove can be specified
 *
 * @category Utils
 */
export const trimEnd = (charToRemove: string): MTypes.StringTransformer =>
	flow(
		Array.fromIterable,
		Array.reverse,
		Array.dropWhile(MFunction.strictEquals(charToRemove)),
		Array.reverse,
		Array.join('')
	);

/**
 * If `self` starts with `s`, returns a some of `self` stripped of `s`. Otherwise, returns a none
 *
 * @category Utils
 */
export const stripLeftOption = (s: string): MTypes.OneArgFunction<string, Option.Option<string>> =>
	flow(Option.liftPredicate(String.startsWith(s)), Option.map(takeRightBut(s.length)));

/**
 * If `self` starts with `s`, returns `self` stripped of `s`. Otherwise, returns `self`
 *
 * @category Utils
 */
export const stripLeft =
	(s: string): MTypes.StringTransformer =>
	(self) =>
		pipe(
			self,
			stripLeftOption(s),
			Option.getOrElse(() => self)
		);

/**
 * If `self` ends with `s`, returns a some of `self` stripped of `s`. Otherwise, returns a none
 *
 * @category Utils
 */
export const stripRightOption = (s: string): MTypes.OneArgFunction<string, Option.Option<string>> =>
	flow(Option.liftPredicate(String.endsWith(s)), Option.map(takeLeftBut(s.length)));

/**
 * If `self` ends with `s`, returns `self` stripped of `s`. Otherwise, returns `self`
 *
 * @category Utils
 */
export const stripRight =
	(s: string): MTypes.StringTransformer =>
	(self) =>
		pipe(
			self,
			stripRightOption(s),
			Option.getOrElse(() => self)
		);

/**
 * Returns the number of occurences of `regexp` in `self`
 *
 * @category Utils
 */

export const count =
	(regexp: RegExp | string): MTypes.NumberFromString =>
	(self) =>
		pipe(self, searchAll(regexp), Array.length);

/**
 * Appends `s` to `self`
 *
 * @category Utils
 */
export const append =
	(s: string): MTypes.StringTransformer =>
	(self) =>
		self + s;

/**
 * Prepends `s` to `self`
 *
 * @category Utils
 */
export const prepend =
	(s: string): MTypes.StringTransformer =>
	(self) =>
		s + self;

/**
 * Replaces the part of `self` between `startIndex` included and `endIndex` excluded by
 * `replacement`. If `startIndex` equals `endIndex`, `replacement` is inserted at `startIndex`. If
 * `startIndex` is strictly greater than `endIndex`, the part between `endIndex` and `startIndex`
 * will be present before and after the replacement. If `startIndex` is strictly less than 0, it is
 * taken equal to 0. Same for `endIndex`. If `startIndex` or strisctly superior to the length of
 * `self`, it is taken equal to the length of `self`. Same
 *
 * @category Utils
 */
export const replaceBetween =
	(replacement: string, startIndex: number, endIndex: number): MTypes.StringTransformer =>
	(self) =>
		self.substring(0, startIndex) + replacement + self.substring(endIndex);

/**
 * A slightly different version of match using RegExp.prototype.exec instead of
 * String.prototype.match. This function will always return only the first match, even if the `g`
 * flag is set. Good to use in a library when you have no control over the RegExp you receive.
 *
 * @category Utils
 */
export const match =
	(regExp: RegExp) =>
	(self: string): Option.Option<string> =>
		pipe(regExp, MRegExp.match(self));

/**
 * Same as match but also returns capturing groups.
 *
 * @category Destructors
 */
export const matchAndGroups =
	<N extends number>(regExp: RegExp, capturingGroupNumber: N) =>
	(self: string): Option.Option<[match: string, capturingGroups: MTypes.Tuple<string, N>]> =>
		pipe(regExp, MRegExp.matchAndGroups(self, capturingGroupNumber));

/**
 * Same as matchAndGroups but returns only the captured groups.
 *
 * @category Destructors
 */
export const capturedGroups =
	<N extends number>(regExp: RegExp, capturingGroupNumber: N) =>
	(self: string): Option.Option<MTypes.Tuple<string, N>> =>
		pipe(regExp, MRegExp.capturedGroups(self, capturingGroupNumber));

/**
 * Splits `self` in two parts at position `n`. The length of the first string is `n` (characters `0`
 * to `n-1`). If `n` is strictly less than 0, it is taken equal to 0. If `n` is greater than the
 * length of `self`, it is taken equal to the length of self.
 *
 * @category Utils
 */
export const splitAt =
	(n: number) =>
	(self: string): [left: string, right: string] =>
		Tuple.make(self.substring(0, n), self.substring(n));

/**
 * Splits `self` in two parts at position `n` from the end of `self`. The length of the second
 * string is `n`. If `n` is strictly less than 0, it is taken equal to 0. If `n` is greater than the
 * length of `self`, it is taken equal to the length of self.
 *
 * @category Utils
 */
export const splitAtFromRight =
	(n: number) =>
	(self: string): [left: string, right: string] =>
		pipe(self, splitAt(self.length - n));

/**
 * Splits `self` in substrings of `bitSize` characters. The length of the first string, if any, is
 * comprised between 1 and `bitSize` characters. `bitSize` must be a strictly positive integer.
 *
 * @category Utils
 */
export const splitEquallyRestAtStart = (
	bitSize: number
): MTypes.OneArgFunction<string, Array<string>> =>
	flow(
		MArray.unfoldNonEmpty(
			flow(
				splitAtFromRight(bitSize),
				Tuple.swap,
				Tuple.mapSecond(Option.liftPredicate(String.isNonEmpty))
			)
		),
		Array.reverse
	);

/**
 * Splits `self` in substrings of `bitSize` characters. The length of the last string, if any, is
 * comprised between 1 and `bitSize` characters. `bitSize` must be a strictly positive integer.
 *
 * @category Utils
 */
export const splitEquallyRestAtEnd = (
	bitSize: number
): MTypes.OneArgFunction<string, MTypes.OverOne<string>> =>
	MArray.unfoldNonEmpty(
		flow(splitAt(bitSize), Tuple.mapSecond(Option.liftPredicate(String.isNonEmpty)))
	);

/**
 * Adds string `tabChar` `count` times at the beginning of each new line of `self`
 *
 * @category Utils
 */
export const tabify =
	(tabChar: string, count = 1): MTypes.StringTransformer =>
	(self) => {
		const tab = tabChar.repeat(count);
		// replace resets RegExp.prototype.lastIndex after executing
		return tab + self.replace(MRegExp.globalLineBreak, '$&' + tab);
	};

/**
 * Returns true if `self` contains an eol character
 *
 * @category Utils
 */
export const isMultiLine: Predicate.Predicate<string> = (self) => MRegExp.lineBreak.test(self);

/**
 * Returns true if `self` is a SemVer
 *
 * @category Predicates
 */
export const isSemVer: Predicate.Predicate<string> = (self) => MRegExp.semVer.test(self);

/**
 * Returns true if `self` is an email
 *
 * @category Predicates
 */
export const isEmail: Predicate.Predicate<string> = (self) => MRegExp.email.test(self);

/**
 * Returns true if the length of `self` is `l`
 *
 * @category Predicates
 */
export const hasLength =
	(l: number): Predicate.Predicate<string> =>
	(self) =>
		self.length === l;

/** Function that removes the thousand separator from a string representing an unsigned integer */
const _removeThousandSeparator = (thousandSeparator: string): MTypes.StringTransformer =>
	thousandSeparator === '' ?
		Function.identity
	:	flow(
			splitEquallyRestAtStart(MRegExpString.DIGIT_GROUP_SIZE + thousandSeparator.length),
			Array.map(String.takeRight(MRegExpString.DIGIT_GROUP_SIZE)),
			Array.join('')
		);
/**
 * Returns a `some` of a positive integer if `self` represents an unsigned base 10 number using
 * `thousandSeparator` as thousand separator. Returns a `none` otherwise.
 *
 * @category Destructors
 */

export const unsignedBase10IntToNumber = (
	thousandSeparator: string
): MTypes.OneArgFunction<string, Option.Option<MBrand.PositiveInt.Type>> => {
	const getValidatedString = pipe(
		thousandSeparator,
		MRegExpString.unsignedBase10Int,
		MRegExpString.makeLine,
		RegExp,
		match
	);

	const removeThousandSeparator = _removeThousandSeparator(thousandSeparator);

	return flow(
		getValidatedString,
		Option.map(flow(removeThousandSeparator, Number, MBrand.PositiveInt.unsafeFromNumber))
	);
};

/**
 * Analyzes a string representing a number and returns a tuple containing:
 *
 * - `sign`: if the parameter string is signed, a `some` of the multiplicand that represents that sign
 *   (`+1` for '+' and `-1` for '-'). Otherwise, a `none`.
 * - `mantissa`: the mantissa expressed as a BigDecimal
 * - `exponent`: the exponent expressed as a number (an integer in fact)
 * - `mantissaFractionalPartLength`: the length of the fractional part of the mantissa in the string
 *   parameter omitting the length of the fractional separator (e.g. 2 for '52.00')
 *
 * The parameters to provide are:
 *
 * - `thousandSeparator`: Usually a string made of at most one character but not mandatory. Should be
 *   different from `fractionalSeparator`. Will not throw otherwise but unexpected results might
 *   occur. Use '' for no thousand separator.
 * - `fractionalSeparator`: usually a one-character string but not mandatory (e.g. '.'). Should not be
 *   an empty string and be different from `thousandSeparator`. Will not throw otherwise but
 *   unexpected results might occur.
 * - `eNotationChars`: array of possible chracters that can be used to represent an exponent (e.g.
 *   value: ['E', 'e']).
 * - `self`: the string representing the number to split
 *
 * @category Destructors
 */
export const toNumberParts = (params: {
	readonly thousandSeparator: string;
	readonly fractionalSeparator: string;
	readonly eNotationChars: ReadonlyArray<string>;
}): MTypes.OneArgFunction<
	string,
	Option.Option<
		[
			sign: Option.Option<1 | -1>,
			mantissa: BigDecimal.BigDecimal,
			exponent: number,
			mantissaFractionalPartLength: number
		]
	>
> => {
	const removeThousandSeparator = _removeThousandSeparator(params.thousandSeparator);
	const getParts = capturedGroups(
		pipe(params, MRegExpString.base10Number, MRegExpString.makeLine, RegExp),
		4
	);
	const fractionalSeparatorLength = params.fractionalSeparator.length;

	return (self) =>
		Option.gen(function* () {
			const [signPart, mantissaIntegerPart, mantissaFractionalPart, exponentPart] =
				yield* getParts(self);

			const mantissaFractionalPartLength =
				mantissaFractionalPart.length - fractionalSeparatorLength;

			const mantissaFractionalPartOption = pipe(
				mantissaFractionalPart,
				Option.liftPredicate(String.isNonEmpty),
				Option.map(
					flow(
						String.substring(fractionalSeparatorLength),
						MBigDecimal.unsafeFromIntString(mantissaFractionalPartLength)
					)
				)
			);

			const mantissa = yield* pipe(
				mantissaIntegerPart,
				Option.liftPredicate(String.isNonEmpty),
				Option.map(flow(removeThousandSeparator, MBigDecimal.unsafeFromIntString(0))),
				Option.match({
					onNone: Function.constant(mantissaFractionalPartOption),
					onSome: flow(
						BigDecimal.sum(
							Option.getOrElse(mantissaFractionalPartOption, Function.constant(MBigDecimal.zero))
						),
						Option.some
					)
				})
			);

			const sign = pipe(
				signPart,
				Option.liftPredicate(String.isNonEmpty),
				Option.map(
					flow(
						MMatch.make,
						MMatch.whenIs('+', Function.constant(1 as const)),
						MMatch.orElse(Function.constant(-1 as const))
					)
				)
			);

			return Tuple.make(sign, mantissa, +exponentPart, mantissaFractionalPartLength);
		});
};
