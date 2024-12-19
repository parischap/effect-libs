/* eslint-disable functional/no-expression-statements */
import { ASFormat, ASFormatter, ASString } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('ASFormatter', () => {
	describe('Tag, prototype and guards', () => {
		const testFormat = ASFormat.Colored.Original.yellow;
		const testFormatter = ASFormatter.fromFormat(testFormat);

		it('moduleTag', () => {
			expect(ASFormatter.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			const testFormat1 = ASFormat.Styled.fromColor(testFormat);
			const testFormat2 = ASFormat.Styled.makeBold(testFormat1);

			it('Matching', () => {
				expect(Equal.equals(testFormatter, ASFormatter.fromFormat(testFormat1))).toBe(true);
			});
			it('Non matching', () => {
				expect(Equal.equals(testFormatter, ASFormatter.fromFormat(testFormat2))).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(testFormatter.toString()).toBe('"Yellow"');
		});

		it('.pipe()', () => {
			expect(testFormatter.pipe(JSON.stringify)).toBe('"Yellow"');
		});

		describe('has', () => {
			it('Matching', () => {
				expect(ASFormatter.has(testFormatter)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASFormatter.has(testFormat)).toBe(false);
			});
		});
	});

	it('fromFormat', () => {
		const formatter = ASFormat.Colored.Original.yellow.pipe(
			ASFormat.Styled.fromColor,
			ASFormat.Styled.makeFramed,
			ASFormatter.fromFormat
		);
		expect(pipe('foo', ASFormatter.action(formatter), ASString.formatted)).toBe(
			'\x1b[33;51mfoo\x1b[0m'
		);
		expect(ASFormatter.id(formatter)).toBe('FramedYellow');
	});
});
