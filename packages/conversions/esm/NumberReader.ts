/**
 * This module implements a NumberReader, i.e. a function that takes a string and optionnally
 * returns a number
 */

import { MTypes } from '@parischap/effect-lib';
import { Option } from 'effect';

/**
 * Type that represents a NumberReader
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<string, Option.Option<number>> {}
