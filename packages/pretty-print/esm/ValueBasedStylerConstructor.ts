/**
 * This module implements a Type that builds a ValueBasedStyler (see ValueBasedStyler.ts) from an
 * Option (see Option.ts) and a partName.
 */

import { MTypes } from '@parischap/effect-lib';
import { pipe } from 'effect';
import type * as PPOption from './Option.js';
import * as PPStyleMap from './StyleMap.js';
import * as PPValueBasedStyler from './ValueBasedStyler.js';
/**
 * Type of a ValueBasedStylerConstructor
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<string, PPValueBasedStyler.Type> {}

/**
 * Builds a ValueBasedStyler (see ValueBasedStyler.ts) from the `partName` style of the provided
 * `option.styleMap` (see StyleMap.ts)
 *
 * @category Constructors
 */
export const fromOption =
	(option: PPOption.Type): Type =>
	(partName) =>
		pipe(option.styleMap, PPStyleMap.get(partName));
