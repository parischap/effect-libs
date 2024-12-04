/* eslint-disable functional/no-expression-statements */
import { ASContextFormatter, ASPalette, ASString } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Equal, pipe, Struct } from 'effect';
import { describe, expect, it } from 'vitest';

interface Context {
	readonly pos1: number;
	readonly pos2: number;
}

describe('ContextFormatter', () => {
	const contextFormatterOnContextPos1 = pipe(
		ASPalette.allStandardOriginalColors,
		ASContextFormatter.fromPalette<Context>({
			nameSuffix: 'ContextPos1',
			indexFromContext: Struct.get('pos1')
		})
	);
	const contextFormatterOnContextPos2 = pipe(
		ASPalette.allStandardOriginalColors,
		ASContextFormatter.fromPalette<Context>({
			nameSuffix: 'ContextPos2',
			indexFromContext: Struct.get('pos2')
		})
	);

	const context1: Context = {
		pos1: 2,
		pos2: 4
	};

	const context2: Context = {
		pos1: 0,
		pos2: 1
	};

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(ASContextFormatter.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(
					Equal.equals(
						contextFormatterOnContextPos1,
						pipe(
							ASPalette.allStandardOriginalColors,
							ASContextFormatter.fromPalette<Context>({
								nameSuffix: 'ContextPos1',
								indexFromContext: Struct.get('pos2')
							})
						)
					)
				).toBe(true);
			});
			it('Non matching', () => {
				expect(Equal.equals(contextFormatterOnContextPos1, contextFormatterOnContextPos2)).toBe(
					false
				);
			});
		});

		it('.toString()', () => {
			expect(contextFormatterOnContextPos1.toString()).toBe(
				'"AllStandardOriginalColorsOnContextPos1"'
			);
		});

		it('.pipe() and id', () => {
			expect(contextFormatterOnContextPos1.pipe(ASContextFormatter.id)).toBe(
				'AllStandardOriginalColorsOnContextPos1'
			);
		});

		it('has', () => {
			expect(ASContextFormatter.has(contextFormatterOnContextPos1)).toBe(true);
			expect(ASContextFormatter.has(new Date())).toBe(false);
		});

		it('action', () => {
			expect(pipe('foo', contextFormatterOnContextPos1.action(context1), ASString.formatted)).toBe(
				'\x1b[32mfoo\x1b[0m'
			);
			expect(pipe('foo', contextFormatterOnContextPos2.action(context1), ASString.formatted)).toBe(
				'\x1b[34mfoo\x1b[0m'
			);
			expect(pipe('foo', contextFormatterOnContextPos1.action(context2), ASString.formatted)).toBe(
				'\x1b[30mfoo\x1b[0m'
			);
		});
	});
});
