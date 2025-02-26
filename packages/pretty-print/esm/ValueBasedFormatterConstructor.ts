/**
 * This module implements a Type that builds a ValueBasedFormatter (see ValueBasedFormatter.ts) from
 * an Option (see Option.ts) and a partName.
 */

import { ASContextFormatter } from '@parischap/ansi-styles';
import { MTypes } from '@parischap/effect-lib';
import { pipe } from 'effect';
import type * as PPOption from './Option.js';
import * as PPStyleMap from './StyleMap.js';
import * as PPValueBasedFormatter from './ValueBasedFormatter.js';
/**
 * Type of a ValueBasedFormatterConstructor
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<string, PPValueBasedFormatter.Type> {}

/**
 * Builds a ValueBasedFormatter (see ValueBasedFormatter.ts) from the `partName` style of the
 * provided `option.styleMap` (see StyleMap.ts)
 *
 * @category Constructors
 */
export const fromOption =
	(option: PPOption.Type): Type =>
	(partName) =>
		pipe(option.styleMap, PPStyleMap.get(partName));

/**
 * Creates a ValueBasedFormatterConstructor that always returns a `none` ContextFormatter
 *
 * @category Constructors
 */
export const noneConstructor: Type = () => ASContextFormatter.none;
