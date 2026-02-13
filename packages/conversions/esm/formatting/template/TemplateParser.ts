/** This module implements a CVTemplateParser */
import { MData, MTypes } from '@parischap/effect-lib';
import * as CVTemplateParts from '../../internal/formatting/template/TemplateParts.js';
import * as CVTemplate from './index.js';

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
export class Type<out PlaceHolderTypes extends MTypes.NonPrimitive> extends MData.Class {
  /** Description of this CVTemplateParser */
  readonly description: string;

  /** Array of the TemplatePart's composing this template */
  readonly templateParts: CVTemplateParts.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type<PlaceHolderTypes>) {
      return this.description;
    };
  }

  /** Class constructor */
  private constructor({ description, templateParts }: MTypes.Data<Type<PlaceHolderTypes>>) {
    super();
    this.description = description;
    this.templateParts = templateParts;
  }

  /** Static constructor */
  static make<PlaceHolderTypes extends MTypes.NonPrimitive>(
    params: MTypes.Data<Type<PlaceHolderTypes>>,
  ): Type<PlaceHolderTypes> {
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
export const fromTemplate = <PlaceHolderTypes extends MTypes.NonPrimitive>(
  template: CVTemplate.Type<PlaceHolderTypes>,
): Type<PlaceHolderTypes> =>
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
    description: `${template.syntheticDescription} Parser\n\n${template.placeholderDescription}`,
    templateParts: template.templateParts,
  });

/**
 * Parses a text into an object according to 'self'. The generated parser returns a `Right` of an
 * object upon success, a `Left` otherwise.
 *
 * @category Parsing
 */

export const parse =
  <const PS extends CVTemplateParts.Type>(
    self: Type<PS>,
  ): MTypes.OneArgFunction<
    string,
    Either.Either<
      {
        readonly [k in keyof PS as PS[k] extends CVTemplatePlaceholder.Any ?
          CVTemplatePlaceholder.ExtractName<PS[k]>
        : never]: PS[k] extends CVTemplatePlaceholder.Any ? CVTemplatePlaceholder.ExtractType<PS[k]>
        : never;
      },
      MInputError.Type
    >
  > =>
  (text) =>
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
 * Same as `toParser` but the generated parser throws in case of failure
 *
 * @category Parsing
 */

export const toThrowingParser: <const PS extends CVTemplateParts.Type>(
  self: Type<PS>,
) => MTypes.OneArgFunction<
  string,
  {
    readonly [k in keyof PS as PS[k] extends CVTemplatePlaceholder.Any ?
      CVTemplatePlaceholder.ExtractName<PS[k]>
    : never]: PS[k] extends CVTemplatePlaceholder.Any ? CVTemplatePlaceholder.ExtractType<PS[k]>
    : never;
  }
> = flow(toParser, Function.compose(Either.getOrThrowWith(Function.identity))) as never;
