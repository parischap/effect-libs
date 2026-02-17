/**
 * This module implements a `CVTemplateFormatter`, i.e. an object that is capable of converting a a
 * record of values to a string according to the `CVTemplate` that was used to construct it. If you
 * don't want to build a `CVTemplate` beforehand, you can also construct a `CVTemplateFormatter`
 * directly from `CVTemplatePart`'s
 */
import * as MArray from '@parischap/effect-lib/MArray'
import * as MData from '@parischap/effect-lib/MData'
import * as MInputError from '@parischap/effect-lib/MInputError'
import * as MString from '@parischap/effect-lib/MString'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {flow, pipe} from 'effect'
import * as Either from 'effect/Either'
import * as Function from 'effect/Function'
import * as Option from 'effect/Option'
import * as Record from 'effect/Record'
import * as CVTemplateParts from '../../internal/formatting/template/TemplateParts.js';
import * as CVTemplate from './index.js';
import * as CVTemplatePart from './TemplatePart/index.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/formatting/template/TemplateFormatter/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a CVTemplateFormatter
 *
 * @category Models
 */
export class Type<out PlaceholderTypes extends MTypes.NonPrimitive> extends MData.Class {
  /** Description of this CVTemplateFormatter */
  readonly description: string;

  /** Array of the TemplatePart's composing the template of this CVTemplateFormatter */
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
    description: `${template.syntheticDescription} Formatter\n\n${template.placeholderDescription}`,
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
    description: `${CVTemplateParts.getSyntheticDescription(templateParts)} Formatter\n\n${CVTemplateParts.getSyntheticDescription(templateParts)}`,
    templateParts,
  });

/**
 * Tries to format a record into a string according to the template used to construct 'self'.
 * Returns a `right` of a string upon success, a `left` otherwise.
 *
 * @category Formatting
 */
export const format =
  <PlaceholderTypes extends MTypes.NonPrimitive>(self: Type<PlaceholderTypes>) =>
  (record: PlaceholderTypes): Either.Either<string, MInputError.Type> =>
    pipe(
      self.templateParts,
      MArray.reduceUnlessLeft('', (result, templatePart) =>
        CVTemplatePart.isSeparator(templatePart) ?
          pipe(templatePart.value, MString.prepend(result), Either.right)
        : pipe(
            record,
            Record.get(templatePart.name),
            // This error should not happen due to typing
            Option.getOrThrowWith(
              () => new Error(`Abnormal error: no value passed for ${templatePart.label}`),
            ),
            templatePart.formatter.bind(templatePart),
            Either.map(MString.prepend(result)),
          ),
      ),
    );

/**
 * Same as `format` but throws in case of failure
 *
 * @category Formatting
 */

export const formatOrThrow: <PlaceholderTypes extends MTypes.NonPrimitive>(
  self: Type<PlaceholderTypes>,
) => (record: PlaceholderTypes) => string = flow(
  format,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);
