/**
 * This module implements a Type that builds a MarkShower (see MarkShower.ts) from an Option (see
 * Option.ts) and a markName
 */

import { MTypes } from '@parischap/effect-lib';
import { Function, HashMap, Option, pipe } from 'effect';
import * as PPMarkShower from './MarkShower.js';
import type * as PPOption from './Option.js';
import * as PPStyleMap from './StyleMap.js';
/**
 * Type of a MarkShowerConstructor
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<string, PPMarkShower.Type> {}

/**
 * Creates a MarkShowerConstructor that will return a MarkShower from `markName` and `option`.
 * Concretely, this markShower will display the text attached to markName in option.markMap using
 * the reversed action of the ValueBasedContextStyler attached to markName in option.markMap
 *
 * @category Constructors
 */
export const fromOption = (option: PPOption.Type): Type => {
	const markShowerMap = HashMap.map(option.markMap.marks, ({ text, partName }) =>
		pipe(option.styleMap, PPStyleMap.get(partName), (contextStyler) =>
			contextStyler.withContextLast(text)
		)
	);

	return (markName) =>
		pipe(
			markShowerMap,
			HashMap.get(markName),
			Option.getOrElse(Function.constant(PPMarkShower.empty))
		);
};
