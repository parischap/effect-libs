/* eslint-disable functional/no-expression-statements */
import { PPOption, PPStringify, PPValueOrder } from '@parischap/pretty-print';
import { Order } from 'effect';

const singleLine = PPStringify.asString(PPOption.ansiDarkSingleLine);
const singleLineWithProto = PPStringify.asString(
	PPOption.make({
		...PPOption.ansiDarkSingleLine,
		maxPrototypeDepth: +Infinity
	})
);
const dedupedSingleLineWithProto = PPStringify.asString(
	PPOption.make({
		...PPOption.ansiDarkSingleLine,
		maxPrototypeDepth: +Infinity,
		propertySortOrder: Order.combine(PPValueOrder.byStringKey, PPValueOrder.byPrototypalDepth),
		dedupeRecordProperties: true
	})
);

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
