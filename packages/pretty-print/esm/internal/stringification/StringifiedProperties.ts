/**
 * Type that is an alias for an array of PPStringifiedValue's (see StringifiedValue.ts). It
 * represents the output of the stringification process of the properties of a non-primitive value.
 */

import * as ASText from '@parischap/ansi-styles/ASText'
import * as MArray from '@parischap/effect-lib/MArray'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {flow} from 'effect'
import * as Array from 'effect/Array'
import * as Function from 'effect/Function'
import * as Number from 'effect/Number'
import * as Order from 'effect/Order'
import * as PPStringifiedValue from '../../stringification/StringifiedValue.js';

/**
 * Type that represents a PPStringifiedValues
 *
 * @category Models
 */
export interface Type extends ReadonlyArray<PPStringifiedValue.Type> {}

/**
 * Returns a copy of `self` with a mark added at the end of the last line of each stringified
 * property except the last one
 *
 * @category Utils
 */
export const addMarkInBetween = (mark: ASText.Type): MTypes.OneArgFunction<Type> =>
  flow(MArray.modifyInit(PPStringifiedValue.appendToLastLine(mark)));

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
 * Returns the length of `self`, i.e. the sum of the lengths of the PPStringifiedValues constituting
 * `self`
 *
 * @category Destructors
 */
export const toLength: MTypes.OneArgFunction<Type, number> = flow(
  Array.map(PPStringifiedValue.toLength),
  Number.sumAll,
);

/**
 * Returns the length of the longest property of `self`
 *
 * @category Destructors
 */
export const toLongestPropLength: MTypes.OneArgFunction<Type, number> = flow(
  Array.map(PPStringifiedValue.toLength),
  Array.match({
    onEmpty: Function.constant(0),
    onNonEmpty: Array.max(Order.number),
  }),
);
