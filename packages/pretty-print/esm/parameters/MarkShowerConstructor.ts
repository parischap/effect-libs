/**
 * This module implements the `PPMarkShowerConstructor` type and its `fromOption` constructor.
 * A `PPMarkShowerConstructor` is a function that, given a mark name, returns a mark shower
 * — a function `(value: PPValue.Any) => ASText.Type` that produces styled text for that mark
 * based on the style and mark maps carried by the option.
 *
 * With the `fromOption` function, you can build an instance from any object that carries both a
 * `styleMap` and a `markMap` field (typically a `PPParameters`).
 */

import * as ASText from '@parischap/ansi-styles/ASText'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {pipe} from 'effect'
import * as HashMap from 'effect/HashMap'
import * as Option from 'effect/Option'
import * as PPValue from '../internal/stringification/Value.js';
import * as PPMarkMap from './MarkMap.js';
import * as PPStyleMap from './StyleMap.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/MarkShowerConstructor/';

/**
 * Type of a PPMarkShowerConstructor
 *
 * @category Models
 */
export type Type = MTypes.OneArgFunction<string, MTypes.OneArgFunction<PPValue.Any, ASText.Type>>;

/** Mark shower that always returns `ASText.empty`, used as fallback for unknown mark names */
const emptyMarkShower: MTypes.OneArgFunction<PPValue.Any, ASText.Type> = () => ASText.empty;

/**
 * Creates a `PPMarkShowerConstructor` from any object that carries `styleMap` and `markMap`
 * properties
 *
 * @category Constructors
 */
export const fromOption = (option: {
  readonly styleMap: PPStyleMap.Type;
  readonly markMap: PPMarkMap.Type;
}): Type => {
  const markShowers = HashMap.map(option.markMap.marks, (mark) => {
    const styler = PPStyleMap.get(option.styleMap, mark.partName);
    return (value: PPValue.Any): ASText.Type => styler(value)(mark.text);
  });
  return (markName: string): MTypes.OneArgFunction<PPValue.Any, ASText.Type> =>
    pipe(markShowers, HashMap.get(markName), Option.getOrElse(() => emptyMarkShower));
};
