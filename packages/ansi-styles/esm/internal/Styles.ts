/**
 * This module implements a Type that represents an array of Style's (see Style.ts). It is used by
 * the Palette module (see Palette.ts)
 */

import * as MTypes from '@parischap/effect-lib/MTypes'
import {flow} from 'effect'
import * as Array from 'effect/Array'
import * as ASStyle from '../Style.js';

/**
 * Type that represents an array of Style's.
 *
 * @category Models
 */
export type Type = MTypes.ReadonlyOverTwo<ASStyle.Type>;

/**
 * Gets the id of `self`
 *
 * @category Destructors
 */
export const toString: MTypes.OneArgFunction<Type, string> = flow(
  Array.map(ASStyle.toString),
  Array.join('/'),
);

/**
 * Appends `that` to `self`
 *
 * @category Utils
 */
export const append =
  (that: Type) =>
  (self: Type): Type => [...self, ...that];
