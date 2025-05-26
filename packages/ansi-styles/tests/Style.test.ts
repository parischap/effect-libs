/* eslint-disable functional/no-expression-statements */
import { ASStyle, ASStyleCharacteristics, ASText } from '@parischap/ansi-styles';
import { TEUtils } from '@parischap/test-utils';
import { pipe } from 'effect';
import { describe, it } from 'vitest';

describe('ASStyle', () => {
	const red = ASStyle.red;
	const bold = ASStyle.bold;
	const boldRed1 = pipe(red, ASStyle.mergeOver(bold));
	const boldRed2 = pipe(bold, ASStyle.mergeOver(red));

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), ASStyle.moduleTag);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertEquals(ASStyle.none, ASStyle.none);
				TEUtils.assertEquals(boldRed1, boldRed2);
			});

			it('Non-matching', () => {
				TEUtils.assertNotEquals(boldRed2, bold);
			});
		});

		describe('.toString()', () => {
			it('red before bold', () => {
				TEUtils.strictEqual(boldRed1.toString(), 'BoldRed');
			});
			it('bold before red', () => {
				TEUtils.strictEqual(boldRed2.toString(), 'BoldRed');
			});
			it('Other than color', () => {
				TEUtils.strictEqual(ASStyle.struckThrough.toString(), 'StruckThrough');
			});
			it('Default foreground color', () => {
				TEUtils.strictEqual(ASStyle.defaultColor.toString(), 'DefaultColor');
			});
			it('Default background color', () => {
				TEUtils.strictEqual(ASStyle.Bg.defaultColor.toString(), 'InDefaultColor');
			});
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(boldRed1.pipe(ASStyle.toId), 'BoldRed');
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(ASStyle.has(boldRed2));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(ASStyle.has(new Date()));
			});
		});
	});

	it('mergeOver', () => {
		TEUtils.strictEqual(
			pipe(
				ASStyle.green,
				ASStyle.mergeOver(ASStyle.blinking),
				ASStyle.mergeOver(ASStyle.Bright.black)
			).toString(),
			'BlinkingBrightBlack'
		);
	});

	it('mergeUnder', () => {
		TEUtils.strictEqual(
			pipe(
				ASStyle.green,
				ASStyle.mergeUnder(ASStyle.blinking),
				ASStyle.mergeUnder(ASStyle.Bright.black)
			).toString(),
			'BlinkingGreen'
		);
	});

	it('Action', () => {
		TEUtils.assertEquals(bold('foo'), ASText.fromStyleAndElems(ASStyleCharacteristics.bold)('foo'));
	});
});
