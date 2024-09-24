/* eslint-disable functional/no-expression-statements */
import { Options, Stringify, ValueOrder } from '@parischap/pretty-print';
import { Order } from 'effect';

const singleLine = Stringify.asString(Options.ansiDarkSingleLine);
const singleLineWithProto = Stringify.asString({
	...Options.ansiDarkSingleLine,
	maxPrototypeDepth: +Infinity
});
const dedupedSingleLineWithProto = Stringify.asString({
	...Options.ansiDarkSingleLine,
	maxPrototypeDepth: +Infinity,
	propertySortOrder: Order.combine(ValueOrder.byStringKey, ValueOrder.byPrototypalDepth),
	dedupeRecordProperties: true
});

const proto = {
	a: 10,
	c: 20
};

const toPrint = Object.assign(Object.create(proto), { a: 50, b: 30 }) as unknown;

// { a: 50, b: 30 }
console.log(singleLine(toPrint));
// { a: 50, a@: 10, b: 30, c@: 20 }
console.log(singleLineWithProto(toPrint));
// { a@: 10, b: 30, c@: 20 }
console.log(dedupedSingleLineWithProto(toPrint));
