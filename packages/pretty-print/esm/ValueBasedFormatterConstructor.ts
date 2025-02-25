/**
 * This module implements a Type that builds a ValueBasedFormatter (see ValueBasedFormatter.ts) from
 * a StyleMap (see StyleMap.ts)
 */

import { ASContextFormatter } from '@parischap/ansi-styles';
import { MTypes } from '@parischap/effect-lib';
import { pipe } from 'effect';
import * as PPValueBasedFormatter from './ValueBasedFormatter.js';
import { PPStyleMap } from './index.js';
/**
 * Type of a ValueBasedFormatterConstructor
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<string, PPValueBasedFormatter.Type> {}

/**
 * Builds a ValueBasedFormatter (see ValueBasedFormatter.ts) from the `partName` style of the
 * provided `styleMap` (see StyleMap.ts)
 *
 * @category Constructors
 */
export const fromStyleMap =
	(styleMap: PPStyleMap.Type): Type =>
	(partName) =>
		pipe(styleMap, PPStyleMap.get(partName));

/**
 * Creates a ValueBasedFormatterConstructor that always returns a `none` ContextFormatter
 *
 * @category Constructors
 */
export const noneConstructor: Type = () => ASContextFormatter.none;
