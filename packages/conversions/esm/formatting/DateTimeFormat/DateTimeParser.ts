/**
 * This module implements a `CVDateTimeParser`, i.e. an object that can convert a string into a
 * `CVDateTime` according to the passed `CVDateTimeFormat` and `CVDateTimeFormatContext`.
 */

import * as MData from '@parischap/effect-lib/MData';
import * as MInputError from '@parischap/effect-lib/MInputError';
import * as MString from '@parischap/effect-lib/MString';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { flow, pipe, Struct } from 'effect';
import * as Either from 'effect/Either';
import * as Function from 'effect/Function';
import * as CVDateTime from '../../DateTime/DateTime.js';
import * as CVDateTimeParts from '../../DateTime/DateTimeParts.js';
import * as CVDateTimeFormatParts from '../../internal/Formatting/DateTimeFormat/DateTimeFormatParts.js';
import * as CVTemplateParser from '../Template/TemplateParser.js';
import * as CVDateTimeFormat from './DateTimeFormat.js';
import * as CVDateTimeFormatContext from './DateTimeFormatContext/DateTimeFormatContext.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/Formatting/DateTimeFormat/DateTimeParser/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a CVDateTimeParser
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Name of this CVDateTimeParser */
  readonly name: string;

  /** Function that will be used to parse a string into a CVDateTime */
  readonly parser: MTypes.OneArgFunction<string, Either.Either<CVDateTime.Type, MInputError.Type>>;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.name;
    };
  }

  /** Class constructor */
  private constructor({ name, parser }: MTypes.Data<Type>) {
    super();
    this.name = name;
    this.parser = parser;
  }

  /** Static constructor */
  static make({
    dateTimeFormat,
    context,
  }: {
    readonly dateTimeFormat: CVDateTimeFormat.Type;
    readonly context: CVDateTimeFormatContext.Type;
  }): Type {
    return new Type({
      name: pipe(
        dateTimeFormat.name,
        MString.prepend("'"),
        MString.append(`' parser in '${context.name}' context`),
      ),
      parser: pipe(
        dateTimeFormat.parts,
        CVDateTimeFormatParts.toTemplateParts(context),
        Function.tupled(CVTemplateParser.fromTemplateParts),
        CVTemplateParser.parse,
        Function.compose(Either.flatMap((o) => CVDateTime.fromParts(o as CVDateTimeParts.Type))),
      ),
    });
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

type Parser = Type['parser'];

/**
 * Builds a `CVDateTimeParser` from a `CVDateTimeFormat` and a `CVDateTimeFormatContext`.
 *
 * @category Constructors
 */
export const make = (params: {
  readonly dateTimeFormat: CVDateTimeFormat.Type;
  readonly context: CVDateTimeFormatContext.Type;
}): Type => Type.make(params);

/**
 * Returns the `name` property of `self`.
 *
 * @category Getters
 */
export const name: MTypes.OneArgFunction<Type, string> = Struct.get('name');

/**
 * Returns the `parser` property of `self`.
 *
 * @category Getters
 */
export const parser: MTypes.OneArgFunction<Type, Parser> = Struct.get('parser');

/**
 * Parses a text into a `CVDateTime`. See `CVDateTime.fromParts` for more information on default
 * values and errors.
 *
 * @category Parsing
 */
export const parse: MTypes.OneArgFunction<Type, Parser> = parser;

/**
 * Same as `parse` but throws instead of returning a `Left` in case of failure.
 *
 * @category Parsing
 */
export const parseOrThrow: MTypes.OneArgFunction<
  Type,
  MTypes.OneArgFunction<string, CVDateTime.Type>
> = flow(parse, Function.compose(Either.getOrThrowWith(Function.identity)));
