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
	 * BoldState of this style
	 *
	 * @since 0.0.1
	 */
	readonly boldState: BoolOption.Type;

	/**
	 * DimState of this style
	 *
	 * @since 0.0.1
	 */
	readonly dimState: BoolOption.Type;

	/**
	 * ItalicState of this style
	 *
	 * @since 0.0.1
	 */
	readonly italicState: BoolOption.Type;

	/**
	 * UnderlinedState of this style
	 *
	 * @since 0.0.1
	 */
	readonly underlinedState: BoolOption.Type;

	/**
	 * StruckThroughState of this style
	 *
	 * @since 0.0.1
	 */
	readonly struckThroughState: BoolOption.Type;

	/**
	 * OverlinedState of this style
	 *
	 * @since 0.0.1
	 */
	readonly overlinedState: BoolOption.Type;

	/**
	 * InversedState of this style
	 *
	 * @since 0.0.1
	 */
	readonly inversedState: BoolOption.Type;

	/**
	 * HiddenState of this style
	 *
	 * @since 0.0.1
	 */
	readonly hiddenState: BoolOption.Type;

	/**
	 * BlinkingState of this style
	 *
	 * @since 0.0.1
	 */
	readonly blinkingState: BoolOption.Type;

	/**
	 * Foreground color of this style. In the second option, none means default terminal foreground
	 * color
	 *
	 * @since 0.0.1
	 */
	readonly fgColor: ColorOption.Type;

	/**
	 * Background color of this style. In the second option, none means default terminal background
	 * color
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
	BoolOption.equivalence(self.boldState, that.boldState) &&
	BoolOption.equivalence(self.dimState, that.dimState) &&
	BoolOption.equivalence(self.italicState, that.italicState) &&
	BoolOption.equivalence(self.underlinedState, that.underlinedState) &&
	BoolOption.equivalence(self.struckThroughState, that.struckThroughState) &&
	BoolOption.equivalence(self.overlinedState, that.overlinedState) &&
	BoolOption.equivalence(self.inversedState, that.inversedState) &&
	BoolOption.equivalence(self.hiddenState, that.hiddenState) &&
	BoolOption.equivalence(self.blinkingState, that.blinkingState) &&
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
			this.boldState,
			Hash.hash,
			Hash.combine(Hash.hash(this.dimState)),
			Hash.combine(Hash.hash(this.italicState)),
			Hash.combine(Hash.hash(this.underlinedState)),
			Hash.combine(Hash.hash(this.struckThroughState)),
			Hash.combine(Hash.hash(this.overlinedState)),
			Hash.combine(Hash.hash(this.inversedState)),
			Hash.combine(Hash.hash(this.hiddenState)),
			Hash.combine(Hash.hash(this.blinkingState)),
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
 * Returns the `boldState` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const boldState: MTypes.OneArgFunction<Type, BoolOption.Type> = Struct.get('boldState');

/**
 * Returns the `dimState` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const dimState: MTypes.OneArgFunction<Type, BoolOption.Type> = Struct.get('dimState');

/**
 * Returns the `italicState` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const italicState: MTypes.OneArgFunction<Type, BoolOption.Type> = Struct.get('italicState');

/**
 * Returns the `underlinedState` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const underlinedState: MTypes.OneArgFunction<Type, BoolOption.Type> =
	Struct.get('underlinedState');

/**
 * Returns the `struckThroughState` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const struckThroughState: MTypes.OneArgFunction<Type, BoolOption.Type> =
	Struct.get('struckThroughState');

/**
 * Returns the `overlinedState` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const overlinedState: MTypes.OneArgFunction<Type, BoolOption.Type> =
	Struct.get('overlinedState');

/**
 * Returns the `inversedState` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const inversedState: MTypes.OneArgFunction<Type, BoolOption.Type> =
	Struct.get('inversedState');

/**
 * Returns the `hiddenState` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const hiddenState: MTypes.OneArgFunction<Type, BoolOption.Type> = Struct.get('hiddenState');

/**
 * Returns the `blinkingState` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const blinkingState: MTypes.OneArgFunction<Type, BoolOption.Type> =
	Struct.get('blinkingState');

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

/**
 * Returns true if `self` has the bold state
 *
 * @since 0.0.1
 * @category Predicates
 */
export const hasBold: Predicate.Predicate<Type> = (self) =>
	BoolOption.equivalence(self.boldState, _trueSome);

/**
 * Returns true if `self` has the notBold state
 *
 * @since 0.0.1
 * @category Predicates
 */
export const hasNotBold: Predicate.Predicate<Type> = (self) =>
	BoolOption.equivalence(self.boldState, _falseSome);

/**
 * Returns true if `self` has the dim state
 *
 * @since 0.0.1
 * @category Predicates
 */
export const hasDim: Predicate.Predicate<Type> = (self) =>
	BoolOption.equivalence(self.dimState, _trueSome);

/**
 * Returns true if `self` has the notDim state
 *
 * @since 0.0.1
 * @category Predicates
 */
export const hasNotDim: Predicate.Predicate<Type> = (self) =>
	BoolOption.equivalence(self.dimState, _falseSome);

const _boldStateId = BoolOption.toId(Function.constant('NotBold'), Function.constant('Bold'));
const _dimStateId = BoolOption.toId(Function.constant('NotDim'), Function.constant('Dim'));
const _italicStateId = BoolOption.toId(Function.constant('NotItalic'), Function.constant('Italic'));
const _underlinedStateId = BoolOption.toId(
	Function.constant('NotUnderlined'),
	Function.constant('Underlined')
);
const _struckThroughStateId = BoolOption.toId(
	Function.constant('NotStruckThrough'),
	Function.constant('StruckThrough')
);
const _overlinedStateId = BoolOption.toId(
	Function.constant('NotOverlined'),
	Function.constant('Overlined')
);
const _inversedStateId = BoolOption.toId(
	Function.constant('NotInversed'),
	Function.constant('Inversed')
);
const _hiddenStateId = BoolOption.toId(Function.constant('NotHidden'), Function.constant('Hidden'));
const _blinkingStateId = BoolOption.toId(
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
		_boldStateId(self.boldState) +
		_dimStateId(self.dimState) +
		_italicStateId(self.italicState) +
		_underlinedStateId(self.underlinedState) +
		_struckThroughStateId(self.struckThroughState) +
		_overlinedStateId(self.overlinedState) +
		_inversedStateId(self.inversedState) +
		_hiddenStateId(self.hiddenState) +
		_blinkingStateId(self.blinkingState) +
		_fgColorId(self.fgColor) +
		_bgColorId(self.bgColor)
	);
};

const _boldStateToSequence = BoolOption.toSequence(22, 1);
const _dimStateToSequence = BoolOption.toSequence(22, 2);
const _italicStateToSequence = BoolOption.toSequence(23, 3);
const _underlinedStateToSequence = BoolOption.toSequence(24, 4);
const _struckThroughStateToSequence = BoolOption.toSequence(29, 9);
const _overlinedStateToSequence = BoolOption.toSequence(55, 53);
const _inversedStateToSequence = BoolOption.toSequence(27, 7);
const _hiddenStateToSequence = BoolOption.toSequence(28, 8);
const _blinkingStateToSequence = BoolOption.toSequence(25, 5);
const _fgColorToSequence = ColorOption.toSequence(0);
const _bgColorToSequence = ColorOption.toSequence(10);

/**
 * Returns the sequence corresponding to `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toSequence = (self: Type): ASAnsiString.Sequence => {
	const isNotDimPresent = hasNotDim(self);
	return pipe(
		// Useless to send both notBold and notDim because they have the same value
		hasNotBold(self) && isNotDimPresent ? Array.of(_boldStateToSequence(self.boldState))
			// Send notDim before bold otherwise bold will never take effect
		: isNotDimPresent ?
			Array.make(_dimStateToSequence(self.dimState), _boldStateToSequence(self.boldState))
		:	Array.make(_boldStateToSequence(self.boldState), _dimStateToSequence(self.dimState)),
		Array.appendAll(
			Array.make(
				_italicStateToSequence(self.italicState),
				_underlinedStateToSequence(self.underlinedState),
				_struckThroughStateToSequence(self.struckThroughState),
				_overlinedStateToSequence(self.overlinedState),
				_inversedStateToSequence(self.inversedState),
				_hiddenStateToSequence(self.hiddenState),
				_blinkingStateToSequence(self.blinkingState),
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
			boldState: pipe(self.boldState, BoolOption.mergeUnder(that.boldState)),
			dimState: pipe(self.dimState, BoolOption.mergeUnder(that.dimState)),
			italicState: pipe(self.italicState, BoolOption.mergeUnder(that.italicState)),
			underlinedState: pipe(self.underlinedState, BoolOption.mergeUnder(that.underlinedState)),
			struckThroughState: pipe(
				self.struckThroughState,
				BoolOption.mergeUnder(that.struckThroughState)
			),
			overlinedState: pipe(self.overlinedState, BoolOption.mergeUnder(that.overlinedState)),
			inversedState: pipe(self.inversedState, BoolOption.mergeUnder(that.inversedState)),
			hiddenState: pipe(self.hiddenState, BoolOption.mergeUnder(that.hiddenState)),
			blinkingState: pipe(self.blinkingState, BoolOption.mergeUnder(that.blinkingState)),
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
 * Builds a new StyleCharacteristics by removing from `self` the StyleCharacteristic's of `that`.
 *
 * @since 0.0.1
 * @category Utils
 */
export const difference =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			boldState: pipe(self.boldState, BoolOption.difference(that.boldState)),
			dimState: pipe(self.dimState, BoolOption.difference(that.dimState)),
			italicState: pipe(self.italicState, BoolOption.difference(that.italicState)),
			underlinedState: pipe(self.underlinedState, BoolOption.difference(that.underlinedState)),
			struckThroughState: pipe(
				self.struckThroughState,
				BoolOption.difference(that.struckThroughState)
			),
			overlinedState: pipe(self.overlinedState, BoolOption.difference(that.overlinedState)),
			inversedState: pipe(self.inversedState, BoolOption.difference(that.inversedState)),
			hiddenState: pipe(self.hiddenState, BoolOption.difference(that.hiddenState)),
			blinkingState: pipe(self.blinkingState, BoolOption.difference(that.blinkingState)),
			fgColor: pipe(self.fgColor, ColorOption.difference(that.fgColor)),
			bgColor: pipe(self.bgColor, ColorOption.difference(that.bgColor))
		});

/**
 * Builds a new StyleCharacteristics by removing from `self` the StyleCharacteristic's of `context`.
 * But if `self` contains bold and notDim and bold is also in `context`, then do not remove it
 * bacause the bold in the context will be erased by notDim. Same if `self` contains dim and notBold
 * and dim is also in `context`
 *
 * @since 0.0.1
 * @category Utils
 */
export const substractContext =
	(context: Type) =>
	(self: Type): Type => {
		const target = pipe(self, difference(context));
		return (
			hasBold(self) && hasNotDim(target) ?
				pipe(target, MStruct.set({ boldState: _trueSome }), _make)
			: hasDim(self) && hasNotBold(target) ?
				pipe(target, MStruct.set({ dimState: _trueSome }), _make)
			:	target
		);
	};

/**
 * Empty StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const none: Type = _make({
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: _falseSome,
	dimState: _falseSome,
	italicState: _falseSome,
	underlinedState: _falseSome,
	struckThroughState: _falseSome,
	overlinedState: _falseSome,
	inversedState: _falseSome,
	hiddenState: _falseSome,
	blinkingState: _falseSome,
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
	boldState: _trueSome,
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: _falseSome,
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: _trueSome,
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: _falseSome,
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: _trueSome,
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: _falseSome,
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: _trueSome,
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: _falseSome,
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: _trueSome,
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: _falseSome,
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: _trueSome,
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: _falseSome,
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: _trueSome,
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: _falseSome,
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: _trueSome,
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: _falseSome,
	blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: _trueSome,
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: _falseSome,
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
		boldState: Option.none(),
		dimState: Option.none(),
		italicState: Option.none(),
		underlinedState: Option.none(),
		struckThroughState: Option.none(),
		overlinedState: Option.none(),
		inversedState: Option.none(),
		hiddenState: Option.none(),
		blinkingState: Option.none(),
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
	boldState: Option.none(),
	dimState: Option.none(),
	italicState: Option.none(),
	underlinedState: Option.none(),
	struckThroughState: Option.none(),
	overlinedState: Option.none(),
	inversedState: Option.none(),
	hiddenState: Option.none(),
	blinkingState: Option.none(),
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
		boldState: Option.none(),
		dimState: Option.none(),
		italicState: Option.none(),
		underlinedState: Option.none(),
		struckThroughState: Option.none(),
		overlinedState: Option.none(),
		inversedState: Option.none(),
		hiddenState: Option.none(),
		blinkingState: Option.none(),
		fgColor: Option.none(),
		bgColor: Option.some(Option.some(color))
	});
