/**
 * Type that represents the output of the stringification process of a value. It is in fact an alias
 * for an array of ASText's (see Text.ts in @parischap/ansi-styles). Each elament of the array
 * represents a line of the stringified value. There must always be at least one line. But that line
 * may contain en empty text.
 */

import { ASText } from '@parischap/ansi-styles';
import { MArray, MTypes } from '@parischap/effect-lib';
import { Array, flow, Function, pipe, Predicate } from 'effect';
import type * as PPStringifiedProperties from './StringifiedProperties.js';

/**
 * Type that represents a Stringified
 *
 * @category Models
 */
export interface Type extends MTypes.OverOne<ASText.Type> {}

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
 * Returns a copy of `self` with a mark at the start
 *
 * @category Utils
 */
export const addEndMark = (mark: ASText.Type): MTypes.OneArgFunction<Type> => Array.append(mark);

/**
 * Returns a copy of `self` with a mark at the end
 *
 * @category Utils
 */
export const addStartMark = (mark: ASText.Type): MTypes.OneArgFunction<Type> => Array.prepend(mark);
