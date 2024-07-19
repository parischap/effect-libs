import { MTypes } from '@parischap/effect-lib';
import { Struct, flow } from 'effect';
import * as FormattedString from './FormattedString.js';
import * as Options from './Options.js';
import * as ValueWrapper from './ValueWrapper.js';
import type * as utilities from './utilities.js';

/**
 * Keywords: stringify, treeify, pretty-print, object inspect
 * 100% typescript, 100% functional programming
 * Written with Effect but can be utilized by non Effect users.
 * Fully customizable
 * No recursion
 * Cycle detection and memoization
 *
 * Usage: below an example that shows the simplest way to use this package.
 *
 * In this documentation, record refers to the Typescript type Record<string | symbol,any> which covers functions, arrays, and non-null objects.
 *
 * The type OptionOrNullable<T> that is used in several option properties has been introduced for non-Effect users. It is defined as `type OptionOrNullable<A> = Option.Option<A> | null | A;`. It means that the value is optional. Effect users will just pass an option as they are used to. Other users will directly pass the value if there is one, or null or undefined if there is none.
 *
 * FormattedString: this package implements a FormattedString module which is a string that may contain format characters, e.g css styles or ansi characters. The FormattedString interface contains a printedLength property that is the length of the printable characters of the string. This printedLength property comes in handy when you wish to split a record on several lines if its length (excluding formatting characters) exceeds a given limit.
 *
 * ValueWrapper: this package implements a ValueWrapper module that exports an interface Type<V> which represents a value of type V in its stringification context. In addition to the value itself, it contains:
 * depth: depth of the value in the initial value to stringify (number of nested arrays and objects to open to reach the value)
 * prototypalDepth: depth of the value in the prototypal chain from the initial value to stringify (number of prototypes to open to reach the value)
 * options: the options you passed when you called asLines or asString
 * key: the key to which the value is attached (an empty string if the value is not in a record, the index converted to a string if the value is in an array, the key if the value is in a non-null object or a function)
 * stringKey: the key converted to a string (only different from key when key is a symbol)
 * hasFunctionValue: a flag indicating that the value represents a function
 * hasSymbolicKey: a flag indicating that the key to which this value is attached is a string (as opposed to a symbol)
 * hasEnumerableKey: a flag indicating that the key to which this value is attached is enumerable
 * constituents: the constituents of the value (an array of ValueWrappers for a record, an empty array otherwise)
 * valueLines: an array of FormattedStrings which is the result of the stringification of that value.
 * parents: the list of all parents (direct and indirect) of the value. This property is used to detect cycles and should never need to be used.
 * Note that, for performance sake, the constituents and valueLines properties are mutable.
 * ValueWrapper exports three type aliases `type Record = Type<MTypes.Record>`, `type Primitive = Type<MTypes.Primitive>` and `type All = Type<MTypes.Unknown>`. The first one represents a wrapper that contains a value that is a record (array, function or non-null object), the second one a wrapper that contains a value that is a primitive, the third one is a union of the first two. It also exports an `AllImmutable` alias which is the same as 'All' but with immutable `constituents` and `valueLines` properties. It also exports a RecordModifier type alias that represents a function that takes a Record and returns a Record.
 *
 * Algorithm: internally, stringify uses a recursive function that takes an unknown value, the list of the parents of this value, a depth and a prototypal depth (upon the first call, the list of parents is empty, depth and prototypal depth are both 0). This function returns a possibly empty array of FormattedString's, one for each line of the result, which is determined as follows:
 * if the value is already in the list of its parents, the result is an array containing the value options.CircularLabel.
 * if the value is a primitive or a function, the result is obtained by calling options.simpleValueFormatter.
 * if the value is an array and depth >= options.maxDepth, the result is an array containing the value options.ArrayLabel.
 * if the value is a record and depth >= options.maxDepth, the result is an array containing the value options.ObjectLabel.
 * if the value is an array and depth < options.maxDepth, options.RecordValueByPasser is called. If that function returns a some, the contents of the some is returned as result. Otherwise stringify will call itself for each constituent of the array after adding the array to the list of parents and incrementing the depth (and the prototypal depth if options.cumulativeProtoDepth is true). options.arrayPropertyFormatter is called for each stringified constituent. The resulting array of arrays of FormattedString's (referred to as 'formatted array' afterwards) is passed to options.oneLineArrayFormatter. The result of this function (referred to as 'one-line result' afterwards), along with the formatted array, are then passed to options.lineBreakPredicate. If this predicate returns false, the final result is this one-line result. Otherwise, it is the result of calling options.multiLineArrayFormatter on the formatted array.
 * if the value is a record and maxDepth has not been reached, the algorithm is exactly the same as for arrays above (options.oneLineRecordFormatter and options.multiLineRecordFormatter will be called instead of options.oneLineArrayFormatter and options.multiLineArrayFormatter). But determining the constituents of the record requires another recursive function that takes a record and returns a list of its properties and that of its prototype, incrementing the prototypal depth at each call and stopping when options.maxPrototypeDepth is reached. No cycle detection is required in this case as Javascript won't allow for such a situation. Once the list of properties is obtained, it is filtered by applying options.showEnumerableProperties, options.showNonEnumerableProperties, options.showSymbolicProperties, options.showStringProperties, options.showFunctions, options.showNonFunctions and options.propertyFilter. The remaining properties are sorted, deduped if options.dedupeRecordProperties is true and formatted by calling options.RecordValuePropertyFormatter.
 *
 * Note: although the functions are called oneLineArrayFormatter and oneLineRecordFormatter, the output needs not be a single line.
 */

/**
 * Pretty prints a value yielding the result as an array of FormattedString's
 *
 * @param u The value to print
 *
 */
export const asLines = (
	options: Options.Type = Options.uncoloredTabifiedSplitWhenTotalLengthExceeds40
): MTypes.OneArgFunction<unknown, utilities.ValueLines> =>
	flow(ValueWrapper.makeFromValue(options), ValueWrapper.stringify, Struct.get('valueLines'));
/**
 * Pretty prints a value yielding the result as a string
 *
 * @param u The value to print
 *
 */
export const asString = (
	options: Options.Type & {
		readonly lineSep?: FormattedString.Type;
	} = Options.uncoloredTabifiedSplitWhenTotalLengthExceeds40
): MTypes.OneArgFunction<unknown, string> =>
	flow(
		asLines(options),
		FormattedString.join(options.lineSep ?? FormattedString.makeWith()('\n')),
		Struct.get('value')
	);
