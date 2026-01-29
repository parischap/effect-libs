import { Cause, Data } from "effect";

// Data.TaggedError extends Error and may therefore have a stack trace
// Data.TaggedError extends Error and therefore is Errorish
// Data.TaggedError extends YieldableError and may therefore be yielded directly

/**
 * This error is meant to be handled by a human being (no action triggered like a retry on HTTP
 * Error). The message must give sufficient context to help identify the origin the error
 */
export class General extends Data.TaggedError("General")<{
  readonly message: string;
}> {}

/** This error is meant to be rethrown in an Effect.catchAllCause */
export class WithOriginalCause extends Data.TaggedError("WithOriginalCause")<{
  readonly message: string;
  readonly originalCause: Cause.Cause<unknown>;
}> {}
