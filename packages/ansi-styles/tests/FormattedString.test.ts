/* eslint-disable functional/no-expression-statements */
import { ASFormattedString } from '@parischap/ansi-styles';
import { MTypes, MUtils } from '@parischap/effect-lib';
import { Array, Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

const f: MTypes.StringTransformer = (s) => 'a' + s + 'b';
const _ = ASFormattedString.fromStyleAndString(f);
const foo = _('foo');
const bar = _('bar');
const baz = _('baz');

describe('ASFormattedString', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(ASFormattedString.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(Equal.equals(_('foo'), foo)).toBe(true);
			});
			it('Non matching', () => {
				expect(Equal.equals(bar, foo)).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(foo.toString()).toBe(`{
  "_id": "@parischap/ansi-styles/FormattedString/",
  "formatted": "afoob",
  "unformatted": "foo"
}`);
		});

		it('.pipe()', () => {
			expect(foo.pipe(ASFormattedString.unformatted)).toBe('foo');
		});

		it('has', () => {
			expect(ASFormattedString.has(foo)).toBe(true);
			expect(ASFormattedString.has(new Date())).toBe(false);
		});
	});

	it('append', () => {
		const result = foo.pipe(ASFormattedString.append(bar));
		expect(ASFormattedString.formatted(result)).toBe('afoobabarb');
		expect(ASFormattedString.unformatted(result)).toBe('foobar');
	});

	it('prepend', () => {
		const result = foo.pipe(ASFormattedString.prepend(bar));
		expect(ASFormattedString.formatted(result)).toBe('abarbafoob');
		expect(ASFormattedString.unformatted(result)).toBe('barfoo');
	});

	it('concat', () => {
		const result = ASFormattedString.concat(foo, bar, baz);
		expect(ASFormattedString.formatted(result)).toBe('afoobabarbabazb');
		expect(ASFormattedString.unformatted(result)).toBe('foobarbaz');
	});

	it('join', () => {
		const result = pipe(Array.make(foo, baz), ASFormattedString.join(bar));
		expect(ASFormattedString.formatted(result)).toBe('afoobabarbabazb');
		expect(ASFormattedString.unformatted(result)).toBe('foobarbaz');
	});

	it('repeat', () => {
		const result = foo.pipe(ASFormattedString.repeat(2));
		expect(ASFormattedString.formatted(result)).toBe('afoobafoob');
		expect(ASFormattedString.unformatted(result)).toBe('foofoo');
	});

	it('isEmpty', () => {
		expect(ASFormattedString.isEmpty(foo)).toBe(false);
		expect(ASFormattedString.isEmpty(ASFormattedString.empty)).toBe(true);
	});

	it('isNonEmpty', () => {
		expect(ASFormattedString.isNonEmpty(foo)).toBe(true);
		expect(ASFormattedString.isNonEmpty(ASFormattedString.empty)).toBe(false);
	});
});
