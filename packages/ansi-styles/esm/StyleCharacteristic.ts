/**
 * A StyleCharacteristic associates the attributes of a style characteristic to an index
 * representing that characteristic. For instance, a StyleCharacteristic could contain the Id
 * `Black` associated to the style characteristic `FgColor`, thus meaning that the text is to be
 * displayed in black.
 *
 * @since 0.0.1
 */

import { MArray, MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Array,
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
import * as Utils from './utils.js';

export const moduleTag = '@parischap/ansi-styles/StyleCharacteristic/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

namespace Category {
	/**
	 * Type that represents the category of a style characteristic.
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export enum Type {
		//Order matters because Style ids are created by concatenating the ids of the StyleCharacteristic's that compose them in this order: `BoldRed` sounds better than `RedBold`. We left a gap before `FgColor` in case we want to add new style characteristics.
		Intensity = 0,
		Italic = 1,
		Underlined = 2,
		StruckThrough = 3,
		Overlined = 4,
		Inversed = 5,
		Hidden = 6,
		Blink = 7,
		FgColor = 100,
		BgColor = 101
	}
}

/**
 * Type of a StyleCharacteristic
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Category that this style characteristic belongs to
	 *
	 * @since 0.0.1
	 */
	readonly category: Category.Type;

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
	readonly sequence: Utils.NonEmptySequence;

	/**
	 * SequenceString of this style characteristic (command string that produces this style, e.g
	 * `\x1b[1m` for bold)
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
	MArray.numberEquivalence(self.sequence, that.sequence);

/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const sameCategoryEquivalence: Equivalence.Equivalence<Type> = (self, that) =>
	that.category === self.category;

/** Prototype */
const _TypeIdHash = Hash.hash(TypeId);
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.sequence, Hash.array, Hash.combine(_TypeIdHash), Hash.cached(this));
	},
	[MInspectable.IdSymbol](this: Type) {
		return this.id;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/**
 * Order on Characteristics based on the `category` property
 *
 * @since 0.0.1
 * @category Orders
 */
export const byCategory: Order.Order<Type> = Order.mapInput(Number.Order, Struct.get('category'));

/**
 * Order on Characteristics based on the `id` property
 *
 * @since 0.0.1
 * @category Orders
 */
export const byId: Order.Order<Type> = Order.mapInput(String.Order, Struct.get('id'));

/**
 * Order on Characteristics based first on the `category` property then on the `id` property
 *
 * @since 0.0.1
 * @category Orders
 */
export const byCategoryAndId: Order.Order<Type> = Order.combine(byCategory, byId);

/**
 * Merges two sorted iterables of StyleCharacteristic's using the byCategoryAndId order
 *
 * @since 0.0.1
 * @category Utils
 */
export const mergeByCategoryAndId = MArray.mergeSorted(byCategoryAndId);

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/** Constructor */
const _fromIdCategoryAndSequence = (params: Omit<MTypes.Data<Type>, 'sequenceString'>): Type =>
	_make({
		...params,
		sequenceString: Utils.fromNonEmptySequenceToSequenceString(params.sequence)
	});

/**
 * Gets the `category` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const category: MTypes.OneArgFunction<Type, Category.Type> = Struct.get('category');

/**
 * Gets the `id` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * Gets the `sequence` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const sequence: MTypes.OneArgFunction<Type, Utils.NonEmptySequence> = Struct.get('sequence');

/**
 * Gets the `sequenceString` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const sequenceString: MTypes.OneArgFunction<Type, string> = Struct.get('sequenceString');

/**
 * Bold StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const bold: Type = _fromIdCategoryAndSequence({
	id: 'Bold',
	category: Category.Type.Intensity,
	sequence: Array.of(1)
});

/**
 * Dim StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const dim: Type = _fromIdCategoryAndSequence({
	id: 'Dim',
	category: Category.Type.Intensity,
	sequence: Array.of(2)
});

/**
 * Normal StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const normal: Type = _fromIdCategoryAndSequence({
	id: 'Normal',
	category: Category.Type.Intensity,
	sequence: Array.of(22)
});

/**
 * Italic StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const italic: Type = _fromIdCategoryAndSequence({
	id: 'Italic',
	category: Category.Type.Italic,
	sequence: Array.of(3)
});

/**
 * NotItalic StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notItalic: Type = _fromIdCategoryAndSequence({
	id: 'NotItalic',
	category: Category.Type.Italic,
	sequence: Array.of(23)
});

/**
 * Underlined StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const underlined: Type = _fromIdCategoryAndSequence({
	id: 'Underlined',
	category: Category.Type.Underlined,
	sequence: Array.of(4)
});

/**
 * NotUnderlined StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notUnderlined: Type = _fromIdCategoryAndSequence({
	id: 'NotUnderlined',
	category: Category.Type.Underlined,
	sequence: Array.of(24)
});

/**
 * StruckThrough StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const struckThrough: Type = _fromIdCategoryAndSequence({
	id: 'StruckThrough',
	category: Category.Type.StruckThrough,
	sequence: Array.of(9)
});

/**
 * NotStruckThrough StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notStruckThrough: Type = _fromIdCategoryAndSequence({
	id: 'NotStruckThrough',
	category: Category.Type.StruckThrough,
	sequence: Array.of(29)
});

/**
 * Overlined StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const overlined: Type = _fromIdCategoryAndSequence({
	id: 'Overlined',
	category: Category.Type.Overlined,
	sequence: Array.of(53)
});

/**
 * NotOverlined StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notOverlined: Type = _fromIdCategoryAndSequence({
	id: 'NotOverlined',
	category: Category.Type.Overlined,
	sequence: Array.of(55)
});

/**
 * Inversed StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const inversed: Type = _fromIdCategoryAndSequence({
	id: 'Inversed',
	category: Category.Type.Inversed,
	sequence: Array.of(7)
});

/**
 * NotInversed StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notInversed: Type = _fromIdCategoryAndSequence({
	id: 'NotInversed',
	category: Category.Type.Inversed,
	sequence: Array.of(27)
});

/**
 * Hidden StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const hidden: Type = _fromIdCategoryAndSequence({
	id: 'Hidden',
	category: Category.Type.Hidden,
	sequence: Array.of(8)
});

/**
 * NotHidden StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notHidden: Type = _fromIdCategoryAndSequence({
	id: 'NotHidden',
	category: Category.Type.Hidden,
	sequence: Array.of(28)
});

/**
 * SlowBlink StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const slowBlink: Type = _fromIdCategoryAndSequence({
	id: 'SlowBlink',
	category: Category.Type.Blink,
	sequence: Array.of(5)
});

/**
 * FastBlink StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const fastBlink: Type = _fromIdCategoryAndSequence({
	id: 'FastBlink',
	category: Category.Type.Blink,
	sequence: Array.of(6)
});

/**
 * NoBlink StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const noBlink: Type = _fromIdCategoryAndSequence({
	id: 'NoBlink',
	category: Category.Type.Blink,
	sequence: Array.of(25)
});

/**
 * Standard foreground color StyleCharacteristic instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const standardColor = ({
	id,
	offset
}: {
	readonly id: string;
	readonly offset: number;
}): Type =>
	_fromIdCategoryAndSequence({
		id,
		category: Category.Type.FgColor,
		sequence: Array.of(offset + 30)
	});

/**
 * Bright foreground color StyleCharacteristic instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const brightColor = ({
	id,
	offset
}: {
	readonly id: string;
	readonly offset: number;
}): Type =>
	_fromIdCategoryAndSequence({
		id: `Bright${id}`,
		category: Category.Type.FgColor,
		sequence: Array.of(offset + 90)
	});

/**
 * EightBit foreground color StyleCharacteristic instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const eightBitColor = ({ id, code }: { readonly id: string; readonly code: number }): Type =>
	_fromIdCategoryAndSequence({
		id: `EightBit${id}`,
		category: Category.Type.FgColor,
		sequence: Array.make(38, 5, code)
	});

/**
 * RGB foreground color StyleCharacteristic instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const RgbColor = ({
	id,
	redCode,
	greenCode,
	blueCode
}: {
	readonly id: string;
	readonly redCode: number;
	readonly greenCode: number;
	readonly blueCode: number;
}): Type =>
	_fromIdCategoryAndSequence({
		id: `Rgb${id}`,
		category: Category.Type.FgColor,
		sequence: Array.make(38, 2, redCode, greenCode, blueCode)
	});

/**
 * Default foreground color StyleCharacteristic instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultColor: Type = _fromIdCategoryAndSequence({
	id: 'DefaultColor',
	category: Category.Type.FgColor,
	sequence: Array.of(39)
});

/**
 * Namespace for StyleCharacteristic's used as background colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace Bg {
	/**
	 * Standard background color StyleCharacteristic instance maker
	 *
	 * @since 0.0.1
	 * @category Instance makers
	 */
	export const standardColor = ({
		id,
		offset
	}: {
		readonly id: string;
		readonly offset: number;
	}): Type =>
		_fromIdCategoryAndSequence({
			id: `Bg${id}`,
			category: Category.Type.BgColor,
			sequence: Array.of(offset + 40)
		});

	/**
	 * Bright background color StyleCharacteristic instance maker
	 *
	 * @since 0.0.1
	 * @category Instance makers
	 */
	export const brightColor = ({
		id,
		offset
	}: {
		readonly id: string;
		readonly offset: number;
	}): Type =>
		_fromIdCategoryAndSequence({
			id: `BgBright${id}`,
			category: Category.Type.BgColor,
			sequence: Array.of(offset + 100)
		});

	/**
	 * EightBit background color StyleCharacteristic instance maker
	 *
	 * @since 0.0.1
	 * @category Instance makers
	 */
	export const eightBitColor = ({
		id,
		code
	}: {
		readonly id: string;
		readonly code: number;
	}): Type =>
		_fromIdCategoryAndSequence({
			id: `BgEightBit${id}`,
			category: Category.Type.BgColor,
			sequence: Array.make(48, 5, code)
		});

	/**
	 * RGB background color StyleCharacteristic instance maker
	 *
	 * @since 0.0.1
	 * @category Instance makers
	 */
	export const RgbColor = ({
		id,
		redCode,
		greenCode,
		blueCode
	}: {
		readonly id: string;
		readonly redCode: number;
		readonly greenCode: number;
		readonly blueCode: number;
	}): Type =>
		_fromIdCategoryAndSequence({
			id: `BgRgb${id}`,
			category: Category.Type.BgColor,
			sequence: Array.make(48, 2, redCode, greenCode, blueCode)
		});

	/**
	 * BgUncolored StyleCharacteristic instance
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const defaultColor: Type = _fromIdCategoryAndSequence({
		id: 'BgDefaultColor',
		category: Category.Type.BgColor,
		sequence: Array.of(49)
	});
}
