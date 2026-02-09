/** This module implements a type that defines the padding position for a string */
import { flow, Function } from 'effect';
import * as MMatch from '../Match.js';
import * as MTypes from '../types/index.js';

/**
 * Type of an MStringFillPosistion
 *
 * @category Models
 */
export enum Type {
  Right = 0,
  Left = 1,
}

/**
 * Converts `self` to a string
 *
 * @category Destructors
 */
export const toString: MTypes.OneArgFunction<Type, string> = flow(
  MMatch.make,
  MMatch.whenIs(Type.Right, Function.constant('right')),
  MMatch.whenIs(Type.Left, Function.constant('left')),
  MMatch.exhaustive,
);
