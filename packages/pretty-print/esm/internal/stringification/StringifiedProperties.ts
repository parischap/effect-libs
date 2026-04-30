/**
 * This module implements a type alias and utility functions for arrays of `PPStringifiedValue`'s.
 * Each element represents the formatted output of one property of a non-primitive value. The
 * utilities here are responsible for injecting separators between properties, adding opening and
 * closing marks, applying indentation (tabification), and tree-style indentation.
 */

import { flow } from 'effect';
import * as Array from 'effect/Array';
import * as Number from 'effect/Number';

import type * as ASText from '@parischap/ansi-styles/ASText';
import * as MArray from '@parischap/effect-lib/MArray';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import * as PPStringifiedValue from '../../stringification/StringifiedValue.js';

/**
 * Type that represents a `PPStringifiedProperties`
 *
 * @category Models
 */
export type Type = ReadonlyArray<PPStringifiedValue.Type>;

/**
 * Returns a copy of `self` with `mark` appended to the last line of every stringified property
 * except the last one (i.e. inserts a separator between properties)
 *
 * @category Utils
 */
export const addMarkInBetween = (mark: ASText.Type): MTypes.OneArgFunction<Type> =>
  MArray.modifyInit(PPStringifiedValue.appendToLastLine(mark));

/**
 * Returns a copy of `self` with `property` added as a single-line StringifiedValue at the start
 *
 * @category Utils
 */
export const prependProperty = (property: ASText.Type): MTypes.OneArgFunction<Type> =>
  Array.prepend(PPStringifiedValue.fromText(property));

/**
 * Returns a copy of `self` with `property` added as a single-line StringifiedValue at the end
 *
 * @category Utils
 */
export const appendProperty = (property: ASText.Type): MTypes.OneArgFunction<Type> =>
  Array.append(PPStringifiedValue.fromText(property));

/**
 * Returns a copy of `self` in which each stringified property has been tabified with `tab`
 *
 * @category Utils
 */
export const tabify = (tab: ASText.Type): MTypes.OneArgFunction<Type> =>
  Array.map(PPStringifiedValue.prependToAllLines(tab));

/**
 * Returns a copy of `self` in which `treeIndentForFirstLineOfInitProps` has been prepended to the
 * first line of all properties but the last, `treeIndentForTailsLinesOfInitProps` has been
 * prepended to all the lines but the first of all properties but the last,
 * `treeIndentForFirstLineOfLastProp` has been prepended to the first line of the last property, and
 * `treeIndentForTailLinesOfLastProp` has been prepended to all the lines but the first of last
 * property.
 *
 * @category Utils
 */
export const treeify = ({
  treeIndentForFirstLineOfInitProps,
  treeIndentForTailLinesOfInitProps,
  treeIndentForFirstLineOfLastProp,
  treeIndentForTailLinesOfLastProp,
}: {
  readonly treeIndentForFirstLineOfInitProps: ASText.Type;
  readonly treeIndentForTailLinesOfInitProps: ASText.Type;
  readonly treeIndentForFirstLineOfLastProp: ASText.Type;
  readonly treeIndentForTailLinesOfLastProp: ASText.Type;
}): MTypes.OneArgFunction<Type> =>
  flow(
    MArray.modifyInit(
      flow(
        PPStringifiedValue.prependToFirstLine(treeIndentForFirstLineOfInitProps),
        PPStringifiedValue.prependToTailLines(treeIndentForTailLinesOfInitProps),
      ),
    ),
    MArray.modifyLast(
      flow(
        PPStringifiedValue.prependToFirstLine(treeIndentForFirstLineOfLastProp),
        PPStringifiedValue.prependToTailLines(treeIndentForTailLinesOfLastProp),
      ),
    ),
  );

/**
 * Returns the total character length of `self`, i.e. the sum of the lengths of all
 * `PPStringifiedValue`'s it contains
 *
 * @category Destructors
 */
export const toLength: MTypes.OneArgFunction<Type, number> = flow(
  Array.map(PPStringifiedValue.toLength),
  Number.sumAll,
);
