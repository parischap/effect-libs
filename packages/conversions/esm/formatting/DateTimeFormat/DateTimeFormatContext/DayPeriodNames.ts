/**
 * Module that implements a type that represents the names of the two periods in a day, e.g. AM or
 * PM
 */
import type * as MTypes from '@parischap/effect-lib/MTypes';

/**
 * Type of a CVDayPeriodNames
 *
 * @category Models
 */
export interface Type extends MTypes.ReadonlyTuple<string, 2> {}
