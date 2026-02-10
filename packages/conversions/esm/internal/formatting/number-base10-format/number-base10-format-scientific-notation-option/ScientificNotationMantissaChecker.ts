/**
 * Type of a MantissaChecker
 *
 * @category Models
 */
export interface MantissaChecker extends MTypes.OneArgFunction<
  BigDecimal.BigDecimal,
  Option.Option<BigDecimal.BigDecimal>
> {}

const zeroOrinRange = (rangeTop: number): Predicate.Predicate<BigDecimal.BigDecimal> =>
  Predicate.or(
    BigDecimal.isZero,
    Predicate.and(
      BigDecimal.greaterThanOrEqualTo(BigDecimal.unsafeFromNumber(1)),
      BigDecimal.lessThan(BigDecimal.unsafeFromNumber(rangeTop)),
    ),
  );

const zeroOrinOneToTenRange = zeroOrinRange(10);
const zeroOrinOneToOneThousandRange = zeroOrinRange(1000);

/**
 * Builds a `Parser` implementing `self`
 *
 * @category Destructors
 */
export const toMantissaChecker: MTypes.OneArgFunction<ScientificNotation, MantissaChecker> = flow(
  MMatch.make,
  MMatch.whenIsOr(
    ScientificNotation.None,
    ScientificNotation.Standard,
    () => Option.some<BigDecimal.BigDecimal>,
  ),
  MMatch.whenIs(ScientificNotation.Normalized, () => Option.liftPredicate(zeroOrinOneToTenRange)),
  MMatch.whenIs(ScientificNotation.Engineering, () =>
    Option.liftPredicate(zeroOrinOneToOneThousandRange),
  ),
  MMatch.exhaustive,
);
