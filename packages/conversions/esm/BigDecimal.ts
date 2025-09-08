/** A simple extension to the `Effect.BigDecimal` module */

import { MTypes } from '@parischap/effect-lib';
import { BigDecimal } from 'effect';
import * as CVReal from './Real.js';

/**
 * Constructs a `BigDecimal` from a `CVReal`
 *
 * @category Constructors
 */
export const fromReal: MTypes.OneArgFunction<CVReal.Type, BigDecimal.BigDecimal> =
	BigDecimal.unsafeFromNumber;
