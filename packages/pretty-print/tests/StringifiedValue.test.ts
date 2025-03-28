/* eslint-disable functional/no-expression-statements */
import { ASText } from '@parischap/ansi-styles';
import { PPStringifiedValue } from '@parischap/pretty-print';
import { Array, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('StringifiedValue', () => {
	const test1: PPStringifiedValue.Type = Array.make(
		ASText.fromString('foo'),
		ASText.fromString('bar')
	);

	describe('equivalence', () => {
		it('Matching', () => {
			TEUtils.assertTrue(
				pipe(
					PPStringifiedValue.equivalence(
						test1,
						Array.make(ASText.fromString('foo'), ASText.fromString('bar'))
					)
				)
			);
		});

		it('Non-matching', () => {
			TEUtils.assertFalse(pipe(PPStringifiedValue.equivalence(test1, PPStringifiedValue.empty)));
		});
	});

	it('toSingleLine', () => {
		TEUtils.assertTrue(
			pipe(
				PPStringifiedValue.equivalence(
					PPStringifiedValue.toSingleLine(test1),
					Array.of(ASText.fromString('foobar'))
				)
			)
		);
	});

	describe('isEmpty', () => {
		it('Matching', () => {
			TEUtils.assertTrue(pipe(PPStringifiedValue.isEmpty(PPStringifiedValue.empty)));
		});

		it('Non-matching', () => {
			TEUtils.assertFalse(pipe(PPStringifiedValue.isEmpty(test1)));
		});
	});

	describe('length', () => {
		it('With empty StringifiedValue', () => {
			TEUtils.strictEqual(pipe(PPStringifiedValue.toLength(PPStringifiedValue.empty)),0);
		});

		it('With non-empty StringifiedValue', () => {
			TEUtils.strictEqual(pipe(PPStringifiedValue.toLength(test1)),6);
		});
	});

	it('toAnsiString', () => {
		TEUtils.strictEqual(pipe(PPStringifiedValue.toAnsiString()(test1)),'foo\nbar');
	});

	it('toUnstyledStrings', () => {
		TEUtils.deepStrictEqual(pipe(PPStringifiedValue.toUnstyledStrings(test1)),['foo', 'bar']);
	});
});
