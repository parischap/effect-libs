/**
 * This module implements a type that defines all the characteristics of a style, e.g. the
 * foreground and background colors, whether it's bold or not,... These characteristics are those of
 * the Select Graphic Rendition subset for which info can be found at
 * https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences. Each
 * characteristic is defined as an option, none meaning that the corresponding characteristic has
 * not been set. It is important to note that although dim and bold use the same reset sequence
 * (i.e. 22), they are completely different characteristics (i.e. a style can be bold and dim at the
 * same time, or just bold, or just dim).
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

/**
 * Module tag
 *
 * @since 0.0.1
 * @category Models
 */
export const moduleTag = '@parischap/ansi-styles/StyleCharacteristics/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

const _falseSome = Option.some(false);
const _trueSome = Option.some(true);

/**
 * Namespace of an optional style charcateristic
 *
 * @since 0.0.1
 * @category Models
 */
namespace OptionalCharacteristic {
	/**
	 * Type of an OptionalCharacteristic
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export type Type<A> = Option.Option<A>;

	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const getEquivalence = Option.getEquivalence;

	/**
	 * Returns the id of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const toId = <A>(
		someId: MTypes.OneArgFunction<A, string>
	): MTypes.OneArgFunction<Type<A>, string> =>
		Option.match({
			onNone: MFunction.constEmptyString,
			onSome: someId
		});

	/**
	 * Returns the sequence corresponding to `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const toSequence = <A>(
		someSequence: MTypes.OneArgFunction<A, ASAnsiString.Sequence>
	): MTypes.OneArgFunction<Type<A>, ASAnsiString.Sequence> =>
		Option.match({
			onNone: Function.constant(Array.empty()),
			onSome: someSequence
		});

	/**
	 * Builds a new OptionalCharacteristic by merging `self` and `that`. In case of conflict, `self`
	 * will prevail.
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const mergeUnder = <A>(that: Type<A>): MTypes.OneArgFunction<Type<A>, Type<A>> =>
		Option.orElse(Function.constant(that));

	/**
	 * Builds a new OptionalCharacteristic by substracting `that` from `self`. `that` can be
	 * substracted from `self` only if it is equal to `self`.
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const difference =
		<A>(equivalence: Equivalence.Equivalence<Type<A>>) =>
		(that: Type<A>): MTypes.OneArgFunction<Type<A>, Type<A>> =>
		(self) =>
			equivalence(self, that) ? Option.none() : self;
}

/**
 * Namespace of an optional style charcateristic with two possible values
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
	export type Type = OptionalCharacteristic.Type<boolean>;

	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const equivalence = OptionalCharacteristic.getEquivalence(Boolean.Equivalence);

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
		OptionalCharacteristic.toId(
			Boolean.match({
				onFalse,
				onTrue
			})
		);

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
		OptionalCharacteristic.toSequence(
			Boolean.match({
				onFalse: pipe(onFalse, Array.of, Function.constant),
				onTrue: pipe(onTrue, Array.of, Function.constant)
			})
		);

	/**
	 * Builds a new BoolOption by merging `self` and `that`. In case of conflict, `self` will prevail.
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const mergeUnder: MTypes.OneArgFunction<
		Type,
		MTypes.OneArgFunction<Type, Type>
	> = OptionalCharacteristic.mergeUnder;

	/**
	 * Builds a new Characteristic by substracting `that` from `self`. `that` can be substracted from
	 * `self` only if it is equal to `self`.
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const difference: MTypes.OneArgFunction<
		Type,
		MTypes.OneArgFunction<Type, Type>
	> = OptionalCharacteristic.difference(equivalence);
}

/**
 * Namespace of an optional color style charcateristic
 *
 * @since 0.0.1
 * @category Models
 */
namespace ColorOption {
	/**
	 * Type of a ColorOption. In the innermost option, `none` means `default terminal color`
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export type Type = OptionalCharacteristic.Type<Option.Option<ASColor.Type>>;

	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const equivalence = OptionalCharacteristic.getEquivalence(
		Option.getEquivalence(ASColor.equivalence)
	);

	/**
	 * Returns the id of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const toId = (prefix: string): MTypes.OneArgFunction<Type, string> =>
		OptionalCharacteristic.toId(
			flow(
				Option.match({
					onNone: Function.constant('DefaultColor'),
					onSome: ASColor.toId
				}),
				MString.prepend(prefix)
			)
		);

	/**
	 * Returns the sequence corresponding to `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const toSequence = (offset: number): MTypes.OneArgFunction<Type, ASAnsiString.Sequence> =>
		OptionalCharacteristic.toSequence(
			flow(
				Option.match({
					onNone: pipe(39, Array.of, Function.constant),
					onSome: ASColor.toSequence
				}),
				Array.modifyNonEmptyHead(Number.sum(offset))
			)
		);

	/**
	 * Builds a new ColorOption by merging `self` and `that`. In case of conflict, `self` will
	 * prevail.
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const mergeUnder: MTypes.OneArgFunction<
		Type,
		MTypes.OneArgFunction<Type, Type>
	> = OptionalCharacteristic.mergeUnder;

	/**
	 * Builds a new ColorOption by substracting `that` from `self`. `that` can be substracted from
	 * `self` only if it is equal to `self`.
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const difference: MTypes.OneArgFunction<
		Type,
		MTypes.OneArgFunction<Type, Type>
	> = OptionalCharacteristic.difference(equivalence);
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
	 * Foreground color of this style.
	 *
	 * @since 0.0.1
	 */
	readonly fgColor: ColorOption.Type;

	/**
	 * Background color of this style.
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
	const result =
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
		_bgColorId(self.bgColor);
	return result === '' ? 'NoStyle' : result;
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
 * Same as difference above but:
 *
 * - If `self` and `context` contain `bold` and `self` also contains `notDim` and `context` does not
 *   contain `notdim`, then do not remove `bold`.
 * - If `self` and `context` contain `dim` and `self` also contains `notBold` and `context` does not
 *   contain `notBold`, then do not remove `dim`
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
export const bold: Type = pipe(none, MStruct.set({ boldState: _trueSome }), _make);

/**
 * NotBold StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notBold: Type = pipe(none, MStruct.set({ boldState: _falseSome }), _make);

/**
 * Dim StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const dim: Type = pipe(none, MStruct.set({ dimState: _trueSome }), _make);

/**
 * NotDim StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notDim: Type = pipe(none, MStruct.set({ dimState: _falseSome }), _make);

/**
 * Italic StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const italic: Type = pipe(none, MStruct.set({ italicState: _trueSome }), _make);

/**
 * NotItalic StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notItalic: Type = pipe(none, MStruct.set({ italicState: _falseSome }), _make);

/**
 * Underlined StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const underlined: Type = pipe(none, MStruct.set({ underlinedState: _trueSome }), _make);

/**
 * NotUnderlined StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notUnderlined: Type = pipe(none, MStruct.set({ underlinedState: _falseSome }), _make);

/**
 * StruckThrough StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const struckThrough: Type = pipe(
	none,
	MStruct.set({ struckThroughState: _trueSome }),
	_make
);

/**
 * NotStruckThrough StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notStruckThrough: Type = pipe(
	none,
	MStruct.set({ struckThroughState: _falseSome }),
	_make
);

/**
 * Overlined StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const overlined: Type = pipe(none, MStruct.set({ overlinedState: _trueSome }), _make);

/**
 * NotOverlined StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notOverlined: Type = pipe(none, MStruct.set({ overlinedState: _falseSome }), _make);

/**
 * Inversed StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const inversed: Type = pipe(none, MStruct.set({ inversedState: _trueSome }), _make);

/**
 * NotInversed StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notInversed: Type = pipe(none, MStruct.set({ inversedState: _falseSome }), _make);

/**
 * Hidden StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const hidden: Type = pipe(none, MStruct.set({ hiddenState: _trueSome }), _make);

/**
 * NotHidden StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notHidden: Type = pipe(none, MStruct.set({ hiddenState: _falseSome }), _make);

/**
 * Blinking StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const blinking: Type = pipe(none, MStruct.set({ blinkingState: _trueSome }), _make);

/**
 * NotBlinking StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const notBlinking: Type = pipe(none, MStruct.set({ blinkingState: _falseSome }), _make);

/**
 * Default foreground color StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const fgDefaultColor: Type = pipe(
	none,
	MStruct.set({ fgColor: Option.some(Option.none()) }),
	_make
);

/**
 * Builds a StyleCharacteristics that applies `color` as foreground color
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromColorAsForegroundColor = (color: ASColor.Type): Type =>
	pipe(none, MStruct.set({ fgColor: Option.some(Option.some(color)) }), _make);

/**
 * Default foreground color StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const bgDefaultColor: Type = pipe(
	none,
	MStruct.set({ bgColor: Option.some(Option.none()) }),
	_make
);

/**
 * Builds a StyleCharacteristics that applies `color` as background color
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromColorAsBackgroundColor = (color: ASColor.Type): Type =>
	pipe(none, MStruct.set({ bgColor: Option.some(Option.some(color)) }), _make);
