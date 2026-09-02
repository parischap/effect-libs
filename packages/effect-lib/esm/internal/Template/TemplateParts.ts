/** This module implements an array of `MTemplatePart`'s (see TemplatePart.ts) */

import { flow } from 'effect';
import * as Array from 'effect/Array';
import * as Result from 'effect/Result';

import type * as MTypes from '../../types/types.js';

import * as MFunction from '../../Function.js';
import * as MMatch from '../../Match.js';
import * as MTemplatePart from '../../TemplatePart/TemplatePart.js';
import * as MTemplatePlaceholder from '../../TemplatePart/TemplatePlaceholder.js';
import * as MTemplateSeparator from '../../TemplatePart/TemplateSeparator.js';

/**
 * `TemplateParts` Type
 *
 * @category Models
 */
export interface Type extends ReadonlyArray<MTemplatePart.Type<string, any>> {}

/**
 * Utility type that turns a tuple of `MTemplatePart`'s into the object type of the placeholders it
 * contains
 *
 * @category Utility types
 */
export type ToPlaceHolderTypes<PS> = PS extends Type
  ? {
      readonly [
        k in keyof PS as PS[k] extends MTemplatePlaceholder.Any
          ? MTemplatePlaceholder.ExtractName<PS[k]>
          : never
      ]: PS[k] extends MTemplatePlaceholder.Any ? MTemplatePlaceholder.ExtractType<PS[k]> : never;
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
      MMatch.when(MTemplatePart.isPlaceholder, MTemplatePlaceholder.label),
      MMatch.when(MTemplatePart.isSeparator, MTemplateSeparator.value),
      MMatch.exhaustive,
    ),
  ),
  Array.join(''),
);

/**
 * Shows a description of the `MTemplatePlaceholder`'s of `self` (see description of
 * `MTemplatePlaceholder.getLabelledDescription`)
 *
 * @category Destructors
 */
export const getPlaceholderDescription: MTypes.OneArgFunction<Type, string> = flow(
  Array.filterMap(
    flow(
      MMatch.make,
      MMatch.when(
        MTemplatePart.isPlaceholder,
        flow(MTemplatePlaceholder.getLabelledDescription, Result.succeed),
      ),
      MMatch.when(MTemplatePart.isSeparator, MFunction.constFailVoid),
      MMatch.exhaustive,
    ),
  ),
  Array.join('.\n'),
);
