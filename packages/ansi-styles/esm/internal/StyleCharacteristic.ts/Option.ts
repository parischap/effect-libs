/**
 * Module that implements an option specific to style characteristics. If the option is a `none`,
 * the style characteristic is not present
 */

import { MTypes } from '@parischap/effect-lib';
import { Equivalence, Function, Option } from 'effect';

/**
 * Type of an Option
 *
 * @category Models
 */
export type Type<A> = Option.Option<A>;

/**
 * Builds a new Option by merging `self` and `that`. If `self` is a `some`, returns `self`.
 * Otherwise, returns `that`.
 *
 * @category Utils
 */
export const mergeUnder = <A>(that: Type<A>): MTypes.OneArgFunction<Type<A>, Type<A>> =>
  Option.orElse(Function.constant(that));

/**
 * Builds a new Option by substracting `that` from `self`. Returns a `none` if `self` and `that` are
 * equivalent. Returns `self` otherwise
 *
 * @category Utils
 */
export const difference =
  <A>(equivalence: Equivalence.Equivalence<Type<A>>) =>
  (that: Type<A>): MTypes.OneArgFunction<Type<A>, Type<A>> =>
  (self) =>
    equivalence(self, that) ? Option.none() : self;
