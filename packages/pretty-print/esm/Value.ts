/**
 * Type that represents a value in its stringification context.
 *
 * This module provides several Order instances to sort Value's according to your needs
 */
import { MInspectable, MPipeable, MString, MTypes } from '@parischap/effect-lib';
import {
  Array,
  Equal,
  Equivalence,
  Hash,
  Inspectable,
  pipe,
  Pipeable,
  Predicate,
  Struct,
  Types,
} from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/Value/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a Value
 *
 * @category Models
 */
export interface Type<out V> extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
  /** The value */
  readonly content: V;

  /** Type of content */
  readonly contentType: MTypes.Category;

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
   * unstyled stringified key associated to the value.
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

  /** @internal */
  readonly [_TypeId]: {
    readonly _V: Types.Covariant<V>;
  };
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
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Any => Predicate.hasProperty(u, _TypeId);

/**
 * Value equivalence based on strict equality of the content properties. Used for cycle detection
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Any> = (self, that) =>
  that.content === self.content;

/** Prototype */
const _TypeIdHash = Hash.hash(_TypeId);
const _proto: MTypes.Proto<Type<never>> = {
  [_TypeId]: { _V: MTypes.covariantValue },
  [Equal.symbol]<V>(this: Type<V>, that: unknown): boolean {
    return has(that) && equivalence(this, that);
  },
  [Hash.symbol]<V>(this: Type<V>) {
    return pipe(this.content, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
  },
  ...MInspectable.BaseProto(moduleTag),
  ...MPipeable.BaseProto,
};

/** Constructor */
const _make = <V>(params: MTypes.Data<Type<V>>): Type<V> =>
  MTypes.objectFromDataAndProto(_proto, params);

/**
 * Constructor from the top value to stringify
 *
 * @category Constructors
 */
export const fromTopValue = <V>(content: V): Type<V> =>
  _make({
    content,
    contentType: MTypes.Category.fromValue(content),
    depth: 0,
    protoDepth: 0,
    stringKey: Array.of(''),
    oneLineStringKey: '',
    hasSymbolicKey: false,
    isEnumerable: false,
  });

/**
 * Constructor from the property of a non-primitive value
 *
 * @category Constructors
 */
export const fromNonPrimitiveValueAndKey = ({
  nonPrimitiveContent,
  key,
  depth,
  protoDepth,
}: {
  readonly nonPrimitiveContent: MTypes.NonPrimitive;
  readonly key: string | symbol;
  readonly depth: number;
  readonly protoDepth: number;
}): Any => {
  const oneLineStringKey = MString.fromNonNullablePrimitive(key);
  const content: unknown = nonPrimitiveContent[key];
  return _make({
    content,
    contentType: MTypes.Category.fromValue(content),
    depth,
    protoDepth,
    stringKey: Array.of(oneLineStringKey),
    oneLineStringKey,
    hasSymbolicKey: MTypes.isSymbol(key),
    isEnumerable: Object.prototype.propertyIsEnumerable.call(nonPrimitiveContent, key),
  });
};

/**
 * Constructor from a value extracted from an iterable non-primitive value
 *
 * @category Constructors
 */
export const fromIterable = <V>({
  content,
  stringKey,
  depth,
}: {
  readonly content: V;
  readonly stringKey: MTypes.OverOne<string>;
  readonly depth: number;
}): Type<V> => {
  return _make({
    content,
    contentType: MTypes.Category.fromValue(content),
    depth,
    protoDepth: 0,
    stringKey,
    oneLineStringKey: Array.join(stringKey, ''),
    hasSymbolicKey: false,
    isEnumerable: true,
  });
};

/**
 * Type guard
 *
 * @category Guards
 */
export const isPrimitive = (u: Any): u is Primitive => MTypes.Category.isPrimitive(u.contentType);

/**
 * Type guard
 *
 * @category Guards
 */
export const isNonPrimitive = (u: Any): u is NonPrimitive =>
  MTypes.Category.isNonPrimitive(u.contentType);

/**
 * Type guard
 *
 * @category Guards
 */
export const isFunction = (u: Any): u is Type<MTypes.AnyFunction> =>
  MTypes.Category.isFunction(u.contentType);

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
export const contentType: MTypes.OneArgFunction<Any, MTypes.Category> = Struct.get('contentType');

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
