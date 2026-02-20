/**
 * This module implements a `CVTemplate` which is a model of a text that has always the same
 * structure. In such a text, there are immutable and mutable parts. Let's take the following two
 * texts as an example:
 *
 * - Text1 = "John is a 47-year-old man."
 * - Text2 = "Jenny is a 5-year-old girl."
 *
 * These two texts obviously share the same structure which is the template:
 *
 * "Placeholder1 is a Placeholder2-year-old Placeholder3".
 *
 * Placeholder1, Placeholder2 and Placeholder3 are the mutable parts of the template. They contain
 * valuable information. We call them `CVTemplatePlaceholder`'s.
 *
 * " is a ", "-year-old " and "." are the immutable parts of the template. We call them
 * `CVTemplateSeperator`'s.
 *
 * From a text with the above structure, we can extract the values of Placeholder1, Placeholder2,
 * and Placeholder3. In the present case:
 *
 * - For text1: { Placeholder1 : 'John', Placeholder2 : '47', Placeholder3 : 'man' }
 * - For text2: { Placeholder1 : 'Jenny', Placeholder2 : '5', Placeholder3 : 'girl'}
 *
 * Extracting the values of placeholders from a text according to a template is called parsing. The
 * result of parsing is an object whose properties are named after the name of the placeholders they
 * represent.
 *
 * Inversely, given a template and the values of the placeholders that compose it (provided as the
 * properties of an object), we can generate a text. This is called formatting. In the present case,
 * with the object:
 *
 * { Placeholder1 : 'Tom', Placeholder2 : '15', Placeholder3 : 'boy' }
 *
 * We will obtain the text: "Tom is a 15-year-old boy."
 *
 * Once you have created a CVTemplate, you must feed it to a CVTemplateParser or
 * CVTemplateFormatter.
 *
 * Note that `Effect` does provide the `Schema.TemplateLiteralParser` API which partly addresses the
 * same problem. But there are some limitations to that API. For instance, template literal types
 * cannot represent a fixed-length string or a string composed only of capital letters... It is for
 * instance impossible to represent a date in the form YYYYMMDD with the
 * `Schema.TemplateLiteralParser`. A schema in the form `const schema =
 * Schema.TemplateLiteralParser(Schema.NumberFromString,Schema.NumberFromString,
 * Schema.NumberFromString)` does not work as the first NumberFromString combinator reads the whole
 * date
 */

import * as MData from '@parischap/effect-lib/MData';
import * as MTypes from '@parischap/effect-lib/MTypes';
import * as Struct from 'effect/Struct';
import * as CVTemplateParts from '../../internal/Formatting/Template/TemplateParts.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/Formatting/Template/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a CVTemplate
 *
 * @category Models
 */
export class Type<out PlaceholderTypes extends MTypes.NonPrimitive> extends MData.Class {
  /** Synthetic description of self */
  readonly syntheticDescription: string;

  /** Placeholdr description of self */
  readonly placeholderDescription: string;

  /** Array of the TemplatePart's composing this template */
  readonly templateParts: CVTemplateParts.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type<PlaceholderTypes>) {
      return `${this.syntheticDescription}\n\n${this.placeholderDescription}`;
    };
  }

  /** Class constructor */
  private constructor({
    syntheticDescription,
    placeholderDescription,
    templateParts,
  }: MTypes.Data<Type<PlaceholderTypes>>) {
    super();
    this.syntheticDescription = syntheticDescription;
    this.placeholderDescription = placeholderDescription;
    this.templateParts = templateParts;
  }

  /** Static constructor */
  static make<const PS extends CVTemplateParts.Type>(
    templateParts: PS,
  ): Type<CVTemplateParts.ToPlaceHolderTypes<PS>> {
    return new Type({
      syntheticDescription: CVTemplateParts.getSyntheticDescription(templateParts),
      placeholderDescription: CVTemplateParts.getPlaceholderDescription(templateParts),
      templateParts,
    });
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = <const PS extends CVTemplateParts.Type>(...templateParts: PS) =>
  Type.make(templateParts);

/**
 * Returns the `templateParts` property of `self`
 *
 * @category Destructors
 */
export const templateParts: <PlaceholderTypes extends MTypes.NonPrimitive>(
  self: Type<PlaceholderTypes>,
) => CVTemplateParts.Type = Struct.get('templateParts');
