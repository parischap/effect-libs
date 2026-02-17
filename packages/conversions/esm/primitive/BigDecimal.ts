/** A simple extension to the `Effect.BigDecimal` module */

import * as MTypes from '@parischap/effect-lib/MTypes'
import * as BigDecimal from 'effect/BigDecimal'
import * as CVReal from "./Real.js";

/**
 * Constructs a `BigDecimal` from a `CVReal`
 *
 * @category Constructors
 */
export const fromReal: MTypes.OneArgFunction<CVReal.Type, BigDecimal.BigDecimal> =
  BigDecimal.unsafeFromNumber;
