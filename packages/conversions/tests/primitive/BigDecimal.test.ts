import * as TestUtils from "@parischap/configs/TestUtils";
import * as CVBigDecimal from '@parischap/conversions/CVBigDecimal'
import * as CVInteger from '@parischap/conversions/CVInteger'
import * as CVPositiveInteger from '@parischap/conversions/CVPositiveInteger'
import * as CVPositiveReal from '@parischap/conversions/CVPositiveReal'
import * as CVReal from '@parischap/conversions/CVReal'
import * as BigDecimal from 'effect/BigDecimal'
import { describe, it } from "vitest";

describe("CVBigDecimal", () => {
  it("From Real", () => {
    TestUtils.deepStrictEqual(
      CVBigDecimal.fromReal(CVReal.unsafeFromNumber(-154)),
      BigDecimal.make(-154n, 0),
    );
  });

  it("From PositiveReal", () => {
    TestUtils.deepStrictEqual(
      CVBigDecimal.fromReal(CVPositiveReal.unsafeFromNumber(154)),
      BigDecimal.make(154n, 0),
    );
  });

  it("From PositiveInteger", () => {
    TestUtils.deepStrictEqual(
      CVBigDecimal.fromReal(CVPositiveInteger.unsafeFromNumber(154)),
      BigDecimal.make(154n, 0),
    );
  });

  it("From Integer", () => {
    TestUtils.deepStrictEqual(
      CVBigDecimal.fromReal(CVInteger.unsafeFromNumber(-154)),
      BigDecimal.make(-154n, 0),
    );
  });
});
