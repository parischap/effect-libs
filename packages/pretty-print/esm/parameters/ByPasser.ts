/**
 * This module implements a type that defines a specific stringification process for certain values
 * (the normal stringification process is by-passed, hence its name). For instance, you may prefer
 * printing a Date as a string rather than as an object with all its technical properties.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import {
  MData,
  MDataEquivalenceBasedEquality,
  MFunction,
  MRecord,
  MRegExp,
  MTypes,
} from '@parischap/effect-lib';

import { ASContextStyler, ASText } from '@parischap/ansi-styles';
import { Array, Equivalence, flow, Hash, Option, pipe, Predicate, String, Struct } from 'effect';
import * as PPValue from '../internal/stringification/Value.js';
import * as PPStringifiedValue from '../stringification/StringifiedValue.js';
import * as PPByPasserAction from './ByPasserAction.js';
import * as PPStyleMap from './StyleMap.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/ByPasser/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a PPByPasser
 *
 * @category Models
 */
export class Type extends MDataEquivalenceBasedEquality.Class {
  /** Id of this PPByPasser instance. Useful for equality and debugging */
  readonly id: string;

  /** Action of this PPByPasser */
  readonly action: PPByPasserAction.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.id;
    };
  }

  /** Class constructor */
  private constructor({ id, action }: MTypes.Data<Type>) {
    super();
    this.id = id;
    this.action = action;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
  }

  /** Function that implements the equivalence of `this` and `that` */
  [MDataEquivalenceBasedEquality.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  [MDataEquivalenceBasedEquality.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
    return Predicate.hasProperty(that, _TypeId);
  }
  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Constructor of a PPByPasser
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type => Type.make(params);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/**
 * Returns the `id` property of `self`
 *
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * Returns the `action` property of `self`
 *
 * @category Destructors
 */
export const action: MTypes.OneArgFunction<Type, PPByPasserAction.Type> = Struct.get('action');

/**
 * PPByPasser instance that does not bypass any value
 *
 * @category Instances
 */
export const empty: Type = make({
  id: 'Empty',
  action: () => () => Option.none(),
});

/**
 * PPByPasser instance that has the following behavior:
 *
 * - For any function: a some of the function name surrounded by the function delimiters and the
 *   message delimiters. If the function name is an empty string, `anonymous` is used instead.
 * - For any other value: returns a `none`
 *
 * @category Instances
 */
export const functionToName: Type = make({
  id: 'FunctionToName',
  action: (styleMap) => {
    const messageTextFormatter = PPStyleMap.get(styleMap, 'Message');

    const functionNameStartDelimiterMarkShower = markShowerConstructor(
      'FunctionNameStartDelimiter',
    );
    const functionNameEndDelimiterMarkShower = markShowerConstructor('FunctionNameEndDelimiter');
    const messageStartDelimiterMarkShower = markShowerConstructor('MessageStartDelimiter');
    const messageEndDelimiterMarkShower = markShowerConstructor('MessageEndDelimiter');

    return (value) =>
      pipe(
        value,
        Option.liftPredicate(PPValue.isFunction),
        Option.map(
          flow(
            PPValue.content,
            MFunction.name,
            Option.liftPredicate(String.isNonEmpty),
            Option.getOrElse(() => 'anonymous'),
            ASContextStyler.toStyle(messageTextFormatter)(value),
            ASText.surround(
              ASContextStyler.toStyle(functionNameStartDelimiterMarkShower)(value),
              functionNameEndDelimiterMarkShower(value),
            ),
            ASText.surround(
              messageStartDelimiterMarkShower(value),
              messageEndDelimiterMarkShower(value),
            ),
            PPStringifiedValue.fromText,
          ),
        ),
      );
  },
});

/**
 * PPByPasser instance that has the following behavior:
 *
 * - For any non-primitive value which is not an iterable or a function : tries to call the toString
 *   method (only if it is different from Object.prototype.toString). Returns a `some` of the result
 *   if successful. Returns a `none` otherwise. Calling the .toString method on an Iterable will not
 *   be as efficient as using the `FromValueIterable` or `FromKeyValueIterable` property sources.
 *   Calling the .toString method on a function will not work properly.
 * - For any other value: returns a `none`
 *
 * @category Instances
 */
export const objectToString: Type = make({
  id: 'ObjectToString',
  action: ({ valueBasedStylerConstructor }) => {
    const toStringedObjectTextFormatter = valueBasedStylerConstructor('ToStringedObject');

    return (value) => {
      const inContextToStringedObjectTextFormatter = toStringedObjectTextFormatter(value);
      return pipe(
        value.content,
        Option.liftPredicate(MTypes.isNonPrimitive),
        Option.filter(Predicate.not(Predicate.or(MTypes.isIterable, MTypes.isFunction))),
        Option.flatMap(
          flow(
            MRecord.tryZeroParamStringFunction({
              functionName: 'toString',
              /* oxlint-disable-next-line @typescript-eslint/unbound-method */
              exception: Object.prototype.toString,
            }),
          ),
        ),
        Option.map(
          flow(
            String.split(MRegExp.lineBreak),
            Array.map((s, _i) => inContextToStringedObjectTextFormatter(s)),
          ),
        ),
      );
    };
  },
});
