/** Type that represents a value in its stringification context. */
import {
  MData,
  MDataEquivalenceBasedEquality,
  MString,
  MTypes,
  MTypesCategory,
} from '@parischap/effect-lib';
import { Array, Equivalence, Hash, pipe, Predicate, Struct } from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/internal/sytringification/Value/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

const _TypeIdHash = Hash.hash(_TypeId);

/**
 * Type that represents a PPValue
 *
 * @category Models
 */
export class Type<out V> extends MDataEquivalenceBasedEquality.Class {
  /** The value */
  readonly content: V;

  /** Type of content */
  readonly contentType: MTypesCategory.Type;

  /**
   * Depth of this value in the value to stringify: number of nested non-primitive values to open to
   * reach this value.
   */
  readonly depth: number;

  /** Depth of this value in the prototypal chain of a non-primitive value */
  readonly protoDepth: number;

  /**
   * Array of strings representing the key associated to that value if any. If this value is not in
   * a non-primitive value, i.e. it is itself the value to stringify, `stringKey` is an array
   * containing an empty string. If it is the value of one of the properties of a non-primitive
   * value, `stringKey` is a one-element array containing the property key converted to a string. If
   * it is one of the values of an iterable non-primitive value (e.g. a Map), `stringKey` is the
   * unstyled stringified key associated to the value (in a map, the key itself can be a
   * non-primitive)
   */
  readonly stringKey: MTypes.OverOne<string>;

  /** Same as stringKey, but all lines are joined with an empty string */
  readonly oneLineStringKey: string;

  /**
   * `true` if this value is the value of one of the properties of a non-primitive value whose
   * associated property key is a symbol. `false` otherwise.
   */
  readonly hasSymbolicKey: boolean;

  /**
   * `true` if this value is the value of one of the properties of a non-primitive value that is
   * enumerable. `false` otherwise.
   */
  readonly isEnumerable: boolean;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return moduleTag;
  }

  /** Class constructor */
  private constructor({
    content,
    contentType,
    depth,
    protoDepth,
    stringKey,
    oneLineStringKey,
    hasSymbolicKey,
    isEnumerable,
  }: MTypes.Data<Type<V>>) {
    super();
    this.content = content;
    this.contentType = contentType;
    this.depth = depth;
    this.protoDepth = protoDepth;
    this.stringKey = stringKey;
    this.oneLineStringKey = oneLineStringKey;
    this.hasSymbolicKey = hasSymbolicKey;
    this.isEnumerable = isEnumerable;
  }

  /** Constructor from the top value to stringify */
  static fromTopValue<V>(content: V): Type<V> {
    return new Type({
      content,
      contentType: MTypesCategory.fromValue(content),
      depth: 0,
      protoDepth: 0,
      stringKey: Array.of(''),
      oneLineStringKey: '',
      hasSymbolicKey: false,
      isEnumerable: false,
    });
  }

  /** Constructor from the property of a non-primitive value */
  static fromNonPrimitiveValueAndKey({
    nonPrimitive,
    key,
    depth,
    protoDepth,
  }: {
    readonly nonPrimitive: MTypes.NonPrimitive;
    readonly key: string | symbol;
    readonly depth: number;
    readonly protoDepth: number;
  }): Any {
    const oneLineStringKey = MString.fromNonNullablePrimitive(key);
    const content: unknown = nonPrimitive[key];
    return new Type({
      content,
      contentType: MTypesCategory.fromValue(content),
      depth,
      protoDepth,
      stringKey: Array.of(oneLineStringKey),
      oneLineStringKey,
      hasSymbolicKey: MTypes.isSymbol(key),
      isEnumerable: Object.prototype.propertyIsEnumerable.call(nonPrimitive, key),
    });
  }

  /** Constructor from a value extracted from an iterable non-primitive value (not a string) */
  static fromIterable<V>({
    content,
    stringKey,
    depth,
  }: {
    readonly content: V;
    readonly stringKey: MTypes.OverOne<string>;
    readonly depth: number;
  }): Type<V> {
    return new Type({
      content,
      contentType: MTypesCategory.fromValue(content),
      depth,
      protoDepth: 0,
      stringKey,
      oneLineStringKey: Array.join(stringKey, ''),
      hasSymbolicKey: false,
      isEnumerable: true,
    });
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return pipe(this.content, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
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
 * Type that represents any value in its stringification context
 *
 * @category Models
 */
export interface Any extends Type<unknown> {}

/**
 * Type that represents a primitive value in its stringification context
 *
 * @category Models
 */
export interface Primitive extends Type<MTypes.Primitive> {}

/**
 * Type that represents a non-primitive value in its stringification context
 *
 * @category Models
 */
export interface NonPrimitive extends Type<MTypes.NonPrimitive> {}

/**
 * Value equivalence based on strict equality of the content properties. Used for cycle detection
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Any> = (self, that) =>
  that.content === self.content;

/**
 * Constructor from the top value to stringify
 *
 * @category Constructors
 */
export const fromTopValue = <V>(content: V): Type<V> => Type.fromTopValue(content);

/**
 * Constructor from the property of a non-primitive value
 *
 * @category Constructors
 */
export const fromNonPrimitiveValueAndKey = (params: {
  readonly nonPrimitive: MTypes.NonPrimitive;
  readonly key: string | symbol;
  readonly depth: number;
  readonly protoDepth: number;
}): Any => Type.fromNonPrimitiveValueAndKey(params);

/**
 * Constructor from a value extracted from an iterable non-primitive value
 *
 * @category Constructors
 */
export const fromIterable = <V>(params: {
  readonly content: V;
  readonly stringKey: MTypes.OverOne<string>;
  readonly depth: number;
}): Type<V> => Type.fromIterable(params);

/**
 * Type guard
 *
 * @category Guards
 */
export const isPrimitive = (u: Any): u is Primitive => MTypesCategory.isPrimitive(u.contentType);

/**
 * Type guard
 *
 * @category Guards
 */
export const isNonPrimitive = (u: Any): u is NonPrimitive =>
  MTypesCategory.isNonPrimitive(u.contentType);

/**
 * Type guard
 *
 * @category Guards
 */
export const isFunction = (u: Any): u is Type<MTypes.AnyFunction> =>
  MTypesCategory.isFunction(u.contentType);

/**
 * Returns the `content` property of `self`
 *
 * @category Destructors
 */
export const content: <V>(self: Type<V>) => V = Struct.get('content');

/**
 * Returns the `contentType` property of `self`
 *
 * @category Destructors
 */
export const contentType: MTypes.OneArgFunction<Any, MTypesCategory.Type> =
  Struct.get('contentType');

/**
 * Returns the `depth` property of `self`
 *
 * @category Destructors
 */
export const depth: MTypes.OneArgFunction<Any, number> = Struct.get('depth');

/**
 * Returns the `protoDepth` property of `self`
 *
 * @category Destructors
 */
export const protoDepth: MTypes.OneArgFunction<Any, number> = Struct.get('protoDepth');

/**
 * Returns the `stringKey` property of `self`
 *
 * @category Destructors
 */
export const stringKey: MTypes.OneArgFunction<Any, MTypes.OverOne<string>> = Struct.get(
  'stringKey',
);

/**
 * Returns the `oneLineStringKey` property of `self`
 *
 * @category Destructors
 */
export const oneLineStringKey: MTypes.OneArgFunction<Any, string> = Struct.get('oneLineStringKey');

/**
 * Returns the `hasSymbolicKey` property of `self`
 *
 * @category Destructors
 */
export const hasSymbolicKey: MTypes.OneArgFunction<Any, boolean> = Struct.get('hasSymbolicKey');

/**
 * Returns the `isEnumerable` property of `self`
 *
 * @category Destructors
 */
export const isEnumerable: MTypes.OneArgFunction<Any, boolean> = Struct.get('isEnumerable');
