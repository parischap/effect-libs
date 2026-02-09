/** This module defines the possible three-bit color offsets */

import { MMatch, MTypes } from '@parischap/effect-lib';
import { flow, Function } from 'effect';

/**
 * Type of an ASThreeBitColorOffset
 *
 * @category Models
 */
export enum Type {
  Black = 0,
  Red = 1,
  Green = 2,
  Yellow = 3,
  Blue = 4,
  Magenta = 5,
  Cyan = 6,
  White = 7,
}

/**
 * Converts `self` to a string
 *
 * @category Destructors
 */
export const toString: MTypes.OneArgFunction<Type, string> = flow(
  MMatch.make,
  flow(
    MMatch.whenIs(Type.Black, Function.constant('Black')),
    MMatch.whenIs(Type.Red, Function.constant('Red')),
    MMatch.whenIs(Type.Green, Function.constant('Green')),
    MMatch.whenIs(Type.Yellow, Function.constant('Yellow')),
    MMatch.whenIs(Type.Blue, Function.constant('Blue')),
    MMatch.whenIs(Type.Magenta, Function.constant('Magenta')),
    MMatch.whenIs(Type.Cyan, Function.constant('Cyan')),
    MMatch.whenIs(Type.White, Function.constant('White')),
  ),
  MMatch.exhaustive,
);
