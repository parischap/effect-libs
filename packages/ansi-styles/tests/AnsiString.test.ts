/* eslint-disable functional/no-expression-statements */
import { ASAnsiString } from '@parischap/ansi-styles';
import { Array } from 'effect';
import { describe, expect, it } from 'vitest';

describe('AnsiString', () => {
	describe('fromSequence', () => {
		it('From empty sequence', () => {
			expect(ASAnsiString.fromSequence(Array.empty())).toBe('');
		});

		it('From non-empty sequence', () => {
			expect(ASAnsiString.fromSequence(Array.make(0, 1))).toBe('\x1b[0;1m');
		});
	});
});
