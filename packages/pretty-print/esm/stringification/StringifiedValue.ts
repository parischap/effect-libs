/**
 * This module implements a type that represents the output of the stringification process of a
 * value. It is a non-empty array of `ASText`'s (see `@parischap/ansi-styles`), where each element
 * represents one line of the stringified output. At least one line is always present, though that
 * line may be empty.
 */

import { flow } from 'effect';
import * as Array from 'effect/Array';
import type * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Number from 'effect/Number';
import * as Predicate from 'effect/Predicate';

import * as ASText from '@parischap/ansi-styles/ASText';
import * as MArray from '@parischap/effect-lib/MArray';
import * as MTypes from '@parischap/effect-lib/MTypes';

import type * as PPStringifiedProperties from '../internal/stringification/StringifiedProperties.js';

/**
 * Type that represents a PPStringifiedValue
 *
 * @category Models
 */
// Don't use an interface because it does not work with MArray.InferTail
export type Type = MTypes.OverOne<ASText.Type>;

/**
 * Equivalence for StringifiedValue's.
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = Array.makeEquivalence(ASText.equivalence);

/**
 * Wraps a single `ASText` into a one-line `PPStringifiedValue`
 *
 * @category Constructors
 */
export const fromText: MTypes.OneArgFunction<ASText.Type, Type> = Array.of;

/**
 * Collapses all lines of `self` into a single `ASText` by joining them with empty text
 *
 * @category Destructors
 */
export const toText: MTypes.OneArgFunction<Type, ASText.Type> = ASText.join(ASText.empty);

/**
 * Empty StringifiedValue instance
 *
 * @category Instances
 */
export const empty: Type = fromText(ASText.empty);

/**
 * Builds a `PPStringifiedValue` from a `PPStringifiedProperties` by collapsing each inner
 * `PPStringifiedValue` into a single line (joining its lines with empty text), then collecting
 * those single lines. Returns the `empty` instance when the input array is empty.
 *
 * @category Constructors
 */
export const fromJoinedStringifiedProperties: MTypes.OneArgFunction<
  PPStringifiedProperties.Type,
  Type
> = Array.match({ onEmpty: Function.constant(empty), onNonEmpty: Array.map(toText) });

/**
 * Builds a `PPStringifiedValue` from a `PPStringifiedProperties` by concatenating all lines of all
 * inner `PPStringifiedValue`'s into a flat array of lines. Returns the `empty` instance when the
 * input array is empty.
 *
 * @category Constructors
 */
export const fromFlattenedStringifiedProperties: MTypes.OneArgFunction<
  PPStringifiedProperties.Type,
  Type
> = Array.match({ onEmpty: Function.constant(empty), onNonEmpty: Array.flatten });

/**
 * Returns a single-line version of `self` by collapsing all lines into one (equivalent to calling
 * `toText` then `fromText`)
 *
 * @category Utils
 */
export const toSingleLine: MTypes.OneArgFunction<Type> = flow(toText, fromText);

/**
 * Returns `true` if `self` is empty.
 *
 * @category Predicates
 */
export const isEmpty: Predicate.Predicate<Type> = (self) =>
  MTypes.isSingleton(self) && ASText.isEmpty(self[0]);

/**
 * Returns `true` if `self` is not empty.
 *
 * @category Predicates
 */
export const isNotEmpty: Predicate.Predicate<Type> = Predicate.not(isEmpty);

/**
 * Returns a new `PPStringifiedValue` formed by appending all lines of `that` after all lines of
 * `self`
 *
 * @category Constructors
 */
export const concat =
  (that: ReadonlyArray<ASText.Type>) =>
  (self: Type): Type =>
    Array.appendAll(self, that);

/**
 * Returns the first line of `self`
 *
 * @category Destructors
 */
export const firstLine: MTypes.OneArgFunction<Type, ASText.Type> = Array.headNonEmpty;

/**
 * Returns the last line of `self`
 *
 * @category Destructors
 */
export const lastLine: MTypes.OneArgFunction<Type, ASText.Type> = Array.lastNonEmpty;

/**
 * Returns all lines of `self` but the last
 *
 * @category Destructors
 */
export const initLines: MTypes.OneArgFunction<
  Type,
  ReadonlyArray<ASText.Type>
> = Array.initNonEmpty;

/**
 * Returns all lines of `self` but the first
 *
 * @category Destructors
 */
export const tailLines: MTypes.OneArgFunction<
  Type,
  ReadonlyArray<ASText.Type>
> = Array.tailNonEmpty;

/**
 * Returns a copy of `self` with a new line at the end
 *
 * @category Utils
 */
export const addLineAfter = (
  line: ASText.Type,
): MTypes.OneArgFunction<ReadonlyArray<ASText.Type>, Type> => Array.append(line);

/**
 * Returns a copy of `self` with a new line at the start
 *
 * @category Utils
 */
export const addLineBefore = (
  line: ASText.Type,
): MTypes.OneArgFunction<ReadonlyArray<ASText.Type>, Type> => Array.prepend(line);

/**
 * Returns a copy of `self` in which `text` has been prepended to each line
 *
 * @category Utils
 */
export const prependToAllLines = (text: ASText.Type): MTypes.OneArgFunction<Type> =>
  Array.map(ASText.prepend(text));

/**
 * Returns a copy of `self` in which `text` has been appended to the last line
 *
 * @category Utils
 */
export const appendToLastLine = (text: ASText.Type): MTypes.OneArgFunction<Type> =>
  Array.modifyLastNonEmpty(ASText.append(text));

/**
 * Returns a copy of `self` in which `text` has been prepended to the first line
 *
 * @category Utils
 */
export const prependToFirstLine = (text: ASText.Type): MTypes.OneArgFunction<Type> =>
  Array.modifyHeadNonEmpty(ASText.prepend(text));

/**
 * Returns a copy of `self` in which `text` has been prepended to all lines but the first
 *
 * @category Utils
 */
export const prependToTailLines = (text: ASText.Type): MTypes.OneArgFunction<Type> =>
  MArray.modifyTail(ASText.prepend(text));

/**
 * Returns the length of `self`, i.e. the sum of the lengths of all the ASText instances
 * constituting `self`
 *
 * @category Destructors
 */
export const toLength: MTypes.OneArgFunction<Type, number> = flow(
  Array.map(ASText.toLength),
  Number.sumAll,
);

/**
 * Returns the ANSI string corresponding to `self`
 *
 * @category Destructors
 */
export const toAnsiString = (sep = ASText.lineBreak): MTypes.OneArgFunction<Type, string> =>
  flow(ASText.join(sep), ASText.toAnsiString);

/**
 * Returns the strings corresponding to `self` without any styling
 *
 * @category Destructors
 */
export const toUnstyledStrings: MTypes.OneArgFunction<Type, MTypes.OverOne<string>> = Array.map(
  ASText.toUnstyledString,
);
