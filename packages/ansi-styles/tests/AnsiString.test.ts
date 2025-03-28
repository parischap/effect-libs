/* eslint-disable functional/no-expression-statements */
import { ASAnsiString } from '@parischap/ansi-styles';
import { TEUtils } from '@parischap/test-utils';
import { Array } from 'effect';
import { describe, it } from 'vitest';

describe('AnsiString', () => {
	describe('fromSequence', () => {
		it('From empty sequence', () => {
			TEUtils.strictEqual(ASAnsiString.fromSequence(Array.empty()), '');
		});

		it('From non-empty sequence', () => {
			TEUtils.strictEqual(ASAnsiString.fromSequence(Array.make(0, 1)), '\x1b[0;1m');
		});
	});
});
