import { pipe } from 'effect';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Record from 'effect/Record';
import * as Result from 'effect/Result';
import * as Struct from 'effect/Struct';

/**
 * This module implements a `CVTemplateFormatter`, i.e. an object that is capable of converting a a
 * record of values to a string according to the `CVTemplate` that was used to construct it. If you
 * don't want to build a `CVTemplate` beforehand, you can also construct a `CVTemplateFormatter`
 * directly from `CVTemplatePart`'s
 */
import * as MArray from '@parischap/effect-lib/MArray';
import * as MData from '@parischap/effect-lib/MData';
import type * as MInputError from '@parischap/effect-lib/MInputError';
import * as MString from '@parischap/effect-lib/MString';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import type * as CVTemplate from './Template.js';

import * as CVTemplateParts from '../../internal/formatting/template/TemplateParts.js';
import * as CVTemplatePart from './TemplatePart/TemplatePart.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/formatting/template/TemplateFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a CVTemplateFormatter
 *
 * @category Models
 */
export class Type<in PlaceholderTypes extends MTypes.NonPrimitive> extends MData.Class {
  /** Description of this CVTemplateFormatter */
  readonly description: string;

  /** Function that tries to format a record according to the template passed to build this formatter */
  readonly format: MTypes.OneArgFunction<PlaceholderTypes, Result.Result<string, MInputError.Type>>;

  /** Same as `format` but throws in case of failure */

  readonly formatOrThrow: MTypes.OneArgFunction<PlaceholderTypes, string>;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type<PlaceholderTypes>) {
      return this.description;
    };
  }

  /** Class constructor */
  private constructor({ description, format, formatOrThrow }: MTypes.Data<Type<PlaceholderTypes>>) {
    super();
    this.description = description;
    this.format = format;
    this.formatOrThrow = formatOrThrow;
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
  }): Type<any> {
    const format = (record: MTypes.NonPrimitive) =>
      pipe(
        templateParts,
        MArray.reduceUnlessLeft('', (result, templatePart) =>
          CVTemplatePart.isSeparator(templatePart)
            ? pipe(templatePart.value, MString.prepend(result), Result.succeed)
            : pipe(
                record,
                Record.get(templatePart.name),
                // This error should not happen due to typing
                Option.getOrThrowWith(
                  () => new Error(`Abnormal error: no value passed for ${templatePart.label}`),
                ),
                templatePart.formatter.bind(templatePart),
                Result.map(MString.prepend(result)),
              ),
        ),
      );

    return new Type({
      description: `${syntheticDescription} formatter\n\n${placeholderDescription}`,
      format,
      formatOrThrow: Function.compose(format, Result.getOrThrowWith(Function.identity)),
    });
  }

  /** Constructor of a CVTemplateFormatter from a CVTemplate */
  static fromTemplate<PlaceholderTypes extends MTypes.NonPrimitive>(
    this: void,
    template: CVTemplate.Type<PlaceholderTypes>,
  ): Type<PlaceholderTypes> {
    return Type.make({
      syntheticDescription: template.syntheticDescription,
      placeholderDescription: template.placeholderDescription,
      templateParts: template.templateParts,
    });
  }

  /** Constructor of a CVTemplateFormatter directly from CVTemplateParts */
  static fromTemplateParts<const PS extends CVTemplateParts.Type>(
    this: void,
    ...templateParts: PS
  ): Type<CVTemplateParts.ToPlaceHolderTypes<PS>> {
    return Type.make({
      syntheticDescription: CVTemplateParts.getSyntheticDescription(templateParts),
      placeholderDescription: CVTemplateParts.getPlaceholderDescription(templateParts),
      templateParts: templateParts,
    });
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Constructor of a CVTemplateFormatter from a CVTemplate
 *
 * @category Constructors
 */
export const { fromTemplate } = Type;

/**
 * Constructor of a CVTemplateFormatter directly from CVTemplateParts
 *
 * @category Constructors
 */
export const { fromTemplateParts } = Type;

/**
 * Returns the `format` property of `self`.
 *
 * @category Getters
 */
export const format: <PlaceholderTypes extends MTypes.NonPrimitive>(
  self: Type<PlaceholderTypes>,
) => Type<PlaceholderTypes>['format'] = Struct.get('format');

/**
 * Returns the `formatOrThrow` property of `self`.
 *
 * @category Getters
 */
export const formatOrThrow: <PlaceholderTypes extends MTypes.NonPrimitive>(
  self: Type<PlaceholderTypes>,
) => Type<PlaceholderTypes>['formatOrThrow'] = Struct.get('formatOrThrow');

/**
 * Same as `format` but throws in case of failure
 *
 * @category Formatting
 */
