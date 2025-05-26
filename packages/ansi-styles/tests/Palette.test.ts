/* eslint-disable functional/no-expression-statements */
import { ASPalette, ASStyle } from '@parischap/ansi-styles';
import { TEUtils } from '@parischap/test-utils';
import { pipe } from 'effect';
import { describe, it } from 'vitest';

describe('ASPalette', () => {
	const blackRed = ASPalette.make(ASStyle.black, ASStyle.red);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), ASPalette.moduleTag);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertEquals(blackRed, ASPalette.make(ASStyle.black, ASStyle.red));
			});

			it('Non-matching', () => {
				TEUtils.assertNotEquals(ASPalette.allOriginalColors, blackRed);
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

	it('append', () => {
		TEUtils.assertEquals(
			pipe(
				ASPalette.make(ASStyle.black, ASStyle.red, ASStyle.green, ASStyle.yellow),
				ASPalette.append(ASPalette.make(ASStyle.blue, ASStyle.magenta, ASStyle.cyan, ASStyle.white))
			),
			ASPalette.allStandardOriginalColors
		);
	});
});
