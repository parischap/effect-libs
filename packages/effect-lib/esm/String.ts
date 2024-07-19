import { Array, Function, Option, Order, Predicate, String, Tuple, pipe } from 'effect';
import * as MFunction from './Function.js';
import * as MMatch from './Match.js';
import * as MTypes from './types.js';

//const moduleTag = '@parischap/effect-lib/String/';

class SearchResult {
	readonly startIndex: number;
	readonly endIndex: number;
	readonly match: string;

	constructor({ startIndex, endIndex, match }: MTypes.Data<SearchResult>) {
		this.startIndex = startIndex;
		this.endIndex = endIndex;
		this.match = match;
	}
}

export { type SearchResult };

export const searchResultByStartIndex = Order.mapInput(
	Order.number,
	(searchResult: SearchResult) => searchResult.startIndex
);
export const searchResultByEndIndex = Order.mapInput(
	Order.number,
	(searchResult: SearchResult) => searchResult.endIndex
);
export const searchResultByStartIndexAndReverseEndIndex = Order.combine(
	searchResultByStartIndex,
	Order.reverse(searchResultByEndIndex)
);

/*const overlappingSearchResult = (sR1: SearchResult, sR2: SearchResult) =>
	sR1.startIndex <= sR2.endIndex && sR1.endIndex >= sR2.startIndex;*/

/**
 * Constructor
 */

export const fromNonNullPrimitive = (u: MTypes.NonNullPrimitive): string => u.toString();

/**
 * Constructor
 */

export const fromPrimitive = (u: MTypes.Primitive): string =>
	pipe(
		u,
		MMatch.make,
		MMatch.when(MTypes.isNull, () => 'null'),
		MMatch.when(MTypes.isUndefined, () => 'undefined'),
		MMatch.orElse(fromNonNullPrimitive)
	);

/**
 * Same as search but returns a SearchResult. You can optionnally provide the index from which to start searching.
 */

export const search =
	(regexp: RegExp | string, startIndex = 0) =>
	(self: string): Option.Option<SearchResult> => {
		if (MTypes.isString(regexp)) {
			const pos = self.indexOf(regexp, startIndex);
			if (pos === -1) return Option.none();
			return Option.some(
				new SearchResult({ startIndex: pos, endIndex: pos + regexp.length, match: regexp })
			);
		}
		const target = self.slice(startIndex);
		const result = regexp.exec(target);
		if (MTypes.isNull(result)) return Option.none();
		const offsetPos = startIndex + result.index;
		const match = result[0];
		return Option.some(
			new SearchResult({ startIndex: offsetPos, endIndex: offsetPos + match.length, match })
		);
	};

/**
 * Finds all matches and, for each one, returns a SearchResult.
 */
export const searchAll =
	(regexp: RegExp | string) =>
	(self: string): Array<SearchResult> => {
		// eslint-disable-next-line functional/prefer-readonly-type -- To preserve refinements
		const result: Array<SearchResult> = [];
		let searchPos = 0;
		for (;;) {
			const searchResultOption = search(regexp, searchPos)(self);
			if (Option.isNone(searchResultOption)) break;
			const searchResult = searchResultOption.value;
			// eslint-disable-next-line functional/immutable-data,functional/no-expression-statements
			result.push(searchResult);
			// eslint-disable-next-line functional/no-expression-statements
			searchPos = searchResult.endIndex;
		}
		return result;
	};

/**
 * Same as search but returns the last matching pattern instead of the first. You can optionnally provide the index from which to start searching from right to left.
 */
export const searchRight =
	(regexp: RegExp | string, startIndex = +Infinity) =>
	(self: string): Option.Option<SearchResult> => {
		if (MTypes.isString(regexp)) {
			const pos = self.lastIndexOf(regexp, startIndex);
			if (pos === -1) return Option.none();
			return Option.some(
				new SearchResult({ startIndex: pos, endIndex: pos + regexp.length, match: regexp })
			);
		}
		return pipe(
			self,
			searchAll(regexp),
			Array.filter((searchResult) => searchResult.startIndex <= startIndex),
			Array.last
		);
	};

/**
 * Looks from the left for the first substring of self that matches regexp and returns all characters before that substring. If no occurence is found, returns self
 */
export const takeLeftTo =
	(regexp: RegExp | string) =>
	(self: string): string =>
		pipe(
			self,
			String.search(regexp),
			Option.getOrElse(() => self.length),
			(pos) => String.takeLeft(self, pos)
		);
/**
 * Looks from the right for the first substring of self that matches target and returns all characters after that substring. If no occurence is found, returns self.
 */
export const takeRightFrom =
	(regexp: RegExp | string) =>
	(self: string): string =>
		pipe(
			self,
			searchRight(regexp),
			Option.map((searchResult) => searchResult.endIndex),
			Option.getOrElse(() => 0),
			(pos) => String.slice(pos)(self)
		);
/**
 * Returns a some of the result of calling the toString method on obj provided it defines one different from Object.prototype.toString. If toString is not defined or not overloaded, it returns a some of the result of calling the toJSON function on obj provided it defines one. If toString and toJSON are not defined, returns a none.
 * @param obj
 * @returns
 */
export const tryToStringToJson = (obj: MTypes.AnyRecord): Option.Option<string> => {
	const tryApplyingFOnObj = (f: MTypes.AnyFunction) => {
		try {
			return pipe(f, Function.apply(obj), Option.liftPredicate(MTypes.isString));
		} catch (e) {
			return Option.none();
		}
	};

	return pipe(
		obj['toString'],
		// eslint-disable-next-line @typescript-eslint/unbound-method
		Option.liftPredicate(Predicate.not(MFunction.strictEquals(Object.prototype.toString))),
		Option.flatMap(tryApplyingFOnObj),
		Option.orElse(() =>
			pipe(
				obj['toJSON'],
				Option.liftPredicate(MTypes.isFunction),
				Option.flatMap(tryApplyingFOnObj)
			)
		)
	);
};

/**
 * Returns the provided `string` `that` if `self` is empty, otherwise returns `self`.
 *
 * @category error handling
 */
export const orElse =
	(that: Function.LazyArg<string>) =>
	(self: string): string =>
		String.isEmpty(self) ? that() : self;

/**
 * Takes all characters from self except the n last characters
 */
export const takeLeftBut =
	(n: number) =>
	(self: string): string =>
		String.takeLeft(self, self.length - n);

/**
 * Takes all characters from self except the n first characters
 */
export const takeRightBut =
	(n: number) =>
	(self: string): string =>
		String.takeRight(self, self.length - n);

/**
 * If self starts with s, returns self stripped of s. Otherwise, returns a none
 */
export const stripLeftOption =
	(s: string) =>
	(self: string): Option.Option<string> =>
		pipe(self, Option.liftPredicate(String.startsWith(s)), Option.map(takeRightBut(s.length)));

/**
 * If self starts with s, returns self stripped of s. Otherwise, returns s
 */
export const stripLeft =
	(s: string) =>
	(self: string): string =>
		pipe(
			self,
			stripLeftOption(s),
			Option.getOrElse(() => s)
		);

/**
 * If self ends with s, returns self stripped of s. Otherwise, returns a none
 */
export const stripRightOption =
	(s: string) =>
	(self: string): Option.Option<string> =>
		pipe(self, Option.liftPredicate(String.endsWith(s)), Option.map(takeLeftBut(s.length)));

/**
 * If self ends with s, returns self stripped of s. Otherwise, returns s
 */
export const stripRight =
	(s: string) =>
	(self: string): string =>
		pipe(
			self,
			stripRightOption(s),
			Option.getOrElse(() => s)
		);

/**
 * Counts the number of occurences of regexp in self.
 */
export const count =
	(regexp: RegExp | string) =>
	(self: string): number =>
		pipe(self, searchAll(regexp), Array.length);

/**
 * Adds a at the end of self
 */
export const append =
	(s: string) =>
	(self: string): string =>
		self + s;

/**
 * Adds a at the start of self
 */
export const prepend =
	(s: string) =>
	(self: string): string =>
		s + self;

/**
 * Replaces the text between startIndex included and endIndex excluded by replacement
 */
export const replaceBetween =
	(replacement: string, startIndex: number, endIndex: number) => (self: string) =>
		self.substring(0, startIndex) + replacement + self.substring(endIndex);

/**
 * A slightly different version of match using RegExp.prototype.exec instead of String.prototype.match because the result of the first does not depend on the g flag being set or not
 */
export const match =
	(regexp: RegExp) =>
	(self: string): Option.Option<RegExpExecArray> =>
		pipe(regexp.exec(self), Option.fromNullable);

/**
 * Splits a string in two parts at position n. The length of the first string is n (characters 0 to n-1).
 */
export const splitAt =
	(n: number) =>
	(self: string): [left: string, right: string] =>
		Tuple.make(self.substring(0, n), self.substring(n));
