/**
 * A simple extension to the Effect String module
 *
 * @since 0.0.6
 */

import { Array, Option, Predicate, String, Tuple, flow, pipe } from 'effect';
import * as MFunction from './Function.js';
import * as MMatch from './Match.js';
import * as SearchResult from './SearchResult.js';
import * as MTypes from './types.js';

//const moduleTag = '@parischap/effect-lib/String/';

/*const areOverlappingSearchResults = (sR1: SearchResult, sR2: SearchResult) =>
	sR1.startIndex <= sR2.endIndex && sR1.endIndex >= sR2.startIndex;*/

/**
 * Builds a string from a primitive value other than `null` and `undefined`. and `a`
 *
 * @since 0.0.6
 * @category Constructors
 */
export const fromNonNullablePrimitive = (u: MTypes.NonNullablePrimitive): string => u.toString();

/**
 * Builds a string from a primitive value.
 *
 * @since 0.0.6
 * @category Constructors
 */
export const fromPrimitive = (u: MTypes.Primitive): string =>
	pipe(
		u,
		MMatch.make,
		MMatch.when(MTypes.isNull, () => 'null'),
		MMatch.when(MTypes.isUndefined, () => 'undefined'),
		MMatch.orElse(fromNonNullablePrimitive)
	);

/**
 * Searches for the first occurence of `regexp` in `self` and returns a SearchResult. You can
 * optionnally provide the index from which to start searching.
 *
 * @since 0.0.6
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
		const result = regexp.exec(target);
		if (MTypes.isNull(result)) return Option.none();
		const offsetPos = startIndex + result.index;
		const match = result[0];
		return Option.some(
			SearchResult.make({ startIndex: offsetPos, endIndex: offsetPos + match.length, match })
		);
	};

/**
 * Searches for all occurences of `regexp` in `self` and returns an array of SearchResults.
 *
 * @since 0.0.6
 * @category Utils
 */
export const searchAll =
	(regexp: RegExp | string) =>
	(self: string): Array<SearchResult.Type> => {
		/* eslint-disable-next-line functional/prefer-readonly-type -- To preserve refinements */
		const result: Array<SearchResult.Type> = [];
		let searchPos = 0;
		for (;;) {
			const searchResultOption = search(regexp, searchPos)(self);
			if (Option.isNone(searchResultOption)) break;
			const searchResult = searchResultOption.value;
			/* eslint-disable-next-line functional/immutable-data,functional/no-expression-statements */
			result.push(searchResult);
			/* eslint-disable-next-line functional/no-expression-statements */
			searchPos = searchResult.endIndex;
		}
		return result;
	};

/**
 * Searches for the last occurence of `regexp` in `self` and returns a SearchResult.
 *
 * @since 0.0.6
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
 * characters before that substring. If no occurence is found, returns `self`
 *
 * @since 0.0.6
 * @category Utils
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
 * Looks from the right for the first substring of `self` that matches `regexp` and returns all
 * characters after that substring. If no occurence is found, returns `self`.
 *
 * @since 0.0.6
 * @category Utils
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
 * Returns a some of the result of calling the toString method on obj provided it defines one
 * different from Object.prototype.toString. If toString is not defined or not overloaded, it
 * returns a some of the result of calling the toJSON function on obj provided it defines one.
 * Otherwise, it returns a none.
 *
 * @since 0.0.6
 * @category Utils
 */
export const tryToStringToJSON = (obj: MTypes.AnyRecord): Option.Option<string> => {
	const tryApplyingFOnObj = (f: MTypes.AnyFunction) =>
		pipe(
			f,
			Option.liftPredicate(flow(MFunction.parameterNumber, MFunction.strictEquals(0))),
			Option.map(MFunction.applyAsMethod(obj)),
			Option.filter(MTypes.isString)
		);

	return pipe(
		obj['toString'],
		Option.liftPredicate(
			Predicate.and(
				MTypes.isFunction,
				/* eslint-disable-next-line @typescript-eslint/unbound-method */
				Predicate.not(MFunction.strictEquals(Object.prototype.toString))
			)
		),
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
 * Takes all characters from `self` except the `n` last characters
 *
 * @since 0.0.6
 * @category Utils
 */
export const takeLeftBut =
	(n: number) =>
	(self: string): string =>
		String.takeLeft(self, self.length - n);

/**
 * Takes all characters from `self` except the `n` first characters
 *
 * @since 0.0.6
 * @category Utils
 */
export const takeRightBut =
	(n: number) =>
	(self: string): string =>
		String.takeRight(self, self.length - n);

/**
 * If `self` starts with `s`, returns a some of `self` stripped of `s`. Otherwise, returns a none
 *
 * @since 0.0.6
 * @category Utils
 */
export const stripLeftOption = (s: string): ((self: string) => Option.Option<string>) =>
	flow(Option.liftPredicate(String.startsWith(s)), Option.map(takeRightBut(s.length)));

/**
 * If `self` starts with `s`, returns `self` stripped of `s`. Otherwise, returns `self`
 *
 * @since 0.0.6
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
 * @since 0.0.6
 * @category Utils
 */
export const stripRightOption = (s: string): ((self: string) => Option.Option<string>) =>
	flow(Option.liftPredicate(String.endsWith(s)), Option.map(takeLeftBut(s.length)));

/**
 * If `self` ends with `s`, returns `self` stripped of `s`. Otherwise, returns `self`
 *
 * @since 0.0.6
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
 * @since 0.0.6
 * @category Utils
 */

export const count =
	(regexp: RegExp | string) =>
	(self: string): number =>
		pipe(self, searchAll(regexp), Array.length);

/**
 * Appends `s` to `self`
 *
 * @since 0.0.6
 * @category Utils
 */
export const append =
	(s: string) =>
	(self: string): string =>
		self + s;

/**
 * Prepends `s` to `self`
 *
 * @since 0.0.6
 * @category Utils
 */
export const prepend =
	(s: string) =>
	(self: string): string =>
		s + self;

/**
 * Replaces the part of `self` between `startIndex` included and `endIndex` excluded by
 * `replacement`. If `startIndex` equals `endIndex`, `replacement` is inserted at `startIndex`. If
 * `startIndex` is strictly greater than `endIndex`, the part between `endIndex` and `startIndex`
 * will be present before and after the replacement. If `startIndex` is strictly less than 0, it is
 * taken equal to 0. Same for `endIndex`. If `startIndex` or strisctly superior to the length of
 * `self`, it is taken equal to the length of `self`. Same
 *
 * @since 0.0.6
 * @category Utils
 */
export const replaceBetween =
	(replacement: string, startIndex: number, endIndex: number) => (self: string) =>
		self.substring(0, startIndex) + replacement + self.substring(endIndex);

/**
 * A slightly different version of match using RegExp.prototype.exec instead of
 * String.prototype.match. This function will always return only the first match, even if the `g`
 * flag is set.
 *
 * @since 0.0.6
 * @category Utils
 */
export const match =
	(regexp: RegExp) =>
	(self: string): Option.Option<RegExpExecArray> =>
		pipe(regexp.exec(self), Option.fromNullable);

/**
 * Splits `self` in two parts at position `n`. The length of the first string is `n` (characters `0`
 * to `n-1`). If `n` is strictly less than 0, it is taken equal to 0. If `n` is greater than the
 * length of `self`, it is taken equal to the length of self.
 *
 * @since 0.0.6
 * @category Utils
 */
export const splitAt =
	(n: number) =>
	(self: string): [left: string, right: string] =>
		Tuple.make(self.substring(0, n), self.substring(n));
