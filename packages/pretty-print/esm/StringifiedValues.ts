/**
 * Type that is an alias for an array of StringifiedValue's (see StringifiedValue.ts). It represents
 * the output of the stringification process of the properties of a record.
 *
 * @since 0.0.1
 */

import { MArray } from '@parischap/effect-lib';
import { flow, pipe } from 'effect';
import * as ColorSet from './ColorSet.js';
import * as FormattedString from './FormattedString.js';
import type * as IndentMode from './IndentMode.js';
import type * as StringifiedValue from './StringifiedValue.js';

/**
 * Type that represents a StringifiedValues
 *
 * @since 0.0.1
 * @category Models
 */
export type Type = ReadonlyArray<StringifiedValue.Type>;

/**
 * Type that represents a function that transforms a StringifiedValues
 *
 * @since 0.0.1
 * @category Models
 */
export interface Transformer {
	(self: Type): Type;
}

/**
 * Adds a seperator at between the stringified properties of a record
 *
 * @since 0.0.1
 * @category Utils
 */
export const addSeparatorBetweenProps = (
	propertySeparator: string,
	colorer: ColorSet.Colorer
): Transformer =>
	flow(
		MArray.modifyInit(
			MArray.modifyLast(
				FormattedString.append(pipe(propertySeparator, FormattedString.makeWith(colorer)))
			)
		)
	);

/**
 * Indents the stringified properties of a record
 *
 * @since 0.0.1
 * @category Utils
 */
export const indentProps = (indentMode: IndentMode.Type, colorer: ColorSet.Colorer): Transformer =>
	flow(
		MArray.modifyInit(
			flow(
				MArray.modifyHead(
					FormattedString.prepend(
						pipe(indentMode.initPropFirstLine, FormattedString.makeWith(colorer))
					)
				),
				MArray.modifyTail(
					FormattedString.prepend(
						pipe(indentMode.initPropTailLines, FormattedString.makeWith(colorer))
					)
				)
			)
		),
		MArray.modifyLast(
			flow(
				MArray.modifyHead(
					FormattedString.prepend(
						pipe(indentMode.lastPropFirstLine, FormattedString.makeWith(colorer))
					)
				),
				MArray.modifyTail(
					FormattedString.prepend(
						pipe(indentMode.lastPropTailLines, FormattedString.makeWith(colorer))
					)
				)
			)
		)
	);
