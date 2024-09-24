/* eslint-disable functional/no-expression-statements */
import { MSearchResult, MString } from '@parischap/effect-lib';
import { Array, Equal, Option, pipe, String, Utils } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MString', () => {
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
						Option.some(MSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }))
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
						Option.some(MSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }))
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
						Option.some(MSearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }))
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
						Option.some(MSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }))
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
						Option.some(MSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }))
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
						Option.some(MSearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }))
					)
				)
			).toBe(true);
		});
	});

	describe('searchAll', () => {
		//const arrayEq = Array.getEquivalence(MSearchResult.Equivalence);

		it('string in empty string', () => {
			expect(pipe('', MString.searchAll('foo'), Array.isEmptyArray)).toBe(true);
		});

		it('string in string containing two occurences', () => {
			expect(
				Utils.structuralRegion(() =>
					pipe(
						'the foo is foo',
						MString.searchAll('foo'),
						Equal.equals(
							Array.make(
								MSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }),
								MSearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' })
							)
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
				Utils.structuralRegion(() =>
					pipe(
						'the foo is fuo',
						MString.searchAll(/f.o/),
						Equal.equals(
							Array.make(
								MSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }),
								MSearchResult.make({ startIndex: 11, endIndex: 14, match: 'fuo' })
							)
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
						Option.some(MSearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }))
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
						Option.some(MSearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }))
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
						Option.some(MSearchResult.make({ startIndex: 4, endIndex: 7, match: 'foo' }))
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
						Option.some(MSearchResult.make({ startIndex: 11, endIndex: 14, match: 'foo' }))
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
	});

	describe('takeRightFrom', () => {
		it('string in empty string', () => {
			expect(pipe('', MString.takeRightFrom('is'), String.isEmpty)).toBe(true);
		});

		it('RegExp in non-empty string', () => {
			expect(pipe('the bar is foo', MString.takeRightFrom(/is/))).toBe(' foo');
		});
	});

	describe('tryToStringToJSON', () => {
		it('Object with default prototype', () => {
			expect(pipe({ a: 5 }, MString.tryToStringToJSON, Option.isNone)).toBe(true);
		});

		it('Date object', () => {
			expect(pipe(new Date(), MString.tryToStringToJSON, Option.isSome)).toBe(true);
		});

		it('Object with toJSON method', () => {
			expect(
				pipe({ toJSON: () => 'foo' }, MString.tryToStringToJSON, Equal.equals(Option.some('foo')))
			).toBe(true);
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
				pipe('Numbers between 1 and 9', MString.match(/\d/g), Equal.equals(Option.some(1)))
			).toBe(true);
		});
	});

	describe('splitAt', () => {
		it('Empty string', () => {
			const [before, after] = pipe('', MString.splitAt(0));
			expect(String.isEmpty(before)).toBe(true);
			expect(String.isEmpty(after)).toBe(true);
		});

		it('Non-empty string', () => {
			const [before, after] = pipe('beforeafter', MString.splitAt(6));
			expect(before).toBe('before');
			expect(after).toBe('after');
			expect(after).toBe('after');
		});
	});
});
