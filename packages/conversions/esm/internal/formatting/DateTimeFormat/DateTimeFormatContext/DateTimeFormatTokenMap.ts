/**
 * Module that implements a type that represents a map between a `CVDateTimeFormatToken` and the
 * `CVTemplatePlaceholder` that implements it
 */

import * as HashMap from 'effect/HashMap';
import * as CVDateTimeFormatToken from '../../../../Formatting/DateTimeFormat/DateTimeFormatToken.js';
import * as CVDateTimeFormatPlaceholder from '../../../../Formatting/Template/TemplatePart/TemplatePlaceholder/TemplatePlaceholder.js';
import * as CVDateTimePartName from '../DateTimePartName.js';
/**
 * Type of a CVDateTimeFormatTokenMap
 *
 * @category Models
 */
export interface Type extends HashMap.HashMap<
  CVDateTimeFormatToken.Type,
  CVDateTimeFormatPlaceholder.Type<CVDateTimePartName.Type, number>
> {}
