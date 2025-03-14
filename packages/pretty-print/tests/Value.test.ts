/* eslint-disable functional/no-expression-statements */
import { MUtils } from '@parischap/effect-lib';
import { PPValue } from '@parischap/pretty-print';
import { Equal } from 'effect';
import { describe, expect, it } from 'vitest';

describe('Value', () => {
	const value1 = PPValue.fromTopValue(3);
	const value2 = PPValue.fromTopValue(3);
	const value3 = PPValue.fromTopValue(2);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(PPValue.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(Equal.equals(value1, value2)).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(value1, value3)).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(value1.toString()).toBe(`{
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
}`);
		});

		it('.pipe()', () => {
			expect(value1.pipe(PPValue.content)).toBe(3);
		});

		describe('has', () => {
			it('Matching', () => {
				expect(PPValue.has(value1)).toBe(true);
			});
			it('Non matching', () => {
				expect(PPValue.has(new Date())).toBe(false);
			});
		});
	});

	describe('fromNonPrimitiveValueAndKey', () => {
		it('Enumerable property', () => {
			expect(
				PPValue.fromNonPrimitiveValueAndKey({
					nonPrimitiveContent: { a: 1, b: 'foo' },
					key: 'a',
					depth: 1,
					protoDepth: 0
				}).toString()
			).toBe(`{
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
}`);
		});

		it('Non-enumerable property', () => {
			expect(
				PPValue.fromNonPrimitiveValueAndKey({
					nonPrimitiveContent: [1, 2],
					key: 'length',
					depth: 1,
					protoDepth: 0
				}).toString()
			).toBe(`{
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
}`);
		});
	});
});

it('fromIterable', () => {
	expect(
		PPValue.fromIterable({
			content: 'foo',
			stringKey: ['a : 1', 'b : 2'],
			depth: 1
		}).toString()
	).toBe(`{
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
}`);
});
