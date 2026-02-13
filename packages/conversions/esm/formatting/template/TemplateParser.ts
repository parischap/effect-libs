/**
 * This module implements a `CVTemplateParser`, i.e. an object that is capable of converting a
 * string to a record of values according to the `CVTemplate` that was used to construct it. If you
 * don't want to build a `CVTemplate` beforehand, you can also construct a `CVTemplateParser`
 * directly from `CVTemplatePart`'s
 */

import { MArray, MData, MInputError, MString, MTypes } from '@parischap/effect-lib';
import { Either, Equal, flow, Function, Option, pipe, Record, Tuple } from 'effect';
import * as CVTemplateSeparatorParser from '../../internal/formatting/template/TemplatePart/template-separator/TemplateSeparatorParser.js';
import * as CVTemplateParts from '../../internal/formatting/template/TemplateParts.js';
import * as CVTemplate from './index.js';
import * as CVTemplatePart from './TemplatePart/index.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/formatting/template/TemplateParser/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a CVTemplateParser
 *
 * @category Models
 */
export class Type<out PlaceholderTypes extends MTypes.NonPrimitive> extends MData.Class {
  /** Description of this CVTemplateParser */
  readonly description: string;

  /** Array of the TemplatePart's composing the template of this CVTemplateParser */
  readonly templateParts: CVTemplateParts.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type<PlaceholderTypes>) {
      return this.description;
    };
  }

  /** Class constructor */
  private constructor({ description, templateParts }: MTypes.Data<Type<PlaceholderTypes>>) {
    super();
    this.description = description;
    this.templateParts = templateParts;
  }

  /** Static constructor */
  static make<PlaceholderTypes extends MTypes.NonPrimitive>(
    params: MTypes.Data<Type<PlaceholderTypes>>,
  ): Type<PlaceholderTypes> {
    return new Type(params);
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Constructor of a CVTemplateParser from a CVTemplate
 *
 * @category Constructors
 */
export const fromTemplate = <PlaceholderTypes extends MTypes.NonPrimitive>(
  template: CVTemplate.Type<PlaceholderTypes>,
): Type<PlaceholderTypes> =>
  Type.make({
    description: `${template.syntheticDescription} Parser\n\n${template.placeholderDescription}`,
    templateParts: template.templateParts,
  });

/**
 * Constructor of a CVTemplateParser directly from CVTemplateParts
 *
 * @category Constructors
 */
export const fromTemplateParts = <const PS extends CVTemplateParts.Type>(
  ...templateParts: PS
): Type<CVTemplateParts.ToPlaceHolderTypes<PS>> =>
  Type.make({
    description: `${CVTemplateParts.getSyntheticDescription(templateParts)} Parser\n\n${CVTemplateParts.getSyntheticDescription(templateParts)}`,
    templateParts,
  });

/**
 * Tries to parse a text into an object according to the template used to construct `self`. Returns
 * a `right` of an object upon success, a `left` otherwise.
 *
 * @category Parsing
 */

export const parse =
  <PlaceholderTypes extends MTypes.NonPrimitive>(self: Type<PlaceholderTypes>) =>
  (text: string): Either.Either<PlaceholderTypes, MInputError.Type> =>
    pipe(
      self.templateParts as CVTemplateParts.Type<unknown>,
      MArray.reduceUnlessLeft(
        Tuple.make(text, Record.empty<string, unknown>()),
        ([remainingText, result], templatePart, pos) =>
          Either.gen(function* () {
            if (CVTemplatePart.isPlaceholder(templatePart)) {
              const [consumed, leftOver] = yield* templatePart.parser(remainingText);
              const { name } = templatePart;
              return yield* pipe(
                result,
                Record.get(name),
                Option.match({
                  onNone: () =>
                    Either.right(Tuple.make(leftOver, Record.set(result, name, consumed))),
                  onSome: flow(
                    Either.liftPredicate(
                      Equal.equals(consumed),
                      (oldValue) =>
                        new MInputError.Type({
                          message: `${templatePart.label} is present more than once in template and receives differing values '${MString.fromUnknown(oldValue)}' and '${MString.fromUnknown(consumed)}'`,
                        }),
                    ),
                    Either.andThen(Tuple.make(leftOver, result)),
                  ),
                }),
              );
            }
            const parser = CVTemplateSeparatorParser.fromSeparator(templatePart);
            const leftOver = yield* parser(pos + 1, remainingText);
            return Tuple.make(leftOver, result);
          }),
      ),
      Either.flatMap(([leftOver, result]) =>
        Either.gen(function* () {
          yield* pipe(leftOver, MInputError.assertEmpty({ name: 'text not consumed by template' }));
          return result as never;
        }),
      ),
    );

/**
 * Same as `parse` but throws in case of failure
 *
 * @category Parsing
 */
export const parseOrThrow: <PlaceholderTypes extends MTypes.NonPrimitive>(
  self: Type<PlaceholderTypes>,
) => (text: string) => PlaceholderTypes = flow(
  parse,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);
