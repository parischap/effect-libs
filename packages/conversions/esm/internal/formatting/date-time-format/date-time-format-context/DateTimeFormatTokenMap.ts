/**
 * Module that implements a type that represents a map between a `CVDateTimeFormatToken` and the
 * `CVTemplatePartPlaceholder` that implements it
 */

import { HashMap } from 'effect';
import * as CVDateTimeFormatToken from '../../../../formatting/date-time-format/DateTimeFormatToken.js';
import * as CVDateTimeFormatPlaceholder from '../../../../formatting/template/TemplatePart/Placeholder/index.js';
import * as CVReal from '../../../../primitive/Real.js';
/**
 * Type of a CVDateTimeFormatTokenMap
 *
 * @category Models
 */
export interface Type extends HashMap.HashMap<
  CVDateTimeFormatToken.Type,
  CVDateTimeFormatPlaceholder.Type<string, CVReal.Type>
> {}
