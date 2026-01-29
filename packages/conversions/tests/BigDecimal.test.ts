import * as TestUtils from "@parischap/configs/TestUtils";
import {
  CVBigDecimal,
  CVInteger,
  CVPositiveInteger,
  CVPositiveReal,
  CVReal,
} from "@parischap/conversions";
import { BigDecimal } from "effect";
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
