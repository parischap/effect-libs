/* eslint-disable functional/no-expression-statements */
import { CVNumberBase10Format } from '@parischap/conversions';
import { Equal } from 'effect';
import { describe, it } from 'vitest';

const uk = CVNumberBase10Format.uk;

describe('NumberBase10Format', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.strictEqual(
				CVNumberBase10Format.moduleTag,
				TEUtils.moduleTagFromTestFilePath(__filename)
			);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertTrue(Equal.equals(uk, CVNumberBase10Format.make({ ...uk })));
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(Equal.equals(uk, blackRed));
			});
		});

		describe('.toString()', () => {
			it('Black and red', () => {
				TEUtils.strictEqual(blackRed.toString(), 'Black/RedPalette');
			});
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(blackRed.pipe(ASPalette.has));
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(ASPalette.has(blackRed));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(ASPalette.has(new Date()));
			});
		});
	});
});
