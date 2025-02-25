/** This module implements a Type that represents an array of Style's (see Style.ts). */

import { MTypes } from '@parischap/effect-lib';
import { Array, flow } from 'effect';
import * as ASStyle from './Style.js';

/**
 * Type that represents an array of Style's.
 *
 * @category Models
 */
export type Type = MTypes.OverTwo<ASStyle.Type>;

/**
 * Gets the id of `self`
 *
 * @category Destructors
 */
export const toId: MTypes.OneArgFunction<Type, string> = flow(
	Array.map(ASStyle.toId),
	Array.join('/')
);

/**
 * Appends `that` to `self`
 *
 * @category Utils
 */
export const append =
	(that: Type) =>
	(self: Type): Type => [...self, ...that];
