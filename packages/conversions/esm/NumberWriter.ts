/**
 * This module implements a NumberWriter, i.e. a function that takes a number and optionnally
 * returns a string
 */

import { MTypes } from '@parischap/effect-lib';
import { Option } from 'effect';

/**
 * Type that represents a NumberWriter
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<number, Option.Option<string>> {}
