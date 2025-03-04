/* eslint-disable functional/no-expression-statements */
import { ASText } from '@parischap/ansi-styles';
import { PPStringifiedValue } from '@parischap/pretty-print';
import { Array, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('StringifiedValue', () => {
	const test1: PPStringifiedValue.Type = Array.make(
		ASText.fromString('foo'),
		ASText.fromString('bar')
	);

	describe('equivalence', () => {
		it('Matching', () => {
			expect(
				pipe(
					PPStringifiedValue.equivalence(
						test1,
						Array.make(ASText.fromString('foo'), ASText.fromString('bar'))
					)
				)
			).toBe(true);
		});

		it('Non-matching', () => {
			expect(pipe(PPStringifiedValue.equivalence(test1, PPStringifiedValue.empty))).toBe(false);
		});
	});

	it('toSingleLine', () => {
		expect(
			pipe(
				PPStringifiedValue.equivalence(
					PPStringifiedValue.toSingleLine(test1),
					Array.of(ASText.fromString('foobar'))
				)
			)
		).toBe(true);
	});

	describe('isEmpty', () => {
		it('Matching', () => {
			expect(pipe(PPStringifiedValue.isEmpty(PPStringifiedValue.empty))).toBe(true);
		});

		it('Non-matching', () => {
			expect(pipe(PPStringifiedValue.isEmpty(test1))).toBe(false);
		});
	});

	describe('length', () => {
		it('With empty StringifiedValue', () => {
			expect(pipe(PPStringifiedValue.toLength(PPStringifiedValue.empty))).toBe(0);
		});

		it('With non-empty StringifiedValue', () => {
			expect(pipe(PPStringifiedValue.toLength(test1))).toBe(6);
		});
	});

	it('toAnsiString', () => {
		expect(pipe(PPStringifiedValue.toAnsiString()(test1))).toBe('foo\nbar');
	});

	it('toUnstyledStrings', () => {
		expect(pipe(PPStringifiedValue.toUnstyledStrings(test1))).toStrictEqual(['foo', 'bar']);
	});
});
