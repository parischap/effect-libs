import { flow } from 'effect';
import * as Array from 'effect/Array';
import * as Result from 'effect/Result';

import * as MFunction from '@parischap/effect-lib/MFunction';
/** This module implements an array of `CVTemplatePart`'s (see TemplatePart.ts) */
import * as MMatch from '@parischap/effect-lib/MMatch';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import * as CVTemplatePart from '../../../formatting/template/TemplatePart/TemplatePart.js';
import * as CVTemplatePlaceholder from '../../../formatting/template/TemplatePart/TemplatePlaceholder/TemplatePlaceholder.js';
import * as CVTemplateSeparator from '../../../formatting/template/TemplatePart/TemplateSeparator/TemplateSeparator.js';

/**
 * `CVTemplateParts` Type
 *
 * @category Models
 */
export interface Type extends ReadonlyArray<CVTemplatePart.Type<string, any>> {}

export type ToPlaceHolderTypes<PS> = PS extends Type
  ? {
      readonly [k in keyof PS as PS[k] extends CVTemplatePlaceholder.Any
        ? CVTemplatePlaceholder.ExtractName<PS[k]>
        : never]: PS[k] extends CVTemplatePlaceholder.Any
        ? CVTemplatePlaceholder.ExtractType<PS[k]>
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
        flow(CVTemplatePlaceholder.getLabelledDescription, Result.succeed),
      ),
      MMatch.when(CVTemplatePart.isSeparator, MFunction.constFailVoid),
      MMatch.exhaustive,
    ),
  ),
  Array.join('.\n'),
);
