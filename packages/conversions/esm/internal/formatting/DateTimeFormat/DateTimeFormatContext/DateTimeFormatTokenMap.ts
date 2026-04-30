/**
 * Module that implements a type that represents a map between a `CVDateTimeFormatToken` and the
 * `CVTemplatePlaceholder` that implements it
 */

import type * as HashMap from 'effect/HashMap';

import type * as CVDateTimeFormatToken from '../../../../formatting/DateTimeFormat/DateTimeFormatToken.js';
import type * as CVDateTimeFormatPlaceholder from '../../../../formatting/template/TemplatePart/TemplatePlaceholder/TemplatePlaceholder.js';
import type * as CVDateTimePartName from '../DateTimePartName.js';
/**
 * Type of a CVDateTimeFormatTokenMap
 *
 * @category Models
 */
export interface Type extends HashMap.HashMap<
  CVDateTimeFormatToken.Type,
  CVDateTimeFormatPlaceholder.Type<CVDateTimePartName.Type, number>
> {}
