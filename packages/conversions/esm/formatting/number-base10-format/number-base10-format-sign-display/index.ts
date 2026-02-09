/** This module implements a type that represents the possible sign display options */
import { MFunction, MMatch, MPredicate, MTypes } from '@parischap/effect-lib';
import { flow, Function } from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/conversions/formatting/number-base10-format/NumberBase10FormatSignDisplay/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a CVNumberBase10FormatSignDisplay
 *
 * @category Models
 */
export enum Type {
  /**
   * Formatting: sign display for negative numbers only, including negative zero.
   *
   * Parsing: conversion will fail if a positive sign is used.
   */
  Auto = 0,

  /**
   * Formatting: sign display for all numbers.
   *
   * Parsing: conversion will fail if no sign is present
   */
  Always = 1,

  /**
   * Formatting: sign display for positive and negative numbers, but not zero
   *
   * Parsing: conversion will fail if a sign is not present for a value other than 0 or if a sign is
   * present for 0.
   */
  ExceptZero = 2,

  /**
   * Formatting: sign display for negative numbers only, excluding negative zero.
   *
   * Parsing: conversion will fail if a positive sign is used or if a negative sign is used for 0.
   */
  Negative = 3,

  /**
   * Formatting: no sign display.
   *
   * Parsing: conversion will fail if any sign is present. The number will be treated as positive.
   */
  Never = 4,
}

/**
 * Builds a `Parser` implementing `self`
 *
 * @category Destructors
 */
export const toParser: MTypes.OneArgFunction<SignDisplay, Parser> = flow(
  MMatch.make,
  MMatch.whenIs(SignDisplay.Auto, Function.constant(hasNotPlusSign)),
  MMatch.whenIs(SignDisplay.Always, Function.constant(hasASign)),
  MMatch.whenIs(
    SignDisplay.ExceptZero,
    (): Parser =>
      flow(
        MMatch.make,
        MMatch.when(MPredicate.struct({ isZero: Function.identity }), hasNoSign),
        MMatch.orElse(hasASign),
      ),
  ),
  MMatch.whenIs(
    SignDisplay.Negative,
    (): Parser =>
      flow(
        MMatch.make,
        MMatch.when(MPredicate.struct({ isZero: Function.identity }), hasNoSign),
        MMatch.orElse(hasNotPlusSign),
      ),
  ),
  MMatch.whenIs(SignDisplay.Never, Function.constant(hasNoSign)),
  MMatch.exhaustive,
);

/**
 * Type of a SignDisplay Formatter
 *
 * @category Models
 */
export interface Formatter extends MTypes.OneArgFunction<
  { readonly sign: SignValue; readonly isZero: boolean },
  SignString
> {}

/**
 * Builds a `Formatter` implementing `self`
 *
 * @category Destructors
 */
export const toFormatter: MTypes.OneArgFunction<SignDisplay, Formatter> = flow(
  MMatch.make,
  MMatch.whenIs(
    SignDisplay.Auto,
    (): Formatter =>
      ({ sign }) =>
        sign === -1 ? '-' : '',
  ),
  MMatch.whenIs(
    SignDisplay.Always,
    (): Formatter =>
      ({ sign }) =>
        sign === -1 ? '-' : '+',
  ),
  MMatch.whenIs(
    SignDisplay.ExceptZero,
    (): Formatter =>
      ({ sign, isZero }) =>
        isZero ? ''
        : sign === -1 ? '-'
        : '+',
  ),
  MMatch.whenIs(
    SignDisplay.Negative,
    (): Formatter =>
      ({ sign, isZero }) =>
        isZero || sign === 1 ? '' : '-',
  ),
  MMatch.whenIs(SignDisplay.Never, (): Formatter => MFunction.constEmptyString),
  MMatch.exhaustive,
);
