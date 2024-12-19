/* eslint-disable functional/no-expression-statements */
import { MString, MUtils } from '@parischap/effect-lib';
import { Array, Chunk, Equal, Option, pipe, String, Struct } from 'effect';
import { describe, expect, it } from 'vitest';
import { SearchResult } from '../esm/String.js';

describe('MString', () => {
	it('moduleTag', () => {
		expect(MString.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
	});

	describe('SearchResult', () => {
		const testSearchResult = SearchResult.make({ startIndex: 3, endIndex: 6, match: 'foo' });

		describe('Tag, prototype and guards', () => {
			describe('Equal.equals', () => {
				it('Matching', () => {
					expect(
						Equal.equals(
							testSearchResult,
							SearchResult.make({ startIndex: 3, endIndex: 6, match: 'foo' })
						)
					).toBe(true);
				});
				it('Non matching', () => {
					expect(
						Equal.equals(
							testSearchResult,
							SearchResult.make({ startIndex: 3, endIndex: 6, match: 'baz' })
						)
					).toBe(false);
				});
			});

			it('.toString()', () => {
				expect(testSearchResult.toString()).toBe(`{
  "_id": "@parischap/effect-lib/String/SearchResult/",
  "startIndex": 3,
  "endIndex": 6,
  "match": "foo"
}`);
			});

			it('.pipe()', () => {
				expect(testSearchResult.pipe(Struct.get('startIndex'))).toBe(3);
			});

			describe('has', () => {
				it('Matching', () => {
					expect(MString.SearchResult.has(testSearchResult)).toBe(true);
				});
				it('Non matching', () => {
					expect(MString.SearchResult.has(new Date())).toBe(false);
				});
			});
		});

		it('byLongestFirst', () => {
			expect(
				MString.SearchResult.byLongestFirst(
					testSearchResult,
					SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' })
				)
			).toBe(-1);
			expect(
				MString.SearchResult.byLongestFirst(
					testSearchResult,
					SearchResult.make({ startIndex: 3, endIndex: 7, match: 'foo1' })
				)
			).toBe(1);
		});
	});

	describe('fromPrimitive', () => {
		it('null', () => {
			expect(pipe(null, MString.fromPrimitive)).toBe('null');
		});

		it('undefined', () => {
			expect(pipe(undefined, MString.fromPrimitive)).toBe('undefined');
		});

		it('number', () => {
			expect(pipe(5, MString.fromPrimitive)).toBe('5');
		});
	});

	describe('search', () => {
		it('string in empty string', () => {
			expect(pipe('', MString.search('foo', 4), Option.isNone)).toBe(true);
		});

		it('string in string containing one occurence', () => {
			expect(
				pipe(
					'the foo is bar',
					MString.search('foo', 4),
					Equal.equals(
						Option.some(MString.SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }))
					)
				)
			).toBe(true);
		});

		it('string in string containing two occurences with startIndex=4', () => {
			expect(
				pipe(
					'the foo is foo',
					MString.search('foo', 4),
					Equal.equals(
						Option.some(MString.SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }))
					)
				)
			).toBe(true);
		});

		it('string in string containing two occurences with startIndex=5', () => {
			expect(
				pipe(
					'the foo is foo',
					MString.search('foo', 5),
					Equal.equals(
						Option.some(MString.SearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }))
					)
				)
			).toBe(true);
		});

		it('RegExp in empty string', () => {
			expect(pipe('', MString.search(/f.o/, 4), Option.isNone)).toBe(true);
		});

		it('RegExp in string containing one occurence', () => {
			expect(
				pipe(
					'the foo is bar',
					MString.search(/f.o/, 4),
					Equal.equals(
						Option.some(MString.SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }))
					)
				)
			).toBe(true);
		});

		it('RegExp in string containing two occurences with startIndex=4', () => {
			expect(
				pipe(
					'the foo is foo',
					MString.search(/f.o/, 4),
					Equal.equals(
						Option.some(MString.SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }))
					)
				)
			).toBe(true);
		});

		it('RegExp in string containing two occurences with startIndex=5', () => {
			expect(
				pipe(
					'the foo is foo',
					MString.search(/f.o/, 5),
					Equal.equals(
						Option.some(MString.SearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }))
					)
				)
			).toBe(true);
		});
	});

	describe('searchAll', () => {
		//const arrayEq = Array.getEquivalence(MString.SearchResult.Equivalence);

		it('string in empty string', () => {
			expect(pipe('', MString.searchAll('foo'), Array.isEmptyArray)).toBe(true);
		});

		it('string in string containing two occurences', () => {
			expect(
				pipe(
					'the foo is foo',
					MString.searchAll('foo'),
					// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
					Chunk.fromIterable,
					Equal.equals(
						Chunk.make(
							MString.SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }),
							MString.SearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' })
						)
					)
				)
			).toBe(true);
		});

		it('RegExp in empty string', () => {
			expect(pipe('', MString.searchAll(/f.o/), Array.isEmptyArray)).toBe(true);
		});

		it('RegExp in string containing two occurences', () => {
			expect(
				pipe(
					'the foo is fuo',
					MString.searchAll(/f.o/),
					// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
					Chunk.fromIterable,
					Equal.equals(
						Chunk.make(
							MString.SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }),
							MString.SearchResult.make({ startIndex: 11, endIndex: 14, match: 'fuo' })
						)
					)
				)
			).toBe(true);
		});
	});

	describe('searchRight', () => {
		it('string in empty string', () => {
			expect(pipe('', MString.searchRight('foo'), Option.isNone)).toBe(true);
		});

		it('string in string containing one occurence', () => {
			expect(
				pipe(
					'the bar is foo',
					MString.searchRight('foo'),
					Equal.equals(
						Option.some(MString.SearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }))
					)
				)
			).toBe(true);
		});

		it('string in string containing two occurences', () => {
			expect(
				pipe(
					'the foo is foo',
					MString.searchRight('foo'),
					Equal.equals(
						Option.some(MString.SearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }))
					)
				)
			).toBe(true);
		});

		it('RegExp in empty string', () => {
			expect(pipe('', MString.searchRight(/f.o/), Option.isNone)).toBe(true);
		});

		it('RegExp in string containing one occurence', () => {
			expect(
				pipe(
					'the foo is bar',
					MString.searchRight(/f.o/),
					Equal.equals(
						Option.some(MString.SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }))
					)
				)
			).toBe(true);
		});

		it('RegExp in string containing two occurences', () => {
			expect(
				pipe(
					'the foo is foo',
					MString.searchRight(/f.o/),
					Equal.equals(
						Option.some(MString.SearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }))
					)
				)
			).toBe(true);
		});
	});

	describe('takeLeftTo', () => {
		it('string in empty string', () => {
			expect(pipe('', MString.takeLeftTo('foo'), String.isEmpty)).toBe(true);
		});

		it('RegExp in non-empty string', () => {
			expect(pipe('the bar is foo', MString.takeLeftTo(/bar/))).toBe('the ');
		});

		it('string with regexp special characters in non-empty string', () => {
			expect(pipe('foo.bar.baz', MString.takeLeftTo('.'))).toBe('foo');
		});
	});

	describe('takeRightFrom', () => {
		it('string in empty string', () => {
			expect(pipe('', MString.takeRightFrom('is'), String.isEmpty)).toBe(true);
		});

		it('RegExp in non-empty string', () => {
			expect(pipe('the bar is foo', MString.takeRightFrom(/is/))).toBe(' foo');
		});
	});

	describe('takeLeftBut', () => {
		it('Empty string', () => {
			expect(pipe('', MString.takeLeftBut(2), String.isEmpty)).toBe(true);
		});

		it('Non-empty string', () => {
			expect(pipe('foo is', MString.takeLeftBut(3))).toBe('foo');
		});
	});

	describe('takeRightBut', () => {
		it('Empty string', () => {
			expect(pipe('', MString.takeRightBut(2), String.isEmpty)).toBe(true);
		});

		it('Non-empty string', () => {
			expect(pipe('foo is', MString.takeRightBut(4))).toBe('is');
		});
	});

	describe('trimStart', () => {
		it('Empty string', () => {
			expect(pipe('', MString.trimStart('0'), String.isEmpty)).toBe(true);
		});

		it('Non-empty string with the character to remove not at the start', () => {
			expect(pipe('12034000', MString.trimStart('0'))).toBe('12034000');
		});

		it('Non-empty string with the character to remove at the start', () => {
			expect(pipe('0012034000', MString.trimStart('0'))).toBe('12034000');
		});
	});

	describe('trimEnd', () => {
		it('Empty string', () => {
			expect(pipe('', MString.trimEnd('0'), String.isEmpty)).toBe(true);
		});

		it('Non-empty string with the character to remove not at the end', () => {
			expect(pipe('00012034', MString.trimEnd('0'))).toBe('00012034');
		});

		it('Non-empty string with the character to remove at the end', () => {
			expect(pipe('0001203400', MString.trimEnd('0'))).toBe('00012034');
		});
	});

	describe('stripLeftOption', () => {
		it('Empty string', () => {
			expect(pipe('', MString.stripLeftOption('foo'), Option.isNone)).toBe(true);
		});

		it('Non-empty string with matching start', () => {
			expect(pipe('foo is', MString.stripLeftOption('foo '), Equal.equals(Option.some('is')))).toBe(
				true
			);
		});

		it('Non-empty string with non matching start', () => {
			expect(pipe('bar is', MString.stripLeftOption('foo '), Option.isNone)).toBe(true);
		});
	});

	describe('stripLeft', () => {
		it('Empty string', () => {
			expect(pipe('', MString.stripLeft('foo'), String.isEmpty)).toBe(true);
		});

		it('Non-empty string with matching start', () => {
			expect(pipe('foo is', MString.stripLeft('foo '))).toBe('is');
		});

		it('Non-empty string with non matching start', () => {
			expect(pipe('bar is', MString.stripLeft('foo '))).toBe('bar is');
		});
	});

	describe('stripRightOption', () => {
		it('Empty string', () => {
			expect(pipe('', MString.stripRightOption('foo'), Option.isNone)).toBe(true);
		});

		it('Non-empty string with matching end', () => {
			expect(
				pipe('foo is foo', MString.stripRightOption(' foo'), Equal.equals(Option.some('foo is')))
			).toBe(true);
		});

		it('Non-empty string with non matching start', () => {
			expect(pipe('foo is bar', MString.stripRightOption(' foo'), Option.isNone)).toBe(true);
		});
	});

	describe('stripRight', () => {
		it('Empty string', () => {
			expect(pipe('', MString.stripRight('foo'), String.isEmpty)).toBe(true);
		});

		it('Non-empty string with matching end', () => {
			expect(pipe('foo is foo', MString.stripRight(' foo'))).toBe('foo is');
		});

		it('Non-empty string with non matching end', () => {
			expect(pipe('foo is bar', MString.stripRight(' foo'))).toBe('foo is bar');
		});
	});

	describe('count', () => {
		it('string in empty string', () => {
			expect(pipe('', MString.count('foo'))).toBe(0);
		});

		it('RegExp in non-empty string', () => {
			expect(pipe('foo is fuo', MString.count(/f.o/))).toBe(2);
		});
	});

	describe('replaceBetween', () => {
		it('Empty string', () => {
			expect(pipe('', MString.replaceBetween('foo', 5, 2))).toBe('foo');
		});

		it('Replacement in non-empty string', () => {
			expect(pipe('foo saw bar and baz', MString.replaceBetween('himself', 8, 11))).toBe(
				'foo saw himself and baz'
			);
		});

		it('Insertion in non-empty string', () => {
			expect(pipe('foo saw baz', MString.replaceBetween('bar and ', 8, 8))).toBe(
				'foo saw bar and baz'
			);
		});

		it('Replacement in non-empty string with unorthodox arguments', () => {
			expect(pipe('foo saw bar', MString.replaceBetween('baz. baz', 8, 3))).toBe(
				'foo saw baz. baz saw bar'
			);
		});
	});

	describe('match', () => {
		it('Without global flag', () => {
			expect(
				pipe('Numbers between 1 and 9', MString.match(/\d/), Equal.equals(Option.some('1')))
			).toBe(true);
		});

		it('With global flag', () => {
			expect(
				pipe('Numbers between 1 and 9', MString.match(/\d/g), Equal.equals(Option.some('1')))
			).toBe(true);
		});
	});

	describe('splitAt', () => {
		it('Empty string', () => {
			expect(pipe('', MString.splitAt(2))).toStrictEqual(['', '']);
		});

		it('Non-empty string', () => {
			expect(pipe('beforeafter', MString.splitAt(6))).toStrictEqual(['before', 'after']);
		});
	});

	describe('splitAtFromRight', () => {
		it('Empty string', () => {
			expect(pipe('', MString.splitAtFromRight(2))).toStrictEqual(['', '']);
		});

		it('Non-empty string', () => {
			expect(pipe('beforeafter', MString.splitAtFromRight(5))).toStrictEqual(['before', 'after']);
		});
	});

	describe('splitEquallyRestAtStart', () => {
		it('Empty string', () =>
			expect(pipe('', MString.splitEquallyRestAtStart(3))).toStrictEqual(['']));

		it('Non-empty string without rest', () =>
			expect(pipe('foobarbaz', MString.splitEquallyRestAtStart(3))).toStrictEqual([
				'foo',
				'bar',
				'baz'
			]));

		it('Non-empty string with rest', () =>
			expect(pipe('afoobarbaz', MString.splitEquallyRestAtStart(3))).toStrictEqual([
				'a',
				'foo',
				'bar',
				'baz'
			]));
	});

	describe('splitEquallyRestAtEnd', () => {
		it('Empty string', () =>
			expect(pipe('', MString.splitEquallyRestAtEnd(3))).toStrictEqual(['']));

		it('Non-empty string without rest', () =>
			expect(pipe('foobarbaz', MString.splitEquallyRestAtEnd(3))).toStrictEqual([
				'foo',
				'bar',
				'baz'
			]));

		it('Non-empty string with rest', () =>
			expect(pipe('foobarbaza', MString.splitEquallyRestAtEnd(3))).toStrictEqual([
				'foo',
				'bar',
				'baz',
				'a'
			]));
	});

	describe('tabify', () => {
		const simpleTabify = MString.tabify('aa', 3);
		it('Value 1', () => {
			expect(simpleTabify('')).toBe('aaaaaa');
		});
		it('Value 2', () => {
			expect(simpleTabify('foo')).toBe('aaaaaafoo');
		});
		it('Value 3', () => {
			expect(simpleTabify('foo\r\nfoo1')).toBe('aaaaaafoo\r\naaaaaafoo1');
		});
	});

	describe('isMultiLine', () => {
		it('Matching - Windows', () => {
			expect(MString.isMultiLine('foo\r\nbar')).toBe(true);
		});
		it('Matching - Mac Os before X', () => {
			expect(MString.isMultiLine('foo\rbar')).toBe(true);
		});
		it('Matching - UNIX, Mac Os X', () => {
			expect(MString.isMultiLine('foo\nbar')).toBe(true);
		});
		it('Not matching - foo', () => {
			expect(MString.isMultiLine('foo')).toBe(false);
		});
	});

	describe('hasLength', () => {
		it('Simple string', () => {
			expect(pipe('foo', MString.hasLength(3))).toBe(true);
		});
	});
});
