/**
 * Type that represents the output of the stringification process of a value. It is in fact an alias
 * for an array of ASText's (see Text.ts in @parischap/ansi-styles). Each elament of the array
 * represents a line of the stringified value. There must always be at least one line. But that line
 * may contain en empty text.
 */

import { ASText } from '@parischap/ansi-styles';
import { MArray, MTypes } from '@parischap/effect-lib';
import { Array, Equivalence, flow, Function, Number, pipe, Predicate } from 'effect';
import type * as PPStringifiedProperties from './StringifiedProperties.js';

/**
 * Type that represents a StringifiedValue
 *
 * @category Models
 */
export interface Type extends MTypes.OverOne<ASText.Type> {}

/**
 * Equivalence for StringifiedValue's.
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = Array.getEquivalence(ASText.equivalence);

/**
 * Builds a StringifiedValue from a Text
 *
 * @category Constructors
 */
export const fromText: MTypes.OneArgFunction<ASText.Type, Type> = Array.of;

/**
 * Empty StringifiedValue instance
 *
 * @category Instances
 */
export const empty: Type = pipe(ASText.empty, fromText);

/**
 * Builds a StringifiedValue from a StringifiedProperties
 *
 * @category Constructors
 */
export const fromStringifiedProperties: MTypes.OneArgFunction<PPStringifiedProperties.Type, Type> =
	Array.match({ onEmpty: Function.constant(empty), onNonEmpty: Array.flatten });

/**
 * Returns a single-line version of `self`
 *
 * @category Utils
 */
export const toSingleLine: MTypes.OneArgFunction<Type> = flow(ASText.join(ASText.empty), fromText);

/**
 * Returns `true` if `self` is empty.
 *
 * @category Predicates
 */
export const isEmpty: Predicate.Predicate<Type> = MArray.match012({
	onEmpty: Function.constTrue,
	onSingleton: ASText.isEmpty,
	onOverTwo: Function.constFalse
});

/**
 * Returns `true` if `self` is not empty.
 *
 * @category Predicates
 */
export const isNotEmpty: Predicate.Predicate<Type> = Predicate.not(isEmpty);

/**
 * Returns a copy of `self` with a new line at the end
 *
 * @category Utils
 */
export const addLineAfter = (line: ASText.Type): MTypes.OneArgFunction<Type> => Array.append(line);

/**
 * Returns a copy of `self` with a new line at the start
 *
 * @category Utils
 */
export const addLineBefore = (line: ASText.Type): MTypes.OneArgFunction<Type> =>
	Array.prepend(line);

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
	Array.modifyNonEmptyLast(ASText.append(text));

/**
 * Returns a copy of `self` in which `text` has been prepended to the first line
 *
 * @category Utils
 */
export const prependToFirstLine = (text: ASText.Type): MTypes.OneArgFunction<Type> =>
	Array.modifyNonEmptyHead(ASText.prepend(text));

/**
 * Returns a copy of `self` in which `text` has been prepended to all lines but the first
 *
 * @category Utils
 */
export const prependToTailLines = (text: ASText.Type): MTypes.OneArgFunction<Type> =>
	MArray.modifyTail(ASText.prepend(text));

/**
 * Returns the length of `self`
 *
 * @category Destructors
 */
export const toLength: MTypes.OneArgFunction<Type, number> = flow(
	Array.map(ASText.toLength),
	Number.sumAll
);

/**
 * Returns the ANSI string corresponding to `self`
 *
 * @category Destructors
 */
export const toAnsiString = (sep = ASText.lineBreak): MTypes.OneArgFunction<Type, string> =>
	flow(ASText.join(sep), ASText.toAnsiString);

/**
 * Returns the stringq corresponding to `self` without any styling
 *
 * @category Destructors
 */
export const toUnstyledStrings: MTypes.OneArgFunction<Type, MTypes.OverOne<string>> = Array.map(
	ASText.toUnstyledString
);
