/**
 * A StyleCharacteristics is a sorted array of StyleCharacteristic's (see StyleCharacteristic.ts).
 *
 * @since 0.0.1
 */

import {
	MFunction,
	MInspectable,
	MPipeable,
	MString,
	MStruct,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Boolean,
	Equal,
	Equivalence,
	flow,
	Function,
	Hash,
	Number,
	Option,
	pipe,
	Pipeable,
	Predicate,
	Struct
} from 'effect';
import * as ASAnsiString from './AnsiString.js';
import * as ASColor from './Color.js';

export const moduleTag = '@parischap/ansi-styles/StyleCharacteristics/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

const _falseSome = Option.some(false);
const _trueSome = Option.some(true);

/**
 * Namespace of an optional StyleCharcateristic with two possible values
 *
 * @since 0.0.1
 * @category Models
 */
namespace BoolOption {
	/**
	 * Type of a BoolOption
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export type Type = Option.Option<boolean>;

	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const equivalence = Option.getEquivalence(Boolean.Equivalence);

	/**
	 * Returns the id of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const toId = (
		onFalse: Function.LazyArg<string>,
		onTrue: Function.LazyArg<string>
	): MTypes.OneArgFunction<Type, string> =>
		Option.match({
			onNone: MFunction.constEmptyString,
			onSome: Boolean.match({
				onFalse,
				onTrue
			})
		});

	/**
	 * Returns the sequence corresponding to `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const toSequence = (
		onFalse: number,
		onTrue: number
	): MTypes.OneArgFunction<Type, ASAnsiString.Sequence> =>
		Option.match({
			onNone: Function.constant(Array.empty()),
			onSome: Boolean.match({
				onFalse: pipe(onFalse, Array.of, Function.constant),
				onTrue: pipe(onTrue, Array.of, Function.constant)
			})
		});

	/**
	 * Builds a new StyleCharacteristic by merging `self` and `that`. In case of conflict, the `that`
	 * Characteristic will prevail.
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const mergeUnder = (that: Type): MTypes.OneArgFunction<Type, Type> =>
		Option.orElse(Function.constant(that));

	/**
	 * Builds a new Characteristic by substracting from `that` from `self`
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const difference =
		(that: Type) =>
		(self: Type): Type =>
			equivalence(self, that) ? Option.none() : self;
}

/**
 * Namespace of an optional color StyleCharcateristic
 *
 * @since 0.0.1
 * @category Models
 */
namespace ColorOption {
	/**
	 * Type of a ColorOption
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export type Type = Option.Option<Option.Option<ASColor.Type>>;

	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const equivalence = Option.getEquivalence(Option.getEquivalence(ASColor.equivalence));

	/**
	 * Returns the id of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const toId = (prefix: string): MTypes.OneArgFunction<Type, string> =>
		Option.match({
			onNone: MFunction.constEmptyString,
			onSome: flow(
				Option.match({
					onNone: Function.constant('DefaultColor'),
					onSome: ASColor.toId
				}),
				MString.prepend(prefix)
			)
		});

	/**
	 * Returns the sequence corresponding to `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const toSequence = (offset: number): MTypes.OneArgFunction<Type, ASAnsiString.Sequence> =>
		Option.match({
			onNone: Function.constant(Array.empty()),
			onSome: flow(
				Option.match({
					onNone: pipe(39, Array.of, Function.constant),
					onSome: ASColor.toSequence
				}),
				Array.modifyNonEmptyHead(Number.sum(offset))
			)
		});

	/**
	 * Builds a new StyleCharacteristic by merging `self` and `that`. In case of conflict, the `that`
	 * Characteristic will prevail.
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const mergeUnder = (that: Type): MTypes.OneArgFunction<Type, Type> =>
		Option.orElse(Function.constant(that));

	/**
	 * Builds a new Characteristic by substracting from `that` from `self`
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const difference =
		(that: Type) =>
		(self: Type): Type =>
			equivalence(self, that) ? Option.none() : self;
}
/**
 * Type of a StyleCharacteristics
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * IsBold
	 *
	 * @since 0.0.1
	 */
	readonly isBold: BoolOption.Type;

	/**
	 * IsDim
	 *
	 * @since 0.0.1
	 */
	readonly isDim: BoolOption.Type;

	/**
	 * IsItalic
	 *
	 * @since 0.0.1
	 */
	readonly isItalic: BoolOption.Type;

	/**
	 * IsUnderlined
	 *
	 * @since 0.0.1
	 */
	readonly isUnderlined: BoolOption.Type;

	/**
	 * IsStruckThrough
	 *
	 * @since 0.0.1
	 */
	readonly isStruckThrough: BoolOption.Type;

	/**
	 * IsOverlined
	 *
	 * @since 0.0.1
	 */
	readonly isOverlined: BoolOption.Type;

	/**
	 * IsInversed
	 *
	 * @since 0.0.1
	 */
	readonly isInversed: BoolOption.Type;

	/**
	 * IsHidden
	 *
	 * @since 0.0.1
	 */
	readonly isHidden: BoolOption.Type;

	/**
	 * BlinkState
	 *
	 * @since 0.0.1
	 */
	readonly isBlinking: BoolOption.Type;

	/**
	 * Foreground color. In the second option, none means default terminal foreground color
	 *
	 * @since 0.0.1
	 */
	readonly fgColor: ColorOption.Type;

	/**
	 * Background color. In the second option, none means default terminal background color
	 *
	 * @since 0.0.1
	 */
	readonly bgColor: ColorOption.Type;

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
	BoolOption.equivalence(self.isBold, that.isBold) &&
	BoolOption.equivalence(self.isDim, that.isDim) &&
	BoolOption.equivalence(self.isItalic, that.isItalic) &&
	BoolOption.equivalence(self.isUnderlined, that.isUnderlined) &&
	BoolOption.equivalence(self.isStruckThrough, that.isStruckThrough) &&
	BoolOption.equivalence(self.isOverlined, that.isOverlined) &&
	BoolOption.equivalence(self.isInversed, that.isInversed) &&
	BoolOption.equivalence(self.isHidden, that.isHidden) &&
	BoolOption.equivalence(self.isBlinking, that.isBlinking) &&
	ColorOption.equivalence(self.fgColor, that.fgColor) &&
	ColorOption.equivalence(self.bgColor, that.bgColor);

const _TypeIdHash = Hash.hash(TypeId);
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(
			this.isBold,
			Hash.hash,
			Hash.combine(Hash.hash(this.isDim)),
			Hash.combine(Hash.hash(this.isItalic)),
			Hash.combine(Hash.hash(this.isUnderlined)),
			Hash.combine(Hash.hash(this.isStruckThrough)),
			Hash.combine(Hash.hash(this.isOverlined)),
			Hash.combine(Hash.hash(this.isInversed)),
			Hash.combine(Hash.hash(this.isHidden)),
			Hash.combine(Hash.hash(this.isBlinking)),
			Hash.combine(Hash.hash(this.fgColor)),
			Hash.combine(Hash.hash(this.bgColor)),
			Hash.combine(_TypeIdHash),
			Hash.cached(this)
		);
	},
	[MInspectable.IdSymbol](this: Type) {
		return toId(this);
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Returns the `isBold` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const isBold: MTypes.OneArgFunction<Type, BoolOption.Type> = Struct.get('isBold');

/**
 * Returns the `isDim` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const isDim: MTypes.OneArgFunction<Type, BoolOption.Type> = Struct.get('isDim');

/**
 * Returns the `isItalic` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const isItalic: MTypes.OneArgFunction<Type, BoolOption.Type> = Struct.get('isItalic');

/**
 * Returns the `isUnderlined` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const isUnderlined: MTypes.OneArgFunction<Type, BoolOption.Type> =
	Struct.get('isUnderlined');

/**
 * Returns the `isStruckThrough` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const isStruckThrough: MTypes.OneArgFunction<Type, BoolOption.Type> =
	Struct.get('isStruckThrough');

/**
 * Returns the `isOverlined` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const isOverlined: MTypes.OneArgFunction<Type, BoolOption.Type> = Struct.get('isOverlined');

/**
 * Returns the `isInversed` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const isInversed: MTypes.OneArgFunction<Type, BoolOption.Type> = Struct.get('isInversed');

/**
 * Returns the `isHidden` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const isHidden: MTypes.OneArgFunction<Type, BoolOption.Type> = Struct.get('isHidden');

/**
 * Returns the `isBlinking` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const isBlinking: MTypes.OneArgFunction<Type, BoolOption.Type> = Struct.get('isBlinking');

/**
 * Returns the `fgColor` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const fgColor: MTypes.OneArgFunction<Type, ColorOption.Type> = Struct.get('fgColor');

/**
 * Returns the `bgColor` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const bgColor: MTypes.OneArgFunction<Type, ColorOption.Type> = Struct.get('bgColor');

const _isBoldId = BoolOption.toId(Function.constant('NotBold'), Function.constant('Bold'));
const _isDimId = BoolOption.toId(Function.constant('NotDim'), Function.constant('Dim'));
const _isItalicId = BoolOption.toId(Function.constant('NotItalic'), Function.constant('Italic'));
const _isUnderlinedId = BoolOption.toId(
	Function.constant('NotUnderlined'),
	Function.constant('Underlined')
);
const _isStruckThroughId = BoolOption.toId(
	Function.constant('NotStruckThrough'),
	Function.constant('StruckThrough')
);
const _isOverlinedId = BoolOption.toId(
	Function.constant('NotOverlined'),
	Function.constant('Overlined')
);
const _isInversedId = BoolOption.toId(
	Function.constant('NotInversed'),
	Function.constant('Inversed')
);
const _isHiddenId = BoolOption.toId(Function.constant('NotHidden'), Function.constant('Hidden'));
const _isBlinkingId = BoolOption.toId(
	Function.constant('NotBlinking'),
	Function.constant('Blinking')
);
const _fgColorId = ColorOption.toId('');
const _bgColorId = ColorOption.toId('In');

/**
 * Returns the id of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toId = (self: Type): string => {
	return (
		_isBoldId(self.isBold) +
		_isDimId(self.isDim) +
		_isItalicId(self.isItalic) +
		_isUnderlinedId(self.isUnderlined) +
		_isStruckThroughId(self.isStruckThrough) +
		_isOverlinedId(self.isOverlined) +
		_isInversedId(self.isInversed) +
		_isHiddenId(self.isHidden) +
		_isBlinkingId(self.isBlinking) +
		_fgColorId(self.fgColor) +
		_bgColorId(self.bgColor)
	);
};

const _isBoldToSequence = BoolOption.toSequence(22, 1);
const _isDimToSequence = BoolOption.toSequence(22, 2);
const _isItalicToSequence = BoolOption.toSequence(23, 3);
const _isUnderlinedToSequence = BoolOption.toSequence(24, 4);
const _isStruckThroughToSequence = BoolOption.toSequence(29, 9);
const _isOverlinedToSequence = BoolOption.toSequence(55, 53);
const _isInversedToSequence = BoolOption.toSequence(27, 7);
const _isHiddenToSequence = BoolOption.toSequence(28, 8);
const _isBlinkingToSequence = BoolOption.toSequence(25, 5);
const _fgColorToSequence = ColorOption.toSequence(0);
const _bgColorToSequence = ColorOption.toSequence(10);

/**
 * Returns the sequence corresponding to `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toSequence = (self: Type): ASAnsiString.Sequence => {
	const isBoldReset = BoolOption.equivalence(self.isBold, _falseSome);
	const isDimReset = BoolOption.equivalence(self.isDim, _falseSome);
	return pipe(
		// Useless to send the same reset twice
		isBoldReset && isDimReset ? Array.of(_isBoldToSequence(self.isBold))
			// Send DimReset before bold state because DimReset would cancel its effect
		: isDimReset ? Array.make(_isDimToSequence(self.isDim), _isBoldToSequence(self.isBold))
		: Array.make(_isBoldToSequence(self.isBold), _isDimToSequence(self.isDim)),
		Array.appendAll(
			Array.make(
				_isItalicToSequence(self.isItalic),
				_isUnderlinedToSequence(self.isUnderlined),
				_isStruckThroughToSequence(self.isStruckThrough),
				_isOverlinedToSequence(self.isOverlined),
				_isInversedToSequence(self.isInversed),
				_isHiddenToSequence(self.isHidden),
				_isBlinkingToSequence(self.isBlinking),
				_fgColorToSequence(self.fgColor),
				_bgColorToSequence(self.bgColor)
			)
		),
		Array.flatten
	);
};

/**
 * Returns the ANSI string corresponding to `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toAnsiString: MTypes.OneArgFunction<Type, ASAnsiString.Type> = flow(
	toSequence,
	ASAnsiString.fromSequence
);

/**
 * Builds a new StyleCharacteristics by merging `self` and `that`. In case of conflict (e.g `self`
 * contains `Bold` and `that` contains `NotBold`), the characteristics in `self` will prevail.
 *
 * @since 0.0.1
 * @category Utils
 */
export const mergeUnder =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			isBold: pipe(self.isBold, BoolOption.mergeUnder(that.isBold)),
			isDim: pipe(self.isDim, BoolOption.mergeUnder(that.isDim)),
			isItalic: pipe(self.isItalic, BoolOption.mergeUnder(that.isItalic)),
			isUnderlined: pipe(self.isUnderlined, BoolOption.mergeUnder(that.isUnderlined)),
			isStruckThrough: pipe(self.isStruckThrough, BoolOption.mergeUnder(that.isStruckThrough)),
			isOverlined: pipe(self.isOverlined, BoolOption.mergeUnder(that.isOverlined)),
			isInversed: pipe(self.isInversed, BoolOption.mergeUnder(that.isInversed)),
			isHidden: pipe(self.isHidden, BoolOption.mergeUnder(that.isHidden)),
			isBlinking: pipe(self.isBlinking, BoolOption.mergeUnder(that.isBlinking)),
			fgColor: pipe(self.fgColor, ColorOption.mergeUnder(that.fgColor)),
			bgColor: pipe(self.bgColor, ColorOption.mergeUnder(that.bgColor))
		});

/**
 * Builds a new StyleCharacteristics by merging `self` and `that`. In case of conflict (e.g `self`
 * contains `Bold` and `that` contains `NotBold`), the characteristics in `that` will prevail.
 *
 * @since 0.0.1
 * @category Utils
 */
export const mergeOver =
	(that: Type) =>
	(self: Type): Type =>
		mergeUnder(self)(that);

/**
 * Builds a new StyleCharacteristics by merging `self` and `that`. In case of conflict (e.g `self`
 * contains `Bold` and `that` contains `NotBold`), the characteristics in `self` will prevail.
 *
 * @since 0.0.1
 * @category Utils
 */
export const updateContext =
	(that: Type) =>
	(self: Type): Type =>
		pipe(
			that,
			BoolOption.equivalence(that.isBold, _falseSome) && Option.isNone(that.isDim) ?
				flow(MStruct.set({ isDim: _falseSome }), _make)
			: BoolOption.equivalence(that.isDim, _falseSome) && Option.isNone(that.isBold) ?
				flow(MStruct.set({ isBold: _falseSome }), _make)
			:	Function.identity,
			mergeUnder(self)
		);

/**
 * Builds a new StyleCharacteristics by removing from `self` the StyleCharacteristic's of `that`.
 *
 * @since 0.0.1
 * @category Utils
 */
export const difference =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			isBold: pipe(self.isBold, BoolOption.difference(that.isBold)),
			isDim: pipe(self.isDim, BoolOption.difference(that.isDim)),
			isItalic: pipe(self.isItalic, BoolOption.difference(that.isItalic)),
			isUnderlined: pipe(self.isUnderlined, BoolOption.difference(that.isUnderlined)),
			isStruckThrough: pipe(self.isStruckThrough, BoolOption.difference(that.isStruckThrough)),
			isOverlined: pipe(self.isOverlined, BoolOption.difference(that.isOverlined)),
			isInversed: pipe(self.isInversed, BoolOption.difference(that.isInversed)),
			isHidden: pipe(self.isHidden, BoolOption.difference(that.isHidden)),
			isBlinking: pipe(self.isBlinking, BoolOption.difference(that.isBlinking)),
			fgColor: pipe(self.fgColor, ColorOption.difference(that.fgColor)),
			bgColor: pipe(self.bgColor, ColorOption.difference(that.bgColor))
		});

/**
 * Empty StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const none: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * Default StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaults: Type = _make({
	isBold: _falseSome,
	isDim: _falseSome,
	isItalic: _falseSome,
	isUnderlined: _falseSome,
	isStruckThrough: _falseSome,
	isOverlined: _falseSome,
	isInversed: _falseSome,
	isHidden: _falseSome,
	isBlinking: _falseSome,
	fgColor: Option.some(Option.none()),
	bgColor: Option.some(Option.none())
});

/**
 * Bold StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const bold: Type = _make({
	isBold: _trueSome,
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * NotBold StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notBold: Type = _make({
	isBold: _falseSome,
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * Dim StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const dim: Type = _make({
	isBold: Option.none(),
	isDim: _trueSome,
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * NotDim StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notDim: Type = _make({
	isBold: Option.none(),
	isDim: _falseSome,
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * Italic StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const italic: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: _trueSome,
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * NotItalic StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notItalic: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: _falseSome,
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * Underlined StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const underlined: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: _trueSome,
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * NotUnderlined StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notUnderlined: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: _falseSome,
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * StruckThrough StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const struckThrough: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: _trueSome,
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * NotStruckThrough StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notStruckThrough: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: _falseSome,
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * Overlined StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const overlined: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: _trueSome,
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * NotOverlined StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notOverlined: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: _falseSome,
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * Inversed StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const inversed: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: _trueSome,
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * NotInversed StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notInversed: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: _falseSome,
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * Hidden StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const hidden: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: _trueSome,
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * NotHidden StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notHidden: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: _falseSome,
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * Blinking StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const blinking: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: _trueSome,
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * NotBlinking StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notBlinking: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: _falseSome,
	fgColor: Option.none(),
	bgColor: Option.none()
});

/**
 * Default foreground color StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const fgDefaultColor: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.some(Option.none()),
	bgColor: Option.none()
});

/**
 * Builds a StyleCharacteristics that applies `color` as foreground color
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromColorAsForegroundColor = (color: ASColor.Type): Type =>
	_make({
		isBold: Option.none(),
		isDim: Option.none(),
		isItalic: Option.none(),
		isUnderlined: Option.none(),
		isStruckThrough: Option.none(),
		isOverlined: Option.none(),
		isInversed: Option.none(),
		isHidden: Option.none(),
		isBlinking: Option.none(),
		fgColor: Option.some(Option.some(color)),
		bgColor: Option.none()
	});

/**
 * Default foreground color StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const bgDefaultColor: Type = _make({
	isBold: Option.none(),
	isDim: Option.none(),
	isItalic: Option.none(),
	isUnderlined: Option.none(),
	isStruckThrough: Option.none(),
	isOverlined: Option.none(),
	isInversed: Option.none(),
	isHidden: Option.none(),
	isBlinking: Option.none(),
	fgColor: Option.none(),
	bgColor: Option.some(Option.none())
});

/**
 * Builds a StyleCharacteristics that applies `color` as background color
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromColorAsBackgroundColor = (color: ASColor.Type): Type =>
	_make({
		isBold: Option.none(),
		isDim: Option.none(),
		isItalic: Option.none(),
		isUnderlined: Option.none(),
		isStruckThrough: Option.none(),
		isOverlined: Option.none(),
		isInversed: Option.none(),
		isHidden: Option.none(),
		isBlinking: Option.none(),
		fgColor: Option.none(),
		bgColor: Option.some(Option.some(color))
	});
