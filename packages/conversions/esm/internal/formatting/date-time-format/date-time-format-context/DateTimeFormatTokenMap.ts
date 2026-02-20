/**
 * Module that implements a type that represents a map between a `CVDateTimeFormatToken` and the
 * `CVTemplatePlaceholder` that implements it
 */

import * as HashMap from 'effect/HashMap';
import * as CVDateTimeFormatToken from '../../../../formatting/date-time-format/DateTimeFormatToken.js';
import * as CVDateTimeFormatPlaceholder from '../../../../formatting/template/TemplatePart/template-placeholder/index.js';
/**
 * Type of a CVDateTimeFormatTokenMap
 *
 * @category Models
 */
export interface Type extends HashMap.HashMap<
  CVDateTimeFormatToken.Type,
  CVDateTimeFormatPlaceholder.Type<string, number>
> {}
