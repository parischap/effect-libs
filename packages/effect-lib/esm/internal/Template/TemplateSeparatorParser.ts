/**
 * This module implements a `TemplateSeparatorParser`, which is a function that tries to read the
 * value of the separator from the start of `text`. If successful, it returns a success of the text
 * stripped of the separator. Otherwise, it returns a failure of an `MInputError`. `pos` is only used
 * in case of failure to report the position of the error.
 *
 * `MString` is imported type-only: `MString.templateParse` uses this module, so this module must
 * not depend on `MString` as a value.
 */

import { pipe } from 'effect';
import * as Result from 'effect/Result';

import * as MInputError from '../../InputError.js';
import * as internal from '../String.js';

import type * as MTemplateSeparator from '../../TemplatePart/TemplateSeparator.js';

/**
 * Type of a `TemplateSeparatorParser`
 *
 * @category Models
 */
export type Type = (pos: number, text: string) => Result.Result<string, MInputError.Type>;

/**
 * Builds a `TemplateSeparatorParser` from a `MTemplateSeparator`
 *
 * @category Constructors
 */
export const fromSeparator = (separator: MTemplateSeparator.Type): Type => {
  const { value } = separator;
  const { length } = value;
  return (pos, text) =>
    pipe(
      text,
      MInputError.assertStartsWith({
        startString: value,
        name: `remaining text for separator at position ${internal.fromNumber(10)(pos)}`,
      }),
      Result.map(internal.takeRightBut(length)),
    );
};
