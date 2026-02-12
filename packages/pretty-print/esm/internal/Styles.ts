/**
 * Alias for a map of PPValueBasedStyler's (see ValueBasedStyler.ts). The keys of the map are
 * strings that identify a part of a stringified value
 */

import { ASConstantContextStyler } from '@parischap/ansi-styles';
import { MTypes } from '@parischap/effect-lib';
import { flow, HashMap, Option } from 'effect';
import * as PPValueBasedStyler from './ValueBasedStyler.js';

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
export const get = (partName: string): MTypes.OneArgFunction<Type, PPValueBasedStyler.Type> =>
  flow(
    HashMap.get(partName),
    Option.getOrElse(() => ASConstantContextStyler.none),
  );
