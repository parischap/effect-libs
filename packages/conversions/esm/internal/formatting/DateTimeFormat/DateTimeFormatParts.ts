/** This module implements a type that represents an array of `CVDateTimeFormatPart` */
import { MTypes } from '@parischap/effect-lib';
import { Array } from 'effect';
import * as CVDateTimeFormatContext from '../../../Formatting/DateTimeFormat/DateTimeFormatContext/DateTimeFormatContext.js';
import * as CVDateTimeFormatPart from '../../../Formatting/DateTimeFormat/DateTimeFormatPart/DateTimeFormatPart.js';
import * as CVTemplateParts from '../Template/TemplateParts.js';

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
