/** This module implements an array of `CVTemplatePart`'s (see TemplatePart.ts) */
import { MMatch, MTypes } from '@parischap/effect-lib';
import { Array, flow, Function, Option } from 'effect';
import * as CVTemplatePart from '../../../formatting/template/TemplatePart/index.js';
import * as CVTemplatePlaceholder from '../../../formatting/template/TemplatePart/template-placeholder/index.js';
import * as CVTemplateSeparator from '../../../formatting/template/TemplatePart/template-separator/index.js';

/**
 * `CVTemplateParts` Type
 *
 * @category Models
 */
export interface Type<in out T = any> extends ReadonlyArray<CVTemplatePart.Type<string, T>> {}

export type ToPlaceHolderTypes<PS> =
  PS extends Type ?
    {
      readonly [k in keyof PS as PS[k] extends CVTemplatePlaceholder.Any ?
        CVTemplatePlaceholder.ExtractName<PS[k]>
      : never]: PS[k] extends CVTemplatePlaceholder.Any ? CVTemplatePlaceholder.ExtractType<PS[k]>
      : never;
    }
  : never;

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
      MMatch.exhaustive,
    ),
  ),
  Array.join(''),
);

/**
 * Shows a description of the `CVTemplatePlaceholder`'s of `self` (see description of
 * `CVTemplatePlaceholder.getLabelledDescription`)
 *
 * @category Destructors
 */
export const getPlaceholderDescription: MTypes.OneArgFunction<Type, string> = flow(
  Array.filterMap(
    flow(
      MMatch.make,
      MMatch.when(
        CVTemplatePart.isPlaceholder,
        flow(CVTemplatePlaceholder.getLabelledDescription, Option.some),
      ),
      MMatch.when(CVTemplatePart.isSeparator, Function.constant(Option.none())),
      MMatch.exhaustive,
    ),
  ),
  Array.join('.\n'),
);
