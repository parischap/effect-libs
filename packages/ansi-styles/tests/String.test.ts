/* eslint-disable functional/no-expression-statements */
import { ASString } from '@parischap/ansi-styles';
import { MTypes, MUtils } from '@parischap/effect-lib';
import { Array, Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

const f: MTypes.StringTransformer = (s) => 'a' + s + 'b';
const _ = ASString.fromStyleAndString(f);
const foo = _('foo');
const bar = _('bar');
const baz = _('baz');

describe('ASString', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(ASString.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
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
  "_id": "@parischap/ansi-styles/String/",
  "formatted": "afoob",
  "unformatted": "foo"
}`);
		});

		it('.pipe()', () => {
			expect(foo.pipe(ASString.unformatted)).toBe('foo');
		});

		it('has', () => {
			expect(ASString.has(foo)).toBe(true);
			expect(ASString.has(new Date())).toBe(false);
		});
	});

	it('append', () => {
		const result = foo.pipe(ASString.append(bar));
		expect(ASString.formatted(result)).toBe('afoobabarb');
		expect(ASString.unformatted(result)).toBe('foobar');
	});

	it('prepend', () => {
		const result = foo.pipe(ASString.prepend(bar));
		expect(ASString.formatted(result)).toBe('abarbafoob');
		expect(ASString.unformatted(result)).toBe('barfoo');
	});

	it('concat', () => {
		const result = ASString.concat(foo, bar, baz);
		expect(ASString.formatted(result)).toBe('afoobabarbabazb');
		expect(ASString.unformatted(result)).toBe('foobarbaz');
	});

	it('join', () => {
		const result = pipe(Array.make(foo, baz), ASString.join(bar));
		expect(ASString.formatted(result)).toBe('afoobabarbabazb');
		expect(ASString.unformatted(result)).toBe('foobarbaz');
	});

	it('repeat', () => {
		const result = foo.pipe(ASString.repeat(2));
		expect(ASString.formatted(result)).toBe('afoobafoob');
		expect(ASString.unformatted(result)).toBe('foofoo');
	});

	it('isEmpty', () => {
		expect(ASString.isEmpty(foo)).toBe(false);
		expect(ASString.isEmpty(ASString.empty)).toBe(true);
	});

	it('isNonEmpty', () => {
		expect(ASString.isNonEmpty(foo)).toBe(true);
		expect(ASString.isNonEmpty(ASString.empty)).toBe(false);
	});
});
