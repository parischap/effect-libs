/* eslint-disable functional/no-expression-statements */
import {
	ASContextFormatter,
	ASContextShower,
	ASFormattedString,
	ASPalette
} from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Equal, pipe, Struct } from 'effect';
import { describe, expect, it } from 'vitest';

interface Context {
	readonly pos: number;
}

describe('ContextShower', () => {
	const contextFormatterOnContextPos = pipe(
		ASPalette.allStandardOriginalColors,
		ASContextFormatter.fromPalette<Context>({
			nameSuffix: 'ContextPos',
			indexFromContext: Struct.get('pos')
		})
	);
	const fooShowerOnContextPos = pipe(
		'foo',
		ASContextShower.fromContextFormatter(contextFormatterOnContextPos)
	);

	const context1: Context = {
		pos: 2
	};

	const context2: Context = {
		pos: 0
	};

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(ASContextShower.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(
					Equal.equals(
						fooShowerOnContextPos,
						pipe('foo', ASContextShower.fromContextFormatter(contextFormatterOnContextPos))
					)
				).toBe(true);
			});
			it('Non matching', () => {
				expect(
					Equal.equals(
						fooShowerOnContextPos,
						pipe('bar', ASContextShower.fromContextFormatter(contextFormatterOnContextPos))
					)
				).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(fooShowerOnContextPos.toString()).toBe(
				'"fooFormattedWithAllStandardOriginalColorsOnContextPos"'
			);
		});

		it('.pipe() and name', () => {
			expect(fooShowerOnContextPos.pipe(ASContextShower.name)).toBe(
				'fooFormattedWithAllStandardOriginalColorsOnContextPos'
			);
		});

		it('has', () => {
			expect(ASContextShower.has(fooShowerOnContextPos)).toBe(true);
			expect(ASContextShower.has(new Date())).toBe(false);
		});

		it('action', () => {
			expect(pipe(context1, fooShowerOnContextPos.action, ASFormattedString.formatted)).toBe(
				'\x1b[32mfoo\x1b[0m'
			);
			expect(pipe(context2, fooShowerOnContextPos.action, ASFormattedString.formatted)).toBe(
				'\x1b[30mfoo\x1b[0m'
			);
		});
	});
});
