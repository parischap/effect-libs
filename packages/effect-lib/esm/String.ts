/** A simple extension to the Effect String module */

import {
	Array,
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
import * as MCore from './Core.js';
import * as MFunction from './Function.js';
import * as MInspectable from './Inspectable.js';
import * as MMatch from './Match.js';
import * as MPipeable from './Pipeable.js';
import * as MRegExp from './RegExp.js';
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
	export const areOverlapping: Equivalence.Equivalence<Type> = (self: Type, that: Type) =>
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
	export const byStartIndex = Order.mapInput(Order.number, (self: Type) => self.startIndex);

	/**
	 * SearchResult Order based on the endIndex
	 *
	 * @category Ordering
	 */
	export const byEndIndex = Order.mapInput(Order.number, (self: Type) => self.endIndex);

	/**
	 * SearchResult Order that gives precedence to the first longest SearchResult.
	 *
	 * @category Ordering
	 */
	export const byLongestFirst = Order.combine(byStartIndex, Order.reverse(byEndIndex));

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
	(radix?: number) =>
	(u: number): string =>
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
	(regexp: RegExp | string) =>
	(self: string): string =>
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
	(regexp: RegExp | string) =>
	(self: string): string =>
		pipe(
			self,
			searchRight(regexp),
			Option.map((searchResult) => searchResult.endIndex),
			Option.getOrElse(Function.constant(0)),
			Function.flip(String.slice)(self)
		);

/**
 * Takes all characters from `self` except the `n` last characters
 *
 * @category Utils
 */
export const takeLeftBut =
	(n: number) =>
	(self: string): string =>
		String.takeLeft(self, self.length - n);

/**
 * Takes all characters from `self` except the `n` first characters
 *
 * @category Utils
 */
export const takeRightBut =
	(n: number) =>
	(self: string): string =>
		String.takeRight(self, self.length - n);

/**
 * Same as String.trimStart but the character to remove can be specified
 *
 * @category Utils
 */
export const trimStart = (charToRemove: string): ((self: string) => string) =>
	flow(Array.dropWhile(MFunction.strictEquals(charToRemove)), Array.join(''));

/**
 * Same as String.trimEnd but the character to remove can be specified
 *
 * @category Utils
 */
export const trimEnd = (charToRemove: string): ((self: string) => string) =>
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
export const stripLeftOption = (s: string): ((self: string) => Option.Option<string>) =>
	flow(Option.liftPredicate(String.startsWith(s)), Option.map(takeRightBut(s.length)));

/**
 * If `self` starts with `s`, returns `self` stripped of `s`. Otherwise, returns `self`
 *
 * @category Utils
 */
export const stripLeft =
	(s: string) =>
	(self: string): string =>
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
export const stripRightOption = (s: string): ((self: string) => Option.Option<string>) =>
	flow(Option.liftPredicate(String.endsWith(s)), Option.map(takeLeftBut(s.length)));

/**
 * If `self` ends with `s`, returns `self` stripped of `s`. Otherwise, returns `self`
 *
 * @category Utils
 */
export const stripRight =
	(s: string) =>
	(self: string): string =>
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
	(regexp: RegExp | string) =>
	(self: string): number =>
		pipe(self, searchAll(regexp), Array.length);

/**
 * Appends `s` to `self`
 *
 * @category Utils
 */
export const append = MCore.appendString;

/**
 * Prepends `s` to `self`
 *
 * @category Utils
 */
export const prepend = MCore.prependString;

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
	(replacement: string, startIndex: number, endIndex: number) => (self: string) =>
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
	(regExp: RegExp) =>
	(self: string): Option.Option<RegExpExecArray> =>
		pipe(regExp, MRegExp.matchAndGroups(self));

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
	(tabChar: string, count = 1) =>
	(self: string) => {
		const tab = tabChar.repeat(count);
		// replace resets RegExp.prototype.lastIndex after executing
		return tab + self.replace(MRegExp.globalLineBreak, '$&' + tab);
	};

/**
 * Returns true if `self` contains an eol character
 *
 * @category Utils
 */
export const isMultiLine = (self: string): boolean => MRegExp.lineBreak.test(self);

/**
 * Returns true if `self` is a SemVer
 *
 * @category Predicates
 */
export const isSemVer = (self: string): boolean => MRegExp.semVer.test(self);

/**
 * Returns true if `self` is an email
 *
 * @category Predicates
 */
export const isEmail = (self: string): boolean => MRegExp.email.test(self);

/**
 * Returns true if the length of `self` is `l`
 *
 * @category Predicates
 */
export const hasLength =
	(l: number) =>
	(self: string): boolean =>
		self.length === l;
