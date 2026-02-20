/** This module implements an array of `CVTemplatePart`'s (see TemplatePart.ts) */
import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { flow } from 'effect';
import * as Array from 'effect/Array';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as CVTemplatePart from '../../../Formatting/Template/TemplatePart/TemplatePart.js';
import * as CVTemplatePlaceholder from '../../../Formatting/Template/TemplatePart/TemplatePlaceholder/TemplatePlaceholder.js';
import * as CVTemplateSeparator from '../../../Formatting/Template/TemplatePart/TemplateSeparator/TemplateSeparator.js';

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
