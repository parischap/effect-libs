import * as Array from 'effect/Array';

/** This module implements a type that represents an array of `CVDateTimeFormatPart` */
import type * as MTypes from '@parischap/effect-lib/MTypes';

import type * as CVDateTimeFormatContext from '../../../formatting/DateTimeFormat/DateTimeFormatContext/DateTimeFormatContext.js';
import type * as CVTemplateParts from '../template/TemplateParts.js';

import * as CVDateTimeFormatPart from '../../../formatting/DateTimeFormat/DateTimeFormatPart/DateTimeFormatPart.js';

/**
 * Type of a CVDateTimeFormatParts
 *
 * @category Models
 */
export interface Type extends ReadonlyArray<CVDateTimeFormatPart.Type> {}

/**
 * Converts self to its CVTemplateParts equivalent
 *
 * @category Destructors
 */
export const toTemplateParts = (
  context: CVDateTimeFormatContext.Type,
): MTypes.OneArgFunction<Type, CVTemplateParts.Type> =>
  Array.map(CVDateTimeFormatPart.toTemplatePart(context));
