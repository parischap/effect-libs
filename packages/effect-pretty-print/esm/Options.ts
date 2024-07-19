import { MMatch, MOption, MPredicate, MString, MTypes } from '@parischap/effect-lib';
import { JsANSI } from '@parischap/js-lib';
import {
	Array,
	Boolean,
	Function,
	Option,
	Order,
	Predicate,
	String,
	Struct,
	flow,
	pipe
} from 'effect';
import * as FormattedString from './FormattedString.js';
import * as RecordFormat from './RecordFormat.js';
import * as SplitMode from './SplitMode.js';
import * as ValueWrapper from './ValueWrapper.js';
import type * as utilities from './utilities.js';

const $ = FormattedString.makeWith;

/**
 * Options for filtering record properties
 * @category Models
 */
export interface RecordPropertyFilteringOptions {
	/**
	 * If true, functions will be shown in records
	 */
	readonly showFunctions: boolean;
	/**
	 * If true, non-functions will be shown in records
	 */
	readonly showNonFunctions: boolean;
	/**
	 * If true, symbol properties will be shown in records
	 */
	readonly showSymbolicProperties: boolean;
	/**
	 * If true, string properties will be shown in records
	 */
	readonly showStringProperties: boolean;
	/**
	 * If true, enumerable properties will be shown in records
	 */
	readonly showEnumerableProperties: boolean;
	/**
	 * If true, non-enumerable properties will be shown in records
	 */
	readonly showNonEnumerableProperties: boolean;
	/**
	 * Extra filter offering more in-depth possibilities. This function must directly modify the mutable `constituents` property of the passed recordWrapper by removing those constituents that should not be shown. Although allowed, it is not recoomended to modify the constituents which are not removed in any manner. Note that the `valueLines` property of the passed recordWrapper, and the `valueLines` and `constituents` properties of each of its constituents, are empty arrays at this early stage of the stringification process. Any modifications to these arrays will be discarded.
	 *
	 * This package exports an example propertyNamePredicateFilter function that keeps only string properties fulfilling a predicate and an enumerablePropertyFilterForArrays function that will filter out non-enumerable properties on arrays (must be used in conjunction with options.showNonEnumerableProperties=true so as to show non-enumerable properties on all non-null objects and functions, but not on arrays).
	 */
	readonly propertyFilter: ValueWrapper.RecordModifier;
}

/**
 * Display options
 * @category Models
 */
export interface Type extends RecordPropertyFilteringOptions {
	/**
	 * Maximum depth at which arrays and records are recursively displayed. A value <= 0 means that only primitive values are shown.
	 */
	readonly maxDepth: number;
	/**
	 * Indicates the level in the prototypal chain of a record down to which properties are shown. maxPrototypeDepth <= 0 means that only properties of the top record are shown. Properties borne by that record's prototype and by thy prototype's prototype,... are not shown.
	 */
	readonly maxPrototypeDepth: number;

	/**
	 * Text to show if the value to print is a record that contains a circular reference to itself. The record will be printed down to the point where it contains a circular reference which will be replaced by the value of options.circularLabel.
	 *
	 * This package exports a circularLabelGenerator that is suitable for most use cases. It returns the string "(Circular)" in the color of your choice. It also exports a defaultCircularLabel function that calls the circularLabelGenerator without applying any coloring and a ansiBlackModeCircularLabel function that calls the circularLabelGenerator with ansi coloring suitable to black mode.
	 */
	readonly circularLabel: FormattedString.Type;

	/**
	 * Text to show instead of an array when maxDepth is reached.
	 *
	 * This package exports an arrayLabelGenerator that is suitable for most use cases. It returns the string "(Array)" in the color of your choice. It also exports a defaultArrayLabel function that calls the arrayLabelGenerator without applying any coloring and a ansiBlackModeArrayLabel function that calls the arrayLabelGenerator with ansi coloring suitable to black mode.
	 */
	readonly arrayLabel: FormattedString.Type;

	/**
	 * Text to show instead of a function when maxDepth is reached.
	 *
	 * This package exports a functionLabelGenerator that is suitable for most use cases. It returns the string "(Function)" in the color of your choice. It also exports a defaultFunctionLabel function that calls the functionLabelGenerator without applying any coloring and a ansiBlackModeFunctionLabel function that calls the functionLabelGenerator with ansi coloring suitable to black mode.
	 */
	readonly functionLabel: FormattedString.Type;
	/**
	 * Text to show instead of a non-null object when maxDepth is reached.
	 * 
	 This package exports an objectLabelGenerator that is suitable for most use cases. It returns the string "{Object}" in the color of your choice. It also exports a defaultObjectLabel function that calls the objectLabelGenerator without applying any coloring and a ansiBlackModeObjectLabel function that calls the objectLabelGenerator with ansi coloring suitable to black mode.
	 */
	readonly objectLabel: FormattedString.Type;

	/**
	 * Whether or not array properties should be sorted using the propertySortOrder below. You will usually want this value to be false if options.showNonEnumerableProperties is false, that is you will want to leave array properties sorted from lower to higher index. If you set this value to true, array properties may be sorted alphabetically on their index converted to a string (depending on the used propertySortOrder), which is seldom what you will want.
	 */
	readonly sortArrays: boolean;

	/**
	 * If true, only the first occurrence of each property with the same name is kept. If false, all occurrences of the same property are kept. As sorting happens before deduping, you can choose which property is kept when dedupeRecordProperties is true.
	 */
	readonly dedupeRecordProperties: boolean;

	/**
	 * Order used to sort properties when displaying records. If you are not an Effect user, `Order.Order<ValueWrapper.AllImmutable>` is a function with the signature (self: ValueWrapper.AllImmutable, that: ValueWrapper.AllImmutable)=> -1 | 0 | 1 that returns -1 if self is less than that, 0 if self is equal to that and 1 if self is greater than that. Note that the `valueLines` property of the passed wrappers, and the `valueLines` and 'constituents` properties of each of their constituents are empty arrays at this early stage of the stringification process. Both valueLines and constituents of the passed wrappers are immutable and can therefore not be modified.
	 *
	 * This package exports 5 predefined orders:
	 * - ValueWrapper.byPrototypalDepth: sorts the properties by prototypal depth, lowest depth first.
	 * - ValueWrapper.byKey: sorts properties by key after converting the key to a string.
	 * - ValueWrapper.byCallability: sorts by callability (non functions first, then functions)
	 * - ValueWrapper.byType: sorts by type (symbolic keys first, then string keys)
	 * - ValueWrapper.byEnumerability: sorts by enumerability (non-enumerable keys first, then enumerable keys)
	 * You may use any of these orders individually or, if you are an Effect user, you can make use of the Order.combine or Order.combineAll combinators to achieve more elaborate orders. Combining orders is also feasible for non Effect users by using a few `if` statements.
	 **/
	readonly propertySortOrder: Order.Order<ValueWrapper.AllImmutable>;

	/**
	 * This function is used to bypass the stringification process of a ValueWrapper. If it returns a `Some<utilities.ValueLines>` or a value of type utilities.ValueLines, these utilities.ValueLines will be displayed as is to represent the valueWrapper. If it returns a none or null or undefined, the normal stringification process will be applied. For primitive types, the normal stringification process is to call the toString method (except for `null` and `undefined` which are printed as 'null' and 'undefined' respectively). For records, the normal stringification process consists in stringifying the constituents of the record (obtained by calling Reflect.ownKeys). Note that the `valueLines` and `constituents` property of the passed valueWrapper are empty arrays at this early stage of the stringification process. They are immutable and can therefore not be modified.
	 *
	 * This package exports a byPasserGenerator that is suitable for most use cases. Depending on the type of the passed valueWrapper, it returns the following values:
	 * string: returns a some of the string enclosed in single quotes colored by the stringColorer function passed as parameter.
	 * number, boolean, symbol and bigint: return a some of the output of the toString method colored by the valueColorer function passed as parameter (the `bigIntMark` parameter  can be used to append a distinctive mark to bigInt numbers).
	 * null: returns a some of the 'null' string colored by the value colorer function unless options.showNullables is false in which case it returns a some of an empty string.
	 * undefined: returns a some of the 'undefined' string colored by the value colorer function unless options.showNullables is false in which case it returns a some of an empty string.
	 * arrays: returns a none
	 * functions: returns a some of options.functionLabel
	 * non-null objects: tries to call the toString (if different from Object.prototype.toString) and toJSON methods (toString first and toJSON second). Returns a some of the result if successful. Returns a none otherwise.
	 */
	readonly byPasser: (
		valueWrapper: ValueWrapper.AllImmutable
	) => MOption.OptionOrNullable<utilities.ValueLines>;

	/**
	 * Function used to stringify a record when options.recordByPasser has returned a none. This function must directly set the mutable `valueLines` property of the passed recordWrapper by combining the valueLines `properties` of its constituents which it may also modify to store temporrary results. Note that the `constituents` property of its constituents are empty arrays at this late stage of the stringification process. Although allowed, it is not recommended to modify the `constituents` property of the passed recordWrapper, or the constituents property of its constituents in any manner.
	 * It adds at the start of the first value line the key suffixed or prefixed by a prototype mark repeated protoDepth-parentProtoDepth times followed by ': '. By using a prototype suffix and the default propertySortOrder, you will get all properties with the same name grouped together ordered by prototypal depth. By using neither prefix nor suffix and the default propertySortOrder, you will get only for each property the instance with the lowest prototypal depth even if this property is present at several levels in the prototypal chain. By using a prototype prefix and the default propertySortOrder, you will see prototype properties all grouped together from lowest prototype level to highest prototype level.
	 */

	/**
	 * Function used to format a record when displayed on the basis of its constituents, i.e when recordByPasser returns a none or a nullable value. formattedConstituents is an array of the formatted values contained by the record after filtering, sorting and formatting of the properties with the propertyFormatter function. See description of the algorithm for more details. This package exports a basicOneLineRecordFormatter that intersperses ', ' between the constituents of the record and surrounds the result with '{ ' and ' }'. It also exports an ansiOneLineRecordFormatter function (same as basicOneLineRecordFormatter but with Ansi colors). The ', ', '{ ', and ' }' strings are configurable.
	 */
	readonly recordFormatter: ValueWrapper.RecordModifier;
}

/**
 * Example property filter that keeps only string properties fulfilling a predicate
 * @param predicate The predicate to fulfill (takes a string, returns a boolean)
 */
export const propertyNamePredicateFilter = (
	predicate: Predicate.Predicate<string>
): Type['propertyFilter'] =>
	ValueWrapper.mapConstituents(
		Array.filter(MPredicate.struct({ stringKey: predicate, hasSymbolicKey: Boolean.not }))
	);

/**
 * Example property filter that will only keep enumerable properties on arrays. Used in conjunction with options.showNonEnumerableProperties=true, it allows you to show non-enumerable properties on all non-null objects and functions, but not on arrays.
 */
export const enumerablePropertyFilterForArrays: Type['propertyFilter'] = flow(
	MMatch.make,
	MMatch.when(
		ValueWrapper.isArray,
		ValueWrapper.mapConstituents(Array.filter(Struct.get('hasEnumerableKey')))
	),
	MMatch.orElse(Function.identity)
);

/**
 * Colorset for uncolored output
 * @category Instances
 */
export const uncoloredColorSet: utilities.ColorSet = {
	stringColorer: Function.identity,
	valueColorer: Function.identity,
	symbolColorer: Function.identity,
	bigIntMarkColorer: Function.identity,
	toStringedObjectColorer: Function.identity,
	functionPropertyKeyColorer: Function.identity,
	symbolPropertyKeyColorer: Function.identity,
	otherPropertyKeyColorer: Function.identity,
	recordSeparatorColorer: Function.identity,
	recordDelimitersColorerWheel: Array.empty(),
	objectPropertySeparatorColorer: Function.identity,
	prototypeMarkColorer: Function.identity,
	multiLineIndentColorer: Function.identity
};

/**
 * Colorset for ansi black mode
 * @category Instances
 */
export const ansiBlackModeColorSet: utilities.ColorSet = {
	stringColorer: JsANSI.green,
	valueColorer: JsANSI.yellow,
	symbolColorer: JsANSI.cyan,
	bigIntMarkColorer: JsANSI.magenta,
	toStringedObjectColorer: JsANSI.yellow,
	functionPropertyKeyColorer: JsANSI.blue,
	symbolPropertyKeyColorer: JsANSI.cyan,
	otherPropertyKeyColorer: JsANSI.red,
	recordSeparatorColorer: JsANSI.white,
	recordDelimitersColorerWheel: Array.make(
		JsANSI.green,
		JsANSI.yellow,
		JsANSI.magenta,
		JsANSI.cyan,
		JsANSI.blue,
		JsANSI.red,
		JsANSI.white
	),
	objectPropertySeparatorColorer: JsANSI.white,
	prototypeMarkColorer: JsANSI.green,
	multiLineIndentColorer: JsANSI.green
};

/**
 * generator of RecordByPassers
 * @param stringDelimiter The string used to surround string values
 * @param stringColorer The function used to colorize string values
 * @param valueColorer The function used to colorize number, boolean, bigInt, null or undefined values
 * @param bigIntMark The string to append to bigInt values
 * @param bigIntMarkColorer The function used to colorize the bigInt mark
 * @param symbolColorer The function used to colorize symbol values
 * @param objectColorer The function used to colorize non-null objects that have a toString or toJSON method
 * @param showNullables If true, null and undefined values are shown. False may be used when treeifying
 */
export const byPasserGenerator =
	({
		stringDelimiter,
		bigIntMark,
		showNullableValues,
		colorSet
	}: {
		readonly stringDelimiter: string;
		readonly bigIntMark: string;
		readonly showNullableValues: boolean;
		readonly colorSet: utilities.ColorSet;
	}): Type['byPasser'] =>
	(valueWrapper) =>
		pipe(
			valueWrapper.value,
			MMatch.make,
			MMatch.when(
				MTypes.isString,
				flow(
					MString.prepend(stringDelimiter),
					MString.append(stringDelimiter),
					$(colorSet.stringColorer),
					Array.of,
					Option.some
				)
			),
			MMatch.whenOr(
				MTypes.isNumber,
				MTypes.isBoolean,
				flow(MString.fromNonNullPrimitive, $(colorSet.valueColorer), Array.of, Option.some)
			),
			MMatch.when(
				MTypes.isBigInt,
				flow(
					MString.fromNonNullPrimitive,
					$(colorSet.valueColorer),
					FormattedString.append($(colorSet.bigIntMarkColorer)(bigIntMark)),
					Array.of,
					Option.some
				)
			),
			MMatch.when(
				MTypes.isSymbol,
				flow(MString.fromNonNullPrimitive, $(colorSet.symbolColorer), Array.of, Option.some)
			),
			MMatch.when(MTypes.isNull, () =>
				showNullableValues ?
					pipe('null', $(colorSet.valueColorer), Array.of, Option.some)
				:	Option.some(Array.empty())
			),
			MMatch.when(MTypes.isUndefined, () =>
				showNullableValues ?
					pipe('undefined', $(colorSet.valueColorer), Array.of, Option.some)
				:	Option.some(Array.empty())
			),
			MMatch.when(MTypes.isFunction, () =>
				pipe(valueWrapper.options.functionLabel, Array.of, Option.some)
			),
			MMatch.when(MTypes.isArray, () => Option.none<utilities.ValueLines>()),
			MMatch.orElse(
				flow(
					MString.tryToStringToJson,
					Option.map(
						flow(
							MMatch.make,
							MMatch.tryFunction(flow(String.split('\n'), Option.liftPredicate(MTypes.isOverTwo))),
							MMatch.orElse(String.split('\r')),
							Array.map(flow(String.trim, $(colorSet.toStringedObjectColorer)))
						)
					)
				)
			)
		);

const arrayNoMarks = {
	arrayStartDelimiter: '',
	arrayEndDelimiter: ''
};

const objectNoMarks = {
	objectStartDelimiter: '',
	objectEndDelimiter: ''
};

/**
 * Record marks for multi-line output
 * @category Instances
 */
export const multiLineAutoRecordFormat = RecordFormat.Auto({
	arrayStartDelimiter: '[',
	arrayEndDelimiter: ']',
	arraySeparator: ',',
	objectStartDelimiter: '{',
	objectEndDelimiter: '}',
	objectSeparator: ',',
	propertySeparator: ': ',
	prototypePrefix: '',
	prototypeSuffix: '@'
});

/**
 * Record marks for single line output
 * @category Instances
 */
export const singleLineAutoRecordFormat = RecordFormat.Auto({
	...multiLineAutoRecordFormat,
	arraySeparator: multiLineAutoRecordFormat.arraySeparator + ' ',
	objectStartDelimiter: multiLineAutoRecordFormat.objectStartDelimiter + ' ',
	objectEndDelimiter: ' ' + multiLineAutoRecordFormat.objectEndDelimiter,
	objectSeparator: multiLineAutoRecordFormat.objectSeparator + ' '
});

/**
 * Record marks for multi-line output without delimiters
 * @category Instances
 */
export const multiLineAutoRecordFormatWithoutDelimiters = RecordFormat.Auto({
	...multiLineAutoRecordFormat,
	...arrayNoMarks,
	...objectNoMarks
});

/**
 * Record marks for single-line output without delimiters
 * @category Instances
 */
export const singleLineAutoRecordFormatWithoutDelimiters = RecordFormat.Auto({
	...singleLineAutoRecordFormat,
	...arrayNoMarks,
	...objectNoMarks
});

/**
 * Object marks for multi-line output
 * @category Instances
 */
export const multiLineObjectFormat = RecordFormat.ObjectLike({
	...multiLineAutoRecordFormat
});

/**
 * Object marks for single line output
 * @category Instances
 */
export const singleLineObjectFormat = RecordFormat.ObjectLike({
	...singleLineAutoRecordFormat
});

/**
 * Object marks for multi-line output without delimiters
 * @category Instances
 */
export const multiLineObjectFormatWithoutDelimiters = RecordFormat.ObjectLike({
	...multiLineAutoRecordFormatWithoutDelimiters
});

/**
 * Object marks for single-line output without delimiters
 * @category Instances
 */
export const singleLineObjectFormatWithoutDelimiters = RecordFormat.ObjectLike({
	...singleLineAutoRecordFormatWithoutDelimiters
});

/**
 * Indent characters for tabified output
 */
export const tabifyIndentMode: utilities.IndentMode = {
	initPropFirstLine: '  ',
	lastPropFirstLine: '  ',
	initPropInBetween: '  ',
	lastPropInBetween: '  '
};

/**
 * Indent characters for treeified output
 */
export const treeifyIndentMode: utilities.IndentMode = {
	initPropFirstLine: '├─ ',
	lastPropFirstLine: '└─ ',
	initPropInBetween: '│  ',
	lastPropInBetween: '   '
};

/**
 * Split mode for single-line output
 */
export const singleLineSplitMode = SplitMode.SingleLine({
	singleLineRecordFormat: singleLineAutoRecordFormat
});

/**
 * Split mode for tabified multi-line output
 */
export const multiLineTabifySplitMode = SplitMode.MultiLine({
	multiLineRecordFormat: multiLineAutoRecordFormat,
	indentMode: tabifyIndentMode
});

/**
 * Split mode for output on single line/tabified multi-line depending on whether total length of constituents exceeds 40
 */
export const whenTotalLengthExceeds40SplitMode = SplitMode.AutoBasedOnConstituentsLength({
	singleLineRecordFormat: singleLineAutoRecordFormat,
	multiLineRecordFormat: multiLineAutoRecordFormat,
	indentMode: tabifyIndentMode,
	limit: 40
});

/**
 * Split mode for treeified output
 */
export const treeifySplitMode = SplitMode.MultiLine({
	multiLineRecordFormat: multiLineObjectFormatWithoutDelimiters,
	indentMode: treeifyIndentMode
});

/**
 * Stringify options generator
 */

export const generator = ({
	stringDelimiter = "'",
	bigIntMark = 'n',
	showNullableValues = true,
	splitMode = whenTotalLengthExceeds40SplitMode,
	colorSet = uncoloredColorSet
}: {
	readonly stringDelimiter?: string;
	readonly bigIntMark?: string;
	readonly showNullableValues?: boolean;
	readonly splitMode?: SplitMode.All;
	readonly colorSet?: utilities.ColorSet;
} = {}): Type => ({
	showSymbolicProperties: true,
	showStringProperties: true,
	showEnumerableProperties: true,
	showNonEnumerableProperties: false,
	showFunctions: true,
	showNonFunctions: true,
	propertyFilter: Function.identity,
	circularLabel: $(colorSet.valueColorer)('(Circular)'),
	arrayLabel: $(colorSet.valueColorer)('[Array]'),
	objectLabel: $(colorSet.valueColorer)('{Object}'),
	functionLabel: $(colorSet.valueColorer)('(Function)'),
	sortArrays: false,
	propertySortOrder: Order.combineAll([
		ValueWrapper.byCallability,
		ValueWrapper.byType,
		ValueWrapper.byStringKey
	]),
	byPasser: byPasserGenerator({
		stringDelimiter,
		bigIntMark,
		showNullableValues,
		colorSet
	}),
	recordFormatter: SplitMode.format(colorSet)(splitMode),
	maxDepth: 10,
	maxPrototypeDepth: 0,
	dedupeRecordProperties: false
});

/**
 * Options for uncolored output split on several lines when total length of record constituents exceeds 40
 */
export const uncoloredTabifiedSplitWhenTotalLengthExceeds40: Type = generator();
/**
 * Options for output split on several lines when total length of record constituents exceeds 40 with colors adapted to ansi black mode
 */
export const ansiBlackModeTabifiedSplitWhenTotalLengthExceeds40: Type = generator({
	colorSet: ansiBlackModeColorSet
});
/**
 * Options for uncolored single-line output
 */
export const uncoloredSingleLine: Type = generator({
	splitMode: singleLineSplitMode
});
/**
 * Options for single-line output with colors adapted to ansi black mode
 */
export const ansiBlackModeSingleLine: Type = generator({
	splitMode: singleLineSplitMode,
	colorSet: ansiBlackModeColorSet
});
/**
 * Options for uncolored tabified multi-line output
 */
export const uncoloredTabifiedMultiLine: Type = generator({
	splitMode: multiLineTabifySplitMode
});
/**
 * Options for tabified multi-line output with colors adapted to ansi black mode
 */
export const ansiBlackModeTabifiedMultiLine: Type = generator({
	splitMode: multiLineTabifySplitMode,
	colorSet: ansiBlackModeColorSet
});
/**
 * Options for uncolored treeified output
 */
export const uncoloredTreeified: Type = generator({
	showNullableValues: false,
	splitMode: treeifySplitMode
});
/**
 * Options for treeified output with colors adapted to ansi black mode
 */
export const ansiBlackModeTreeified: Type = generator({
	showNullableValues: false,
	splitMode: treeifySplitMode,
	colorSet: ansiBlackModeColorSet
});
