/**
 * This module implements the `PPValueBasedStylerConstructor` type and its `fromOption` constructor.
 * A `PPValueBasedStylerConstructor` is a function that, given a part name (a string identifying
 * which part of a stringified value is being styled), returns the `PPValueBasedStyler` associated
 * with that part name in the option's style map.
 *
 * With the `fromOption` function, you can build an instance from any object that carries a
 * `styleMap` field (typically a `PPParameters` or a `PPStringifier`).
 */

import * as MTypes from '@parischap/effect-lib/MTypes'
import * as PPStyleMap from './StyleMap.js';
import * as PPValueBasedStyler from './ValueBasedStyler.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/ValueBasedStylerConstructor/';

/**
 * Type of a PPValueBasedStylerConstructor
 *
 * @category Models
 */
export type Type = MTypes.OneArgFunction<string, PPValueBasedStyler.Type>;

/**
 * Creates a `PPValueBasedStylerConstructor` from any object that carries a `styleMap` property
 *
 * @category Constructors
 */
export const fromOption = (option: { readonly styleMap: PPStyleMap.Type }): Type =>
  (partName: string): PPValueBasedStyler.Type =>
    PPStyleMap.get(option.styleMap, partName);
