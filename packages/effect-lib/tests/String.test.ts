/* eslint-disable functional/no-expression-statements */
import { MString } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Array, pipe, String, Struct } from 'effect';
import { describe, it } from 'vitest';
import { SearchResult } from '../esm/String.js';

describe('MString', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), MString.moduleTag);
	});

	describe('SearchResult', () => {
		const testSearchResult = SearchResult.make({ startIndex: 3, endIndex: 6, match: 'foo' });

		describe('Tag, prototype and guards', () => {
			describe('Equal.equals', () => {
				it('Matching', () => {
					TEUtils.assertEquals(
						testSearchResult,
						SearchResult.make({ startIndex: 3, endIndex: 6, match: 'foo' })
					);
				});
				it('Non matching', () => {
					TEUtils.assertNotEquals(
						testSearchResult,
						SearchResult.make({ startIndex: 3, endIndex: 6, match: 'baz' })
					);
				});
			});

			it('.toString()', () => {
				TEUtils.strictEqual(
					testSearchResult.toString(),
					`{
  "_id": "@parischap/effect-lib/String/SearchResult/",
  "startIndex": 3,
  "endIndex": 6,
  "match": "foo"
}`
				);
			});

			it('.pipe()', () => {
				TEUtils.strictEqual(testSearchResult.pipe(Struct.get('startIndex')), 3);
			});

			describe('has', () => {
				it('Matching', () => {
					TEUtils.assertTrue(MString.SearchResult.has(testSearchResult));
				});
				it('Non matching', () => {
					TEUtils.assertFalse(MString.SearchResult.has(new Date()));
				});
			});
		});

		it('byLongestFirst', () => {
			TEUtils.strictEqual(
				MString.SearchResult.byLongestFirst(
					testSearchResult,
					SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' })
				),
				-1
			);
			TEUtils.strictEqual(
				MString.SearchResult.byLongestFirst(
					testSearchResult,
					SearchResult.make({ startIndex: 3, endIndex: 7, match: 'foo1' })
				),
				1
			);
		});
	});

	describe('fromPrimitive', () => {
		it('null', () => {
			TEUtils.strictEqual(MString.fromPrimitive(null), 'null');
		});

		it('undefined', () => {
			TEUtils.strictEqual(MString.fromPrimitive(undefined), 'undefined');
		});

		it('Integer', () => {
			TEUtils.strictEqual(MString.fromPrimitive(5), '5');
		});

		it('Irrational number', () => {
			TEUtils.strictEqual(MString.fromPrimitive(16.0 / 3.0), '5.333333333333333');
		});

		it('Very small number', () => {
			TEUtils.strictEqual(MString.fromPrimitive(1e-8), '0.00000001');
		});

		it('Very large integer', () => {
			TEUtils.strictEqual(MString.fromPrimitive(1e22), '10000000000000000000000');
		});
	});

	describe('search', () => {
		it('string in empty string', () => {
			TEUtils.assertNone(MString.search('foo', 4)(''));
		});

		it('string in string containing one occurence', () => {
			TEUtils.assertSome(
				MString.search('foo', 4)('the foo is bar'),
				MString.SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' })
			);
		});

		it('string in string containing two occurences with startIndex=4', () => {
			TEUtils.assertSome(
				MString.search('foo', 4)('the foo is foo'),
				MString.SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' })
			);
		});

		it('string in string containing two occurences with startIndex=5', () => {
			TEUtils.assertSome(
				MString.search('foo', 5)('the foo is foo'),
				MString.SearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' })
			);
		});

		it('RegExp in empty string', () => {
			TEUtils.assertNone(MString.search(/f.o/, 4)(''));
		});

		it('RegExp in string containing one occurence', () => {
			TEUtils.assertSome(
				MString.search(/f.o/, 4)('the foo is bar'),
				MString.SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' })
			);
		});

		it('RegExp in string containing two occurences with startIndex=4', () => {
			TEUtils.assertSome(
				MString.search(/f.o/, 4)('the foo is foo'),
				MString.SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' })
			);
		});

		it('RegExp in string containing two occurences with startIndex=5', () => {
			TEUtils.assertSome(
				MString.search(/f.o/, 5)('the foo is foo'),
				MString.SearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' })
			);
		});
	});

	describe('searchAll', () => {
		it('string in empty string', () => {
			TEUtils.assertTrue(pipe('', MString.searchAll('foo'), Array.isEmptyArray));
		});

		it('string in string containing two occurences', () => {
			TEUtils.assertEquals(
				MString.searchAll('foo')('the foo is foo'),
				Array.make(
					MString.SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }),
					MString.SearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' })
				)
			);
		});

		it('RegExp in empty string', () => {
			TEUtils.assertTrue(pipe('', MString.searchAll(/f.o/), Array.isEmptyArray));
		});

		it('RegExp in string containing two occurences', () => {
			TEUtils.assertEquals(
				MString.searchAll(/f.o/)('the foo is fuo'),
				Array.make(
					MString.SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }),
					MString.SearchResult.make({ startIndex: 11, endIndex: 14, match: 'fuo' })
				)
			);
		});
	});

	describe('searchRight', () => {
		it('string in empty string', () => {
			TEUtils.assertNone(pipe('', MString.searchRight('foo')));
		});

		it('string in string containing one occurence', () => {
			TEUtils.assertSome(
				MString.searchRight('foo')('the bar is foo'),
				MString.SearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' })
			);
		});

		it('string in string containing two occurences', () => {
			TEUtils.assertSome(
				MString.searchRight('foo')('the foo is foo'),
				MString.SearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' })
			);
		});

		it('RegExp in empty string', () => {
			TEUtils.assertNone(MString.searchRight(/f.o/)(''));
		});

		it('RegExp in string containing one occurence', () => {
			TEUtils.assertSome(
				MString.searchRight(/f.o/)('the foo is bar'),
				MString.SearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' })
			);
		});

		it('RegExp in string containing two occurences', () => {
			TEUtils.assertSome(
				MString.searchRight(/f.o/)('the foo is foo'),
				MString.SearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' })
			);
		});
	});

	describe('takeLeftTo', () => {
		it('string in empty string', () => {
			TEUtils.assertTrue(pipe('', MString.takeLeftTo('foo'), String.isEmpty));
		});

		it('RegExp in non-empty string', () => {
			TEUtils.strictEqual(MString.takeLeftTo(/bar/)('the bar is foo'), 'the ');
		});

		it('string with regexp special characters in non-empty string', () => {
			TEUtils.strictEqual(MString.takeLeftTo('.')('foo.bar.baz'), 'foo');
		});
	});

	describe('takeRightFrom', () => {
		it('string in empty string', () => {
			TEUtils.assertTrue(pipe('', MString.takeRightFrom('is'), String.isEmpty));
		});

		it('RegExp in non-empty string', () => {
			TEUtils.strictEqual(MString.takeRightFrom(/is/)('the bar is foo'), ' foo');
		});
	});

	describe('takeLeftBut', () => {
		it('Empty string', () => {
			TEUtils.assertTrue(pipe('', MString.takeLeftBut(2), String.isEmpty));
		});

		it('Non-empty string', () => {
			TEUtils.strictEqual(MString.takeLeftBut(3)('foo is'), 'foo');
		});
	});

	describe('takeRightBut', () => {
		it('Empty string', () => {
			TEUtils.assertTrue(pipe('', MString.takeRightBut(2), String.isEmpty));
		});

		it('Non-empty string', () => {
			TEUtils.strictEqual(MString.takeRightBut(4)('foo is'), 'is');
		});
	});

	describe('trimStart', () => {
		it('Empty string', () => {
			TEUtils.assertTrue(pipe('', MString.trimStart('0'), String.isEmpty));
		});

		it('Non-empty string with the character to remove not at the start', () => {
			TEUtils.strictEqual(MString.trimStart('0')('12034000'), '12034000');
		});

		it('Non-empty string with the character to remove at the start', () => {
			TEUtils.strictEqual(MString.trimStart('0')('0012034000'), '12034000');
		});
	});

	describe('trimEnd', () => {
		it('Empty string', () => {
			TEUtils.assertTrue(pipe('', MString.trimEnd('0'), String.isEmpty));
		});

		it('Non-empty string with the character to remove not at the end', () => {
			TEUtils.strictEqual(MString.trimEnd('0')('00012034'), '00012034');
		});

		it('Non-empty string with the character to remove at the end', () => {
			TEUtils.strictEqual(MString.trimEnd('0')('0001203400'), '00012034');
		});
	});

	describe('stripLeftOption', () => {
		it('Empty string', () => {
			TEUtils.assertNone(MString.stripLeftOption('foo')(''));
		});

		it('Non-empty string with matching start', () => {
			TEUtils.assertSome(MString.stripLeftOption('foo ')('foo is'), 'is');
		});

		it('Non-empty string with non matching start', () => {
			TEUtils.assertNone(MString.stripLeftOption('foo ')('bar is'));
		});
	});

	describe('stripLeft', () => {
		it('Empty string', () => {
			TEUtils.assertTrue(pipe('', MString.stripLeft('foo'), String.isEmpty));
		});

		it('Non-empty string with matching start', () => {
			TEUtils.strictEqual(MString.stripLeft('foo ')('foo is'), 'is');
		});

		it('Non-empty string with non matching start', () => {
			TEUtils.strictEqual(MString.stripLeft('foo ')('bar is'), 'bar is');
		});
	});

	describe('stripRightOption', () => {
		it('Empty string', () => {
			TEUtils.assertNone(MString.stripRightOption('foo')(''));
		});

		it('Non-empty string with matching end', () => {
			TEUtils.assertSome(MString.stripRightOption(' foo')('foo is foo'), 'foo is');
		});

		it('Non-empty string with non matching start', () => {
			TEUtils.assertNone(MString.stripRightOption(' foo')('foo is bar'));
		});
	});

	describe('stripRight', () => {
		it('Empty string', () => {
			TEUtils.assertTrue(pipe('', MString.stripRight('foo'), String.isEmpty));
		});

		it('Non-empty string with matching end', () => {
			TEUtils.strictEqual(MString.stripRight(' foo')('foo is foo'), 'foo is');
		});

		it('Non-empty string with non matching end', () => {
			TEUtils.strictEqual(MString.stripRight(' foo')('foo is bar'), 'foo is bar');
		});
	});

	describe('count', () => {
		it('string in empty string', () => {
			TEUtils.strictEqual(MString.count('foo')(''), 0);
		});

		it('RegExp in non-empty string', () => {
			TEUtils.strictEqual(MString.count(/f.o/)('foo is fuo'), 2);
		});
	});

	describe('replaceBetween', () => {
		it('Empty string', () => {
			TEUtils.strictEqual(MString.replaceBetween('foo', 5, 2)(''), 'foo');
		});

		it('Replacement in non-empty string', () => {
			TEUtils.strictEqual(
				MString.replaceBetween('himself', 8, 11)('foo saw bar and baz'),
				'foo saw himself and baz'
			);
		});

		it('Insertion in non-empty string', () => {
			TEUtils.strictEqual(
				MString.replaceBetween('bar and ', 8, 8)('foo saw baz'),
				'foo saw bar and baz'
			);
		});

		it('Replacement in non-empty string with unorthodox arguments', () => {
			TEUtils.strictEqual(
				MString.replaceBetween('baz. baz', 8, 3)('foo saw bar'),
				'foo saw baz. baz saw bar'
			);
		});
	});

	describe('match', () => {
		it('Without global flag', () => {
			TEUtils.assertSome(MString.match(/\d/)('Numbers between 1 and 9'), '1');
		});

		it('With global flag', () => {
			TEUtils.assertSome(MString.match(/\d/g)('Numbers between 1 and 9'), '1');
		});
	});

	describe('splitAt', () => {
		it('Empty string', () => {
			TEUtils.deepStrictEqual(MString.splitAt(2)(''), ['', '']);
		});

		it('Non-empty string', () => {
			TEUtils.deepStrictEqual(MString.splitAt(6)('beforeafter'), ['before', 'after']);
		});
	});

	describe('splitAtFromRight', () => {
		it('Empty string', () => {
			TEUtils.deepStrictEqual(MString.splitAtFromRight(2)(''), ['', '']);
		});

		it('Non-empty string', () => {
			TEUtils.deepStrictEqual(MString.splitAtFromRight(5)('beforeafter'), ['before', 'after']);
		});
	});

	describe('splitEquallyRestAtStart', () => {
		it('Empty string', () => TEUtils.deepStrictEqual(MString.splitEquallyRestAtStart(3)(''), ['']));

		it('Non-empty string without rest', () =>
			TEUtils.deepStrictEqual(MString.splitEquallyRestAtStart(3)('foobarbaz'), [
				'foo',
				'bar',
				'baz'
			]));

		it('Non-empty string with rest', () =>
			TEUtils.deepStrictEqual(MString.splitEquallyRestAtStart(3)('afoobarbaz'), [
				'a',
				'foo',
				'bar',
				'baz'
			]));
	});

	describe('splitEquallyRestAtEnd', () => {
		it('Empty string', () => TEUtils.deepStrictEqual(MString.splitEquallyRestAtEnd(3)(''), ['']));

		it('Non-empty string without rest', () =>
			TEUtils.deepStrictEqual(MString.splitEquallyRestAtEnd(3)('foobarbaz'), [
				'foo',
				'bar',
				'baz'
			]));

		it('Non-empty string with rest', () =>
			TEUtils.deepStrictEqual(MString.splitEquallyRestAtEnd(3)('foobarbaza'), [
				'foo',
				'bar',
				'baz',
				'a'
			]));
	});

	describe('tabify', () => {
		const simpleTabify = MString.tabify('aa', 3);
		it('Empty string', () => {
			TEUtils.strictEqual(simpleTabify(''), 'aaaaaa');
		});
		it('One-line string', () => {
			TEUtils.strictEqual(simpleTabify('foo'), 'aaaaaafoo');
		});
		it('Two-line string', () => {
			TEUtils.strictEqual(simpleTabify('foo\r\nfoo1'), 'aaaaaafoo\r\naaaaaafoo1');
		});
	});

	describe('isMultiLine', () => {
		it('Matching - Windows', () => {
			TEUtils.assertTrue(MString.isMultiLine('foo\r\nbar'));
		});
		it('Matching - Mac Os before X', () => {
			TEUtils.assertTrue(MString.isMultiLine('foo\rbar'));
		});
		it('Matching - UNIX, Mac Os X', () => {
			TEUtils.assertTrue(MString.isMultiLine('foo\nbar'));
		});
		it('Not matching - foo', () => {
			TEUtils.assertFalse(MString.isMultiLine('foo'));
		});
	});

	describe('hasLength', () => {
		it('Simple string', () => {
			TEUtils.assertTrue(MString.hasLength(3)('foo'));
		});
	});

	it('removeNCharsEveryMCharsFromRight', () => {
		TEUtils.strictEqual(
			MString.removeNCharsEveryMCharsFromRight({ n: 2, m: 3 })('1aafooaabaraabaz'),
			'1foobarbaz'
		);
	});

	describe('fulfillsRegExp', () => {
		const isDigit = MString.fulfillsRegExp(/\d/);
		it('Matching', () => {
			TEUtils.assertTrue(isDigit('9'));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(isDigit('a'));
		});
	});
});
