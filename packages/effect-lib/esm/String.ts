/** A simple extension to the Effect String module */

import {
  Array,
  Equivalence,
  Function,
  Hash,
  Option,
  Order,
  Predicate,
  Record,
  String,
  Struct,
  Tuple,
  flow,
  pipe,
} from 'effect';
import * as MArray from './Array.js';
import * as MBigInt from './BigInt.js';
import * as MDataBase from './Data/Base.js';
import * as MDataEquivalenceBasedEquality from './Data/EquivalenceBasedEquality.js';
import * as MFunction from './Function.js';
import * as MMatch from './Match.js';
import * as MNumber from './Number.js';
import * as MPredicate from './Predicate.js';
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
  const _namespaceTag = `${moduleTag}SearchResult/`;
  const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
  type _TypeId = typeof _TypeId;

  /**
   * Type that represents a SearchResult
   *
   * @category Models
   */
  export class Type extends MDataEquivalenceBasedEquality.Class {
    /** The index where the match was found in the target string */
    readonly startIndex: number;
    /** The index of the character following the match in the target string */
    readonly endIndex: number;
    /** The match */
    readonly match: string;

    /** Class constructor */
    private constructor({ startIndex, endIndex, match }: MTypes.Data<Type>) {
      super();
      this.startIndex = startIndex;
      this.endIndex = endIndex;
      this.match = match;
    }

    /** Static constructor */
    static make(params: MTypes.Data<Type>): Type {
      return new Type(params);
    }

    /** Returns the `id` of `this` */
    [MDataBase.idSymbol](): string | (() => string) {
      return _namespaceTag;
    }

    /** Calculates the hash value of `this` */
    [Hash.symbol](): number {
      return 0;
    }

    /** Function that implements the equivalence of `this` and `that` */
    [MDataEquivalenceBasedEquality.isEquivalentToSymbol](this: this, that: this): boolean {
      return equivalence(this, that);
    }

    /** Predicate that returns true if `that` has the same type marker as `this` */
    [MDataEquivalenceBasedEquality.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
      return Predicate.hasProperty(that, _TypeId);
    }

    /** Returns the TypeMarker of the class */
    protected get [_TypeId](): _TypeId {
      return _TypeId;
    }
  }

  /**
   * Equivalence that considers two SearchResult's to be equivalent when all their fields are equal
   *
   * @category Equivalences
   */
  export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
    self.startIndex === that.startIndex
    && self.endIndex === that.endIndex
    && self.match === that.match;

  /**
   * Equivalence that considers two SearchResult's to be equivalent when they overlap
   *
   * @category Equivalences
   */
  export const areOverlapping: Equivalence.Equivalence<Type> = (self, that) =>
    self.endIndex >= that.startIndex && self.startIndex <= that.endIndex;

  /**
   * Constructor
   *
   * @category Constructors
   */
  export const make = (params: MTypes.Data<Type>): Type => Type.make(params);

  /**
   * SearchResult Order based on the startIndex
   *
   * @category Ordering
   */
  export const byStartIndex: Order.Order<Type> = Order.mapInput(
    Order.number,
    (self: Type) => self.startIndex,
  );

  /**
   * SearchResult Order based on the endIndex
   *
   * @category Ordering
   */
  export const byEndIndex: Order.Order<Type> = Order.mapInput(
    Order.number,
    (self: Type) => self.endIndex,
  );

  /**
   * SearchResult Order that gives precedence to the first longest SearchResult.
   *
   * @category Ordering
   */
  export const byLongestFirst: Order.Order<Type> = Order.combine(
    byStartIndex,
    Order.reverse(byEndIndex),
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
 * Builds a string from a primitive value other than `null` and `undefined`. For numbers and
 * bigints, base-10 conversion is assumed. We don't use the .toString() method for numbers because
 * it uses scientific notation for certain numbers
 *
 * @category Constructors
 */
export const fromNonNullablePrimitive = (u: MTypes.NonNullablePrimitive): string =>
  MTypes.isNumber(u) ? fromNumber(10)(u) : u.toString();

/**
 * Builds a string from a primitive value. `null` is converted to the string "null" and `undefined`
 * to the string "undefined". For numbers and bigints, base-10 conversion is assumed.
 *
 * @category Constructors
 */
export const fromPrimitive: MTypes.OneArgFunction<MTypes.Primitive, string> = flow(
  MMatch.make,
  MMatch.when(MTypes.isNotNullable, fromNonNullablePrimitive),
  MMatch.orElse((s) => (s === undefined ? 'undefined' : 'null')),
);

/**
 * Builds a string from an unknown value `u`. Calls fromPrimitive if `u` is a primitive value. Calls
 * `JSON.stringify` otherwise.
 *
 * @category Constructors
 */
export const fromUnknown = (u: unknown): string =>
  MTypes.isPrimitive(u) ? fromPrimitive(u) : JSON.stringify(u, null, 2);

/**
 * Builds a string from a number using the passed `radix`
 *
 * @category Constructors
 */
export const fromNumber =
  (radix?: number): MTypes.NumberToString =>
  (u) => {
    // If this condition is not respected, Javascript will use an exponent in the converted string
    if (radix !== 10 || (u >= 1e-6 && u < 1e21) || MNumber.isNotFinite(u)) return u.toString(radix);
    const integerPart = Math.trunc(u);
    const decimalPart = Math.trunc((u - integerPart) * 1e16);
    return (
      BigInt(integerPart).toString(10)
      + pipe(
        decimalPart,
        MBigInt.fromPrimitiveOrThrow,
        (b) => b.toString(10),
        String.padStart(16, '0'),
        trimEnd('0'),
        Option.liftPredicate(String.isNonEmpty),
        Option.map(prepend('.')),
        Option.getOrElse(MFunction.constEmptyString),
      )
    );
  };

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
        SearchResult.make({ startIndex: pos, endIndex: pos + regexp.length, match: regexp }),
      );
    }
    const target = self.slice(startIndex);
    regexp.lastIndex = 0;
    const result = regexp.exec(target);
    if (MTypes.isNull(result)) return Option.none();
    const offsetPos = startIndex + result.index;
    const [match] = result;
    return Option.some(
      SearchResult.make({ startIndex: offsetPos, endIndex: offsetPos + match.length, match }),
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
            toSecond: Struct.get('endIndex'),
          }),
        ),
      ),
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
        SearchResult.make({ startIndex: pos, endIndex: pos + regexp.length, match: regexp }),
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
      MFunction.flipDual(String.takeLeft)(self),
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
      Function.flip(String.slice)(self),
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
 * Same as String.trimStart but the character to remove can be specified. `charToRemove` must be a
 * one-character string
 *
 * @category Utils
 */
export const trimStart = (charToRemove: string): MTypes.StringTransformer =>
  flow(Array.dropWhile(MPredicate.strictEquals(charToRemove)), Array.join(''));

/**
 * Same as String.trimEnd but the character to remove can be specified. `charToRemove` must be a
 * one-character string
 *
 * @category Utils
 */
export const trimEnd = (charToRemove: string): MTypes.StringTransformer =>
  flow(
    Array.fromIterable,
    Array.reverse,
    Array.dropWhile(MPredicate.strictEquals(charToRemove)),
    Array.reverse,
    Array.join(''),
  );

/**
 * Enum that defines the padding position
 *
 * @category Models
 */
export enum FillPosition {
  Right = 0,
  Left = 1,
}

/**
 * FillPosition namespace
 *
 * @category Models
 */
export namespace FillPosition {
  /**
   * Builds the id of a FillPosition
   *
   * @category Destructors
   */
  export const toString: MTypes.OneArgFunction<FillPosition, string> = flow(
    MMatch.make,
    MMatch.whenIs(FillPosition.Right, Function.constant('right')),
    MMatch.whenIs(FillPosition.Left, Function.constant('left')),
    MMatch.exhaustive,
  );
}

/**
 * Pads a string to the left or to the right (depending on `fillPosition`) with up to `length`
 * characters `fillChar`. `length` should be a positive integer. `fillChar` should be a
 * one-character string. Does nothing if the string to pad has more than `length` characters.
 *
 * @category Utils
 */

export const pad = ({
  length,
  fillChar,
  fillPosition,
}: {
  readonly length: number;
  readonly fillChar: string;
  readonly fillPosition: FillPosition;
}): MTypes.OneArgFunction<string> =>
  pipe(
    fillPosition,
    MMatch.make,
    MMatch.whenIs(FillPosition.Left, () => String.padStart(length, fillChar)),
    MMatch.whenIs(FillPosition.Right, () => String.padEnd(length, fillChar)),
    MMatch.exhaustive,
  );

/**
 * Trims a string to the left or to the right (depending on `fillPosition`) from character
 * `fillChar`. If `disallowEmptyString` is true and the result of trimming is an empty string, the
 * fillChar is returned instead of an empty string. This is useful, for instance, if you have
 * numbers padded with 0's and you prefer the result of unpadding a string containing only 0's to be
 * '0' rather than an empty string. `fillChar` should be a one-character string. `length` should be
 * a positive integer.
 *
 * @category Utils
 */

export const trim = ({
  fillChar,
  fillPosition,
  disallowEmptyString,
}: {
  readonly fillChar: string;
  readonly fillPosition: FillPosition;
  readonly disallowEmptyString: boolean;
}): MTypes.OneArgFunction<string, string> =>
  flow(
    pipe(
      fillPosition,
      MMatch.make,
      MMatch.whenIs(FillPosition.Left, () => trimStart(fillChar)),
      MMatch.whenIs(FillPosition.Right, () => trimEnd(fillChar)),
      MMatch.exhaustive,
    ),
    MFunction.fIfTrue({
      condition: disallowEmptyString,
      f: flow(
        Option.liftPredicate(String.isNonEmpty),
        Option.getOrElse(Function.constant(fillChar)),
      ),
    }),
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
      Option.getOrElse(() => self),
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
      Option.getOrElse(() => self),
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
    self.slice(0, startIndex) + replacement + self.slice(endIndex);

/**
 * A slightly different version of match using RegExp.prototype.exec instead of
 * String.prototype.match. This function will always return only the first match, even if the `g`
 * flag is set. Also, it does not care for the lastIndex property of `regExp`. Good to use in a
 * library when you have no control over the RegExp you receive.
 *
 * @category Utils
 */
export const match =
  (regExp: RegExp) =>
  (self: string): Option.Option<string> => {
    regExp.lastIndex = 0;
    return pipe(
      self,
      RegExp.prototype.exec.bind(regExp),
      Option.fromNullable,
      Option.map(MArray.unsafeGet(0)),
    );
  };

/**
 * Returns `true` if `self` fulfills regExp. `false` otherwise. Does the same as
 * RegExp.prototype.test but does not take the g flag into account even if it is set and does not
 * care for the lastIndex property of `regExp`
 *
 * @category Utils
 */
export const matches = (regExp: RegExp): Predicate.Predicate<string> =>
  flow(match(regExp), Option.match({ onNone: Function.constFalse, onSome: Function.constTrue }));

/**
 * Same as String.match but handles capturing groups. Throws if the global flag of `regExp` is set
 * or if `regExp` does not contain the named groups `capturingGroupNames`.
 *
 * @category Destructors
 */
export const matchWithCapturingGroups =
  <const Names extends ReadonlyArray<string>>(regExp: RegExp, capturingGroupNames: Names) =>
  (
    self: string,
  ): Option.Option<{
    match: string;
    groups: {
      [k in keyof Names as [k] extends [number] ? Names[k] : never]: string;
    };
  }> => {
    if (regExp.global)
      throw new Error(
        `'matchWithCapturingGroups' was called with global regular expression '${regExp.source}'`,
      );
    return pipe(
      self,
      String.match(regExp),
      // RegExpExecArray extends from Array<string>. But this is a Typescript bug. When there are optional capturing groups, there can be some undefined elements. So let's make javascript and Typescript coherent.
      Option.map((matchArray) => {
        const { groups } = matchArray;
        if (
          groups === undefined
          || pipe(capturingGroupNames, Array.difference(Object.keys(groups)), Array.isNonEmptyArray)
        )
          throw new Error(
            `'matchWithCapturingGroups' was called with regular expression '${regExp.source}' that does not contain expected named capturing groups '${capturingGroupNames.join("', '")}'`,
          );
        return {
          match: matchArray[0],
          // Optional capturing groups can return an undefined value
          groups: pipe(
            groups,
            Record.map(flow(Option.fromNullable, Option.getOrElse(MFunction.constEmptyString))),
          ),
        } as never;
      }),
    );
  };

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
    Tuple.make(self.slice(0, n), self.slice(n));

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
  bitSize: number,
): MTypes.OneArgFunction<string, Array<string>> =>
  flow(
    MArray.unfoldNonEmpty(
      flow(
        splitAtFromRight(bitSize),
        Tuple.swap,
        Tuple.mapSecond(Option.liftPredicate(String.isNonEmpty)),
      ),
    ),
    Array.reverse,
  );

/**
 * Splits `self` in substrings of `bitSize` characters. The length of the last string, if any, is
 * comprised between 1 and `bitSize` characters. `bitSize` must be a strictly positive integer.
 *
 * @category Utils
 */
export const splitEquallyRestAtEnd = (
  bitSize: number,
): MTypes.OneArgFunction<string, MTypes.OverOne<string>> =>
  MArray.unfoldNonEmpty(
    flow(splitAt(bitSize), Tuple.mapSecond(Option.liftPredicate(String.isNonEmpty))),
  );

const _tabifyLineBreak: RegExp = new RegExp(MRegExpString.lineBreak, 'g');
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
    return tab + self.replace(_tabifyLineBreak, '$&' + tab);
  };

/**
 * Returns true if `self` contains at least an eol character
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

/**
 * Function that removes n chars every m chars starting from the right
 *
 * @category Utils
 */
export const removeNCharsEveryMCharsFromRight = ({
  m,
  n,
}: {
  readonly m: number;
  readonly n: number;
}): MTypes.StringTransformer =>
  n === 0 ?
    Function.identity
  : flow(splitEquallyRestAtStart(m + n), Array.map(String.takeRight(m)), Array.join(''));

/**
 * Returns true if a string represents a digit. False otherwise
 *
 * @category Predicates
 */

export const isDigit: Predicate.Predicate<string> = (self) => {
  const code = self.codePointAt(0);
  if (code === undefined || self.length > 1) return false;
  return code >= 48 && code <= 57;
};
