/**
 * This module implements a `CVDateTimeParser`, i.e. an object that can convert a string into a
 * `CVDateTime` according to the passed `CVDateTimeFormat` and `CVDateTimeFormatContext`.
 */

import { pipe } from 'effect';
import * as Function from 'effect/Function';
import * as Result from 'effect/Result';
import * as Struct from 'effect/Struct';

import * as MData from '@parischap/effect-lib/MData';
import type * as MInputError from '@parischap/effect-lib/MInputError';
import * as MString from '@parischap/effect-lib/MString';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import type * as CVDateTimeParts from '../../DateTime/DateTimeParts.js';
import type * as CVDateTimeFormat from './DateTimeFormat.js';
import type * as CVDateTimeFormatContext from './DateTimeFormatContext/DateTimeFormatContext.js';

import * as CVDateTime from '../../DateTime/DateTime.js';
import * as CVDateTimeFormatParts from '../../internal/formatting/DateTimeFormat/DateTimeFormatParts.js';
import * as CVTemplateParser from '../template/TemplateParser.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/formatting/DateTimeFormat/DateTimeParser/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a CVDateTimeParser
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Name of this CVDateTimeParser */
  readonly name: string;

  /** Function that tries to parse a string into a CVDateTime */
  readonly parse: MTypes.OneArgFunction<string, Result.Result<CVDateTime.Type, MInputError.Type>>;

  /** Same as `parse` but throws instead of returning a `Failure` in case of failure. */
  readonly parseOrThrow: MTypes.OneArgFunction<string, CVDateTime.Type>;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.name;
    };
  }

  /** Class constructor */
  private constructor({ name, parse, parseOrThrow }: MTypes.Data<Type>) {
    super();
    this.name = name;
    this.parse = parse;
    this.parseOrThrow = parseOrThrow;
  }

  /** Static constructor */
  static make({
    dateTimeFormat,
    context,
  }: {
    readonly dateTimeFormat: CVDateTimeFormat.Type;
    readonly context: CVDateTimeFormatContext.Type;
  }): Type {
    const parse = pipe(
      dateTimeFormat.parts,
      CVDateTimeFormatParts.toTemplateParts(context),
      Function.tupled(CVTemplateParser.fromTemplateParts),
      CVTemplateParser.parse,
      Function.compose(Result.flatMap((o) => CVDateTime.fromParts(o as CVDateTimeParts.Type))),
    );
    return new Type({
      name: pipe(
        dateTimeFormat.name,
        MString.prepend("'"),
        MString.append(`' parser in '${context.name}' context`),
      ),
      parse,
      parseOrThrow: Function.compose(parse, Result.getOrThrowWith(Function.identity)),
    });
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

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
 * Returns the `parse` property of `self`.
 *
 * @category Getters
 */
export const parse: MTypes.OneArgFunction<Type, Type['parse']> = Struct.get('parse');

/**
 * Returns the `parseOrThrow` property of `self`.
 *
 * @category Getters
 */
export const parseOrThrow: MTypes.OneArgFunction<Type, Type['parseOrThrow']> =
  Struct.get('parseOrThrow');
