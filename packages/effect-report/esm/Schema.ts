import * as AST from '@effect/schema/AST';
import * as Schema from '@effect/schema/Schema';

import * as MSchema from '@parischap/effect-lib/MSchema';

import * as Effect from 'effect/Effect';

import * as RErrors from './Errors.js';

export type CompiledParser<A, R> = (
  i: unknown,
  overrideoptions?: AST.ParseOptions,
) => Effect.Effect<A, RErrors.General, R>;

// Parsing
export const makeCompiledParser = <A, I, R>({
  eol,
  schema,
  tabChar,
}: {
  readonly eol: string;
  readonly schema: Schema.Schema<A, I, R>;
  readonly tabChar: string;
}): CompiledParser<A, R> => {
  const compiledParser = Schema.decodeUnknown(schema, {
    errors: 'all',
    onExcessProperty: 'error',
  });
  return (i, overrideoptions) =>
    Effect.catchAll(
      compiledParser(i, overrideoptions),
      (e) =>
        new RErrors.General({
          message: 'Effect Schema parsing error' + eol + MSchema.prettyPrintError(e, eol, tabChar),
        }),
    );
};
