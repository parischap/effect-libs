/** This module implements an array of TemplatePart's (see TemplatePart.ts) */
import { MMatch, MTypes } from '@parischap/effect-lib';
import { Array, flow, Function, Option } from 'effect';
import * as CVTemplatePart from './TemplatePart.js';
import * as CVTemplatePlaceholder from './TemplatePlaceholder.js';
import * as CVTemplateSeparator from './TemplateSeparator.js';

/**
 * Type of a TemplateParts
 *
 * @category Models
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export interface Type<T = any> extends ReadonlyArray<CVTemplatePart.Type<string, T>> {}

/**
 * Shows a synthetic description of `self`, e.g.' #name is a #age-year-old #kind.'
 *
 * @category Destructors
 */
export const getSyntheticDescription: MTypes.OneArgFunction<Type, string> = flow(
	Array.map(
		flow(
			MMatch.make,
			MMatch.when(CVTemplatePart.isPlaceholder, CVTemplatePlaceholder.label),
			MMatch.when(CVTemplatePart.isSeparator, CVTemplateSeparator.value),
			MMatch.exhaustive
		)
	),
	Array.join('')
);

/**
 * Shows a description of the placeholders of `self`, e.g.' #name is a #age-year-old #kind.'
 *
 * @category Destructors
 */
export const getPlaceholderDescription: MTypes.OneArgFunction<Type, string> = flow(
	Array.filterMap(
		flow(
			MMatch.make,
			MMatch.when(
				CVTemplatePart.isPlaceholder,
				flow(CVTemplatePlaceholder.getLabelledDescription, Option.some)
			),
			MMatch.when(CVTemplatePart.isSeparator, Function.constant(Option.none())),
			MMatch.exhaustive
		)
	),
	Array.join('.\n')
);
