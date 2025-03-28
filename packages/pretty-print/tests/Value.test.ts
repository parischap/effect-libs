/* eslint-disable functional/no-expression-statements */
import { PPValue } from '@parischap/pretty-print';
import { Equal } from 'effect';
import { describe, it } from 'vitest';

describe('Value', () => {
	const value1 = PPValue.fromTopValue(3);
	const value2 = PPValue.fromTopValue(3);
	const value3 = PPValue.fromTopValue(2);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), PPValue.moduleTag);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertTrue(Equal.equals(value1, value2));
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(Equal.equals(value1, value3));
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(
				value1.toString(),
				`{
  "_id": "@parischap/pretty-print/Value/",
  "content": 3,
  "contentType": 1,
  "depth": 0,
  "protoDepth": 0,
  "stringKey": [
    ""
  ],
  "oneLineStringKey": "",
  "hasSymbolicKey": false,
  "isEnumerable": false
}`
			);
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(value1.pipe(PPValue.content), 3);
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(PPValue.has(value1));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(PPValue.has(new Date()));
			});
		});
	});

	describe('fromNonPrimitiveValueAndKey', () => {
		it('Enumerable property', () => {
			TEUtils.strictEqual(
				PPValue.fromNonPrimitiveValueAndKey({
					nonPrimitiveContent: { a: 1, b: 'foo' },
					key: 'a',
					depth: 1,
					protoDepth: 0
				}).toString(),
				`{
  "_id": "@parischap/pretty-print/Value/",
  "content": 1,
  "contentType": 1,
  "depth": 1,
  "protoDepth": 0,
  "stringKey": [
    "a"
  ],
  "oneLineStringKey": "a",
  "hasSymbolicKey": false,
  "isEnumerable": true
}`
			);
		});

		it('Non-enumerable property', () => {
			TEUtils.strictEqual(
				PPValue.fromNonPrimitiveValueAndKey({
					nonPrimitiveContent: [1, 2],
					key: 'length',
					depth: 1,
					protoDepth: 0
				}).toString(),
				`{
  "_id": "@parischap/pretty-print/Value/",
  "content": 2,
  "contentType": 1,
  "depth": 1,
  "protoDepth": 0,
  "stringKey": [
    "length"
  ],
  "oneLineStringKey": "length",
  "hasSymbolicKey": false,
  "isEnumerable": false
}`
			);
		});
	});
});

it('fromIterable', () => {
	TEUtils.strictEqual(
		PPValue.fromIterable({
			content: 'foo',
			stringKey: ['a : 1', 'b : 2'],
			depth: 1
		}).toString(),
		`{
  "_id": "@parischap/pretty-print/Value/",
  "content": "foo",
  "contentType": 0,
  "depth": 1,
  "protoDepth": 0,
  "stringKey": [
    "a : 1",
    "b : 2"
  ],
  "oneLineStringKey": "a : 1b : 2",
  "hasSymbolicKey": false,
  "isEnumerable": true
}`
	);
});
