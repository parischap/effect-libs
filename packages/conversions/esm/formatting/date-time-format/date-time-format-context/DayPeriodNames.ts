/**
 * Module that implements a type that represents the names of the two periods in a day, e.g. AM or
 * PM
 */
import { MTypes } from '@parischap/effect-lib';

/**
 * Module that implemets a type that represents the names of the day periods, e.g. AM or PM
 *
 * Type of a CVDayPeriodNames
 */
export interface Type extends MTypes.Tuple<string, 2> {}
