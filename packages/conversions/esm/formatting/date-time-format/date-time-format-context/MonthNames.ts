/** Module that implements a type that represents the names of the twelve months of a year */

import { MTypes } from '@parischap/effect-lib';

/**
 * Type of a CVMonthNames
 *
 * @category Models
 */
export interface Type extends MTypes.Tuple<string, 12> {}
