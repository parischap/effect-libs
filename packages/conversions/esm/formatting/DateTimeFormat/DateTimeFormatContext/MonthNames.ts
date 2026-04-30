/** Module that implements a type that represents the names of the twelve months of a year */

import type * as MTypes from '@parischap/effect-lib/MTypes';

/**
 * Type of a CVMonthNames
 *
 * @category Models
 */
export interface Type extends MTypes.ReadonlyTuple<string, 12> {}
