/**
 * This module implements a `CVTemplateParser`, i.e. an object that is capable of converting a
 * string to a record of values according to the `CVTemplate` that was used to construct it. If you
 * don't want to build a `CVTemplate` beforehand, you can also construct a `CVTemplateParser`
 * directly from `CVTemplatePart`'s
 */

import { flow, pipe } from 'effect';
import * as Equal from 'effect/Equal';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Record from 'effect/Record';
import * as Result from 'effect/Result';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';

import * as MArray from '@parischap/effect-lib/MArray';
import * as MData from '@parischap/effect-lib/MData';
import * as MInputError from '@parischap/effect-lib/MInputError';
import * as MString from '@parischap/effect-lib/MString';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import type * as CVTemplate from './Template.js';

import * as CVTemplateSeparatorParser from '../../internal/formatting/template/TemplatePart/TemplateSeparator/TemplateSeparatorParser.js';
import * as CVTemplateParts from '../../internal/formatting/template/TemplateParts.js';
import * as CVTemplatePart from './TemplatePart/TemplatePart.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/formatting/template/TemplateParser/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a CVTemplateParser
 *
 * @category Models
 */
export class Type<out PlaceholderTypes extends MTypes.NonPrimitive> extends MData.Class {
  /** Description of this CVTemplateParser */
  readonly description: string;

  /** Function that tries to parse a text according to the template passed to build this parser */
  readonly parse: MTypes.OneArgFunction<string, Result.Result<PlaceholderTypes, MInputError.Type>>;

  /** Same as `parse` but throws in case of failure */
  readonly parseOrThrow: MTypes.OneArgFunction<string, PlaceholderTypes>;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type<PlaceholderTypes>) {
      return this.description;
    };
  }

  /** Class constructor */
  private constructor({ description, parse, parseOrThrow }: MTypes.Data<Type<PlaceholderTypes>>) {
    super();
    this.description = description;
    this.parse = parse;
    this.parseOrThrow = parseOrThrow;
  }

  /** Class constructor */
  private static make({
    syntheticDescription,
    placeholderDescription,
    templateParts,
  }: {
    readonly syntheticDescription: string;
    readonly placeholderDescription: string;
    readonly templateParts: CVTemplateParts.Type;
  }): Type<never> {
    const parse = (text: string) =>
      pipe(
        templateParts,
        MArray.reduceUnlessLeft(
          Tuple.make(text, Record.empty<string, unknown>()),
          ([remainingText, result], templatePart: CVTemplatePart.Type<string, unknown>, pos) =>
            Result.gen(function* () {
              if (CVTemplatePart.isPlaceholder(templatePart)) {
                const [consumed, leftOver] = yield* templatePart.parser(remainingText);
                const { name } = templatePart;
                return yield* pipe(
                  result,
                  Record.get(name),
                  Option.match({
                    onNone: () =>
                      Result.succeed(Tuple.make(leftOver, Record.set(result, name, consumed))),
                    onSome: flow(
                      Result.liftPredicate(
                        Equal.equals(consumed),
                        (oldValue) =>
                          new MInputError.Type({
                            message: `${templatePart.label} is present more than once in template and receives differing values '${MString.fromUnknown(oldValue)}' and '${MString.fromUnknown(consumed)}'`,
                          }),
                      ),
                      Result.andThen(Tuple.make(leftOver, result)),
                    ),
                  }),
                );
              }
              const parser = CVTemplateSeparatorParser.fromSeparator(templatePart);
              const leftOver = yield* parser(pos + 1, remainingText);
              return Tuple.make(leftOver, result);
            }),
        ),
        Result.flatMap(([leftOver, result]) =>
          Result.gen(function* () {
            yield* pipe(
              leftOver,
              MInputError.assertEmpty({ name: 'text not consumed by template' }),
            );
            return result as never;
          }),
        ),
      );
    return new Type({
      description: `${syntheticDescription} parser\n\n${placeholderDescription}`,
      parse,
      parseOrThrow: Function.compose(parse, Result.getOrThrowWith(Function.identity)),
    });
  }

  /** Constructor of a CVTemplateParser from a template */
  static fromTemplate<PlaceholderTypes extends MTypes.NonPrimitive>(
    template: CVTemplate.Type<PlaceholderTypes>,
  ): Type<PlaceholderTypes> {
    return Type.make({
      syntheticDescription: template.syntheticDescription,
      placeholderDescription: template.placeholderDescription,
      templateParts: template.templateParts,
    });
  }

  /** Constructor of a CVTemplateParser directly from CVTemplateParts */
  static fromTemplateParts<const PS extends CVTemplateParts.Type>(
    ...templateParts: PS
  ): Type<CVTemplateParts.ToPlaceHolderTypes<PS>> {
    return Type.make({
      syntheticDescription: CVTemplateParts.getSyntheticDescription(templateParts),
      placeholderDescription: CVTemplateParts.getPlaceholderDescription(templateParts),
      templateParts,
    });
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Constructor of a CVTemplateParser from a CVTemplate
 *
 * @category Constructors
 */
export const fromTemplate = Type.fromTemplate.bind(Type);

/**
 * Constructor of a CVTemplateParser directly from CVTemplateParts
 *
 * @category Constructors
 */
export const fromTemplateParts = Type.fromTemplateParts.bind(Type);

/**
 * Returns the `parser` property of `self`.
 *
 * @category Parsing
 */
export const parse: <PlaceholderTypes extends MTypes.NonPrimitive>(
  self: Type<PlaceholderTypes>,
) => Type<PlaceholderTypes>['parse'] = Struct.get('parse');

/**
 * Returns the `parseOrThrow` property of `self`.
 *
 * @category Parsing
 */
export const parseOrThrow: <PlaceholderTypes extends MTypes.NonPrimitive>(
  self: Type<PlaceholderTypes>,
) => Type<PlaceholderTypes>['parseOrThrow'] = Struct.get('parseOrThrow');
