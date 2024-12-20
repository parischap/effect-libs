/**
 * Type that is an alias for an array of StringifiedValue's (see StringifiedValue.ts). It represents
 * the output of the stringification process of the properties of a record.
 *
 * @since 0.0.1
 */

import { ASFormatter } from '@parischap/ansi-styles';
import { MArray } from '@parischap/effect-lib';
import { flow, pipe } from 'effect';
import type * as PPIndentMode from './IndentMode.js';
import * as PPString from './String.js';
import type * as PPStringifiedValue from './StringifiedValue.js';

/**
 * Type that represents a StringifiedValues
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends ReadonlyArray<PPStringifiedValue.Type> {}

/**
 * Adds a seperator at between the stringified properties of a record
 *
 * @since 0.0.1
 * @category Utils
 */
export const addSeparatorBetweenProps = (
	propertySeparator: string,
	formatter: ASFormatter.Type
): MTypes.OneArgFunction<Type> =>
	flow(
		MArray.modifyInit(
			MArray.modifyLast(PPString.append(pipe(propertySeparator, PPString.makeWith(formatter))))
		)
	);

/**
 * Indents the stringified properties of a record
 *
 * @since 0.0.1
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
