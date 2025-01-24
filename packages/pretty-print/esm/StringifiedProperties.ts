/**
 * Type that is an alias for an array of StringifiedValue's (see StringifiedValue.ts). It represents
 * the output of the stringification process of the properties of a record.
 */

import { ASText } from '@parischap/ansi-styles';
import { MArray, MTypes } from '@parischap/effect-lib';
import { flow, pipe } from 'effect';
import type * as PPIndentMode from './IndentMode.js';
import * as PPStringifiedValue from './StringifiedValue.js';

/**
 * Type that represents a StringifiedValues
 *
 * @category Models
 */
export interface Type extends ReadonlyArray<PPStringifiedValue.Type> {}

/**
 * Return a copy of `self` with a mark added at the end of each stringified property except the last
 * one
 *
 * @category Utils
 */
export const addMarkInBetween = (mark: ASText.Type): MTypes.OneArgFunction<Type> =>
	flow(MArray.modifyInit(PPStringifiedValue.addEndMark(mark)));

/**
 * Indents the stringified properties of a record
 *
 * @category Utils
 */
export const indentProps = (
	indentMode: PPIndentMode.Type,
	formatter: ASFormatter.Type
): MTypes.OneArgFunction<Type> =>
	flow(
		MArray.modifyInit(
			flow(
				MArray.modifyHead(
					PPString.prepend(pipe(indentMode.initPropFirstLine, PPString.makeWith(formatter)))
				),
				MArray.modifyTail(
					PPString.prepend(pipe(indentMode.initPropTailLines, PPString.makeWith(formatter)))
				)
			)
		),
		MArray.modifyLast(
			flow(
				MArray.modifyHead(
					PPString.prepend(pipe(indentMode.lastPropFirstLine, PPString.makeWith(formatter)))
				),
				MArray.modifyTail(
					PPString.prepend(pipe(indentMode.lastPropTailLines, PPString.makeWith(formatter)))
				)
			)
		)
	);
