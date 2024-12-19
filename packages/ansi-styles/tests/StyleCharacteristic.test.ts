/* eslint-disable functional/no-expression-statements */
import { ASStyleCharacteristic } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Equal } from 'effect';
import { describe, expect, it } from 'vitest';

describe('ASStyleCharacteristic', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(ASStyleCharacteristic.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(Equal.equals(ASStyleCharacteristic.bold, ASStyleCharacteristic.bold)).toBe(true);
			});
			it('Non matching', () => {
				expect(Equal.equals(ASStyleCharacteristic.bold, ASStyleCharacteristic.dim)).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(ASStyleCharacteristic.bold.toString()).toBe('Bold');
		});

		it('.pipe()', () => {
			expect(ASStyleCharacteristic.bold.pipe(ASStyleCharacteristic.id)).toBe('Bold');
		});

		describe('has', () => {
			it('Matching', () => {
				expect(ASStyleCharacteristic.has(ASStyleCharacteristic.bold)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASStyleCharacteristic.has(new Date())).toBe(false);
			});
		});
	});
});
