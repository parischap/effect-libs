/** This module implements an array of `CVTemplatePart`'s (see TemplatePart.ts) */
import { MMatch, MTypes } from '@parischap/effect-lib';
import { Array, flow, Function, Option } from 'effect';
import * as CVTemplatePartAll from '../TemplatePart/All.js';
import * as CVTemplatePartPlaceholder from '../TemplatePart/Placeholder.js';
import * as CVTemplatePartSeparator from '../TemplatePart/Separator.js';

/**
 * `CVTemplateParts` Type
 *
 * @category Models
 */
export interface Type<T = any> extends ReadonlyArray<CVTemplatePartAll.Type<string, T>> {}

/**
 * Shows a synthetic description of `self`, e.g.' #name is a #age-year-old #kind.'
 *
 * @category Destructors
 */
export const getSyntheticDescription: MTypes.OneArgFunction<Type, string> = flow(
  Array.map(
    flow(
      MMatch.make,
      MMatch.when(CVTemplatePartAll.isPlaceholder, CVTemplatePartPlaceholder.label),
      MMatch.when(CVTemplatePartAll.isSeparator, CVTemplatePartSeparator.value),
      MMatch.exhaustive,
    ),
  ),
  Array.join(''),
);

/**
 * Shows a description of the `CVTemplatePartPlaceholder`'s of `self` (see description of
 * `CVTemplatePartPlaceholder.getLabelledDescription`)
 *
 * @category Destructors
 */
export const getPlaceholderDescription: MTypes.OneArgFunction<Type, string> = flow(
  Array.filterMap(
    flow(
      MMatch.make,
      MMatch.when(
        CVTemplatePartAll.isPlaceholder,
        flow(CVTemplatePartPlaceholder.getLabelledDescription, Option.some),
      ),
      MMatch.when(CVTemplatePartAll.isSeparator, Function.constant(Option.none())),
      MMatch.exhaustive,
    ),
  ),
  Array.join('.\n'),
);
