/* eslint-disable functional/no-expression-statements */
import { ASAnsiString, ASStyle, ASText } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Array, Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

const boldRed = pipe(ASStyle.red, ASStyle.merge(ASStyle.bold));
const boldRedFoo = boldRed('foo');

describe('ASText', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(ASText.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(Equal.equals(boldRedFoo, ASStyle.red(ASStyle.bold('foo')))).toBe(true);
			});
			it('Non matching', () => {
				expect(Equal.equals(boldRedFoo, ASStyle.bold('foo'))).toBe(false);
			});
		});

		describe('.toString()', () => {
			it('Simple string with no style', () => {
				expect(ASStyle.none('foo').toString()).toBe(`foo${ASAnsiString.resetAnsiString}`);
			});

			it('Bold red string', () => {
				expect(boldRedFoo.toString()).toBe(`\x1b[1;31mfoo${ASAnsiString.resetAnsiString}`);
			});
		});

		it('.pipe()', () => {
			expect(boldRedFoo.pipe(ASText.styledStrings, Array.length)).toBe(1);
		});

		describe('has', () => {
			it('Matching', () => {
				expect(ASText.has(boldRedFoo)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASText.has(new Date())).toBe(false);
			});
		});
	});

	it('toPrefixedAnsiString', () => {
		const text = ASStyle.noBlink(
			'foo ',
			boldRed(
				'goes ',
				ASStyle.italic('to '),
				ASStyle.Rgb.pink('the ', ASStyle.normal('beach ')),
				ASStyle.dim('to swim '),
				ASStyle.fastBlink('with bar ')
			)
		);
		console.log(text);
		expect(ASText.toPrefixedAnsiString(text)).toBe('afoobabarb');
	});

	/*it('append', () => {
		const result = foo.pipe(ASText.append(bar));
		expect(ASText.formatted(result)).toBe('afoobabarb');
		expect(ASText.unformatted(result)).toBe('foobar');
	});

	it('prepend', () => {
		const result = foo.pipe(ASText.prepend(bar));
		expect(ASText.formatted(result)).toBe('abarbafoob');
		expect(ASText.unformatted(result)).toBe('barfoo');
	});

	it('concat', () => {
		const result = ASText.concat(foo, bar, baz);
		expect(ASText.formatted(result)).toBe('afoobabarbabazb');
		expect(ASText.unformatted(result)).toBe('foobarbaz');
	});

	it('join', () => {
		const result = pipe(Array.make(foo, baz), ASText.join(bar));
		expect(ASText.formatted(result)).toBe('afoobabarbabazb');
		expect(ASText.unformatted(result)).toBe('foobarbaz');
	});

	it('repeat', () => {
		const result = foo.pipe(ASText.repeat(2));
		expect(ASText.formatted(result)).toBe('afoobafoob');
		expect(ASText.unformatted(result)).toBe('foofoo');
	});

	it('isEmpty', () => {
		expect(ASText.isEmpty(foo)).toBe(false);
		expect(ASText.isEmpty(ASText.empty)).toBe(true);
	});

	it('isNonEmpty', () => {
		expect(ASText.isNonEmpty(foo)).toBe(true);
		expect(ASText.isNonEmpty(ASText.empty)).toBe(false);
	});*/
});
