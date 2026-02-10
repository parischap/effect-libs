/**
 * Type of a MantissaAdjuster
 *
 * @category Models
 */
export interface MantissaAdjuster extends MTypes.OneArgFunction<
  BigDecimal.BigDecimal,
  readonly [adjustedMantissa: BigDecimal.BigDecimal, exponent: Option.Option<number>]
> {}

/**
 * Builds a `Parser` implementing `self`
 *
 * @category Destructors
 */
export const toMantissaAdjuster: MTypes.OneArgFunction<ScientificNotation, MantissaAdjuster> = flow(
  MMatch.make,
  MMatch.whenIsOr(
    ScientificNotation.None,
    ScientificNotation.Standard,
    (): MantissaAdjuster => flow(Tuple.make, Tuple.appendElement(Option.none())),
  ),
  MMatch.whenIs(
    ScientificNotation.Normalized,
    (): MantissaAdjuster => (b) => {
      if (BigDecimal.isZero(b)) return Tuple.make(b, Option.some(0));
      const { value } = b;
      const log10 = MBigInt.unsafeLog10(BigInt.abs(value));

      return Tuple.make(BigDecimal.make(value, log10), Option.some(log10 - b.scale));
    },
  ),
  MMatch.whenIs(
    ScientificNotation.Engineering,
    (): MantissaAdjuster => (b) => {
      if (BigDecimal.isZero(b)) return Tuple.make(b, Option.some(0));
      const { value } = b;
      const log10 = MBigInt.unsafeLog10(BigInt.abs(value)) - b.scale;
      const correctedLog10 = log10 - MNumber.intModulo(3)(log10);
      return Tuple.make(
        BigDecimal.make(value, correctedLog10 + b.scale),
        Option.some(correctedLog10),
      );
    },
  ),
  MMatch.exhaustive,
);
