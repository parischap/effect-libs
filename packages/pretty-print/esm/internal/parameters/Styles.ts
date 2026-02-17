/**
 * Alias for a map of PPValueBasedStyler's (see ValueBasedStyler.ts). The keys of the map are
 * strings that identify a part of a stringified value
 */

import * as ASConstantContextStyler from '@parischap/ansi-styles/ASConstantContextStyler'
import * as HashMap from 'effect/HashMap'
import * as Option from 'effect/Option'
import type * as PPValueBasedStyler from '../../parameters/ValueBasedStyler.js';

/**
 * Type of a PPStyles
 *
 * @category Models
 */
export interface Type extends HashMap.HashMap<string, PPValueBasedStyler.Type> {}

/**
 * Returns the PPValueBasedStyler associated with `partName` which identifies a part of a
 * stringified value. Returns `ASConstantContextStyler.none` if `partName` is not present in
 * `self`.
 *
 * @category Destructors
 */
export const get = (self: Type, partName: string): PPValueBasedStyler.Type =>
  Option.getOrElse(HashMap.get(self, partName), () => ASConstantContextStyler.none);
