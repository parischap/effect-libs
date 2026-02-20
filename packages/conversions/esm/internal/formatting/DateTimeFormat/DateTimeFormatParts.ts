/** This module implements a type that represents an array of `CVDateTimeFormatPart` */
import * as CVDateTimeFormatPart from '../../../Formatting/DateTimeFormat/DateTimeFormatPart/DateTimeFormatPart.js';

/**
 * Type of a CVDateTimeFormatParts
 *
 * @category Models
 */
export interface Type extends ReadonlyArray<CVDateTimeFormatPart.Type> {}
