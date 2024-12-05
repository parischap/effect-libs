/**
 * A Characteristic associates the attributes of a style characteristic to an index representing
 * that characteristic. For instance, a Characteristic could contain the Id `Black` associated to
 * the style characteristic `FgColor`, thus meaning that the text is to be displayed in black.
 *
 * @since 0.0.1
 */

import { MArray, MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Equal,
	Equivalence,
	Hash,
	Number,
	Order,
	pipe,
	Pipeable,
	Predicate,
	String,
	Struct
} from 'effect';
import * as ASCharacteristicIndex from './CharacteristicIndex.js';
import * as ASSequence from './Sequence.js';
import * as ASSequenceString from './SequenceString.js';

export const moduleTag = '@parischap/ansi-styles/Characteristic/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type of a style Characteristic
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Index of the style charcateristic
	 *
	 * @since 0.0.1
	 */
	readonly index: ASCharacteristicIndex.Type;

	/**
	 * Id of this style characteristic
	 *
	 * @since 0.0.1
	 */
	readonly id: string;

	/**
	 * Sequence of this style characteristic
	 *
	 * @since 0.0.1
	 */
	readonly sequence: ASSequence.NonEmptyType;

	/**
	 * SequenceString of this style characteristic
	 *
	 * @since 0.0.1
	 */
	readonly sequenceString: string;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */

export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	that.index === self.index && that.id === self.id;

/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const sameIndexEquivalence: Equivalence.Equivalence<Type> = (self, that) =>
	that.index === self.index;

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(
			this.index,
			Hash.hash,
			Hash.combine(Hash.hash(this.id)),
			Hash.optimize,
			Hash.cached(this)
		);
	},
	[MInspectable.IdSymbol](this: Type) {
		return this.id;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/**
 * Order on Characteristics based on the index
 *
 * @since 0.0.1
 * @category Orders
 */
export const byIndex: Order.Order<Type> = Order.mapInput(Number.Order, Struct.get('index'));

/**
 * Order on Characteristics based on the id
 *
 * @since 0.0.1
 * @category Orders
 */
export const byId: Order.Order<Type> = Order.mapInput(String.Order, Struct.get('id'));

/**
 * Order on Characteristics based first on the index then on the id
 *
 * @since 0.0.1
 * @category Orders
 */
export const byIndexAndId: Order.Order<Type> = Order.combine(byIndex, byId);

/**
 * Merges two sorted iterables of Characteristic's using the byIndexAndId order
 *
 * @since 0.0.1
 * @category Utils
 */
export const mergeByIndexAndId = MArray.mergeSorted(byIndexAndId);

/**
 * Substracts an iterable of Characteristic's from another one using the
 *
 * @since 0.0.1
 * @category Utils
 */
export const differenceByIndex = MArray.differenceSorted(byIndex);

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Gets the index of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const index: MTypes.OneArgFunction<Type, ASCharacteristicIndex.Type> = Struct.get('index');

/**
 * Gets the id of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * Gets the sequence of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const sequence: MTypes.OneArgFunction<Type, ASSequence.NonEmptyType> =
	Struct.get('sequence');

/**
 * Gets the sequenceString of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const sequenceString: MTypes.OneArgFunction<Type, string> = Struct.get('sequenceString');

/**
 * Bold Characteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const bold: Type = _make({
	index: ASCharacteristicIndex.Type.Intensity,
	id: 'Bold',
	sequence: ASSequence.bold,
	sequenceString: ASSequenceString.bold
});

/**
 * Dim Characteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const dim: Type = _make({
	index: ASCharacteristicIndex.Type.Intensity,
	id: 'Dim',
	sequence: ASSequence.dim,
	sequenceString: ASSequenceString.dim
});

/**
 * Italic Characteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const italic: Type = _make({
	index: ASCharacteristicIndex.Type.Italic,
	id: 'Italic',
	sequence: ASSequence.italic,
	sequenceString: ASSequenceString.italic
});

/**
 * Underlined Characteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const underlined: Type = _make({
	index: ASCharacteristicIndex.Type.Underlined,
	id: 'Underlined',
	sequence: ASSequence.underlined,
	sequenceString: ASSequenceString.underlined
});

/**
 * Struck-through Characteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const struckThrough: Type = _make({
	index: ASCharacteristicIndex.Type.StruckThrough,
	id: 'StruckThrough',
	sequence: ASSequence.struckThrough,
	sequenceString: ASSequenceString.struckThrough
});

/**
 * Overlined Characteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const overlined: Type = _make({
	index: ASCharacteristicIndex.Type.Overlined,
	id: 'Overlined',
	sequence: ASSequence.overlined,
	sequenceString: ASSequenceString.overlined
});

/**
 * Inversed Characteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const inversed: Type = _make({
	index: ASCharacteristicIndex.Type.Inversed,
	id: 'Inversed',
	sequence: ASSequence.inversed,
	sequenceString: ASSequenceString.inversed
});

/**
 * Hidden Characteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const hidden: Type = _make({
	index: ASCharacteristicIndex.Type.Hidden,
	id: 'Hidden',
	sequence: ASSequence.hidden,
	sequenceString: ASSequenceString.hidden
});

/**
 * Slow blink Characteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const slowBlink: Type = _make({
	index: ASCharacteristicIndex.Type.Blink,
	id: 'SlowBlink',
	sequence: ASSequence.slowBlink,
	sequenceString: ASSequenceString.slowBlink
});

/**
 * Fast blink Characteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const fastBlink: Type = _make({
	index: ASCharacteristicIndex.Type.Blink,
	id: 'FastBlink',
	sequence: ASSequence.fastBlink,
	sequenceString: ASSequenceString.fastBlink
});

/**
 * Standard foreground color Characteristic instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const standardFgColor = ({
	id,
	offset
}: {
	readonly id: string;
	readonly offset: number;
}): Type =>
	_make({
		index: ASCharacteristicIndex.Type.FgColor,
		id,
		sequence: ASSequence.standardFgColor(offset),
		sequenceString: ASSequenceString.standardFgColor(offset)
	});

/**
 * Bright foreground color Characteristic instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const brightFgColor = ({
	id,
	offset
}: {
	readonly id: string;
	readonly offset: number;
}): Type =>
	_make({
		index: ASCharacteristicIndex.Type.FgColor,
		id,
		sequence: ASSequence.brightFgColor(offset),
		sequenceString: ASSequenceString.brightFgColor(offset)
	});

/**
 * EightBit foreground color Characteristic instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const eightBitFgColor = ({
	id,
	code
}: {
	readonly id: string;
	readonly code: number;
}): Type =>
	_make({
		index: ASCharacteristicIndex.Type.FgColor,
		id,
		sequence: ASSequence.eightBitFgColor(code),
		sequenceString: ASSequenceString.eightBitFgColor(code)
	});

/**
 * RGB foreground color Characteristic instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const RgbFgColor = (params: {
	readonly id: string;
	readonly redCode: number;
	readonly greenCode: number;
	readonly blueCode: number;
}): Type =>
	_make({
		index: ASCharacteristicIndex.Type.FgColor,
		id: params.id,
		sequence: ASSequence.RgbFgColor(params),
		sequenceString: ASSequenceString.RgbFgColor(params)
	});

/**
 * Standard background color Characteristic instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const standardBgColor = ({
	id,
	offset
}: {
	readonly id: string;
	readonly offset: number;
}): Type =>
	_make({
		index: ASCharacteristicIndex.Type.BgColor,
		id,
		sequence: ASSequence.standardBgColor(offset),
		sequenceString: ASSequenceString.standardBgColor(offset)
	});

/**
 * Bright background color Characteristic instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const brightBgColor = ({
	id,
	offset
}: {
	readonly id: string;
	readonly offset: number;
}): Type =>
	_make({
		index: ASCharacteristicIndex.Type.BgColor,
		id,
		sequence: ASSequence.brightBgColor(offset),
		sequenceString: ASSequenceString.brightBgColor(offset)
	});

/**
 * EightBit background color Characteristic instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const eightBitBgColor = ({
	id,
	code
}: {
	readonly id: string;
	readonly code: number;
}): Type =>
	_make({
		index: ASCharacteristicIndex.Type.BgColor,
		id,
		sequence: ASSequence.eightBitBgColor(code),
		sequenceString: ASSequenceString.eightBitBgColor(code)
	});

/**
 * RGB background color Characteristic instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const RgbBgColor = (params: {
	readonly id: string;
	readonly redCode: number;
	readonly greenCode: number;
	readonly blueCode: number;
}): Type =>
	_make({
		index: ASCharacteristicIndex.Type.BgColor,
		id: params.id,
		sequence: ASSequence.RgbBgColor(params),
		sequenceString: ASSequenceString.RgbBgColor(params)
	});
