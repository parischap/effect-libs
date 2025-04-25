/* eslint-disable functional/no-expression-statements */
import { MRegExp } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { pipe, Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('MRegExp', () => {
	const regExp = /af(o)o(bar)?a/;

	describe('match', () => {
		it('Matching', () => {
			TEUtils.assertSome(pipe(regExp, MRegExp.match('afooa')), 'afooa');
			TEUtils.assertSome(pipe(regExp, MRegExp.match('afoobara')), 'afoobara');
		});

		it('Non matching', () => {
			TEUtils.assertNone(pipe(regExp, MRegExp.match('afoob')));
		});
	});

	describe('matchAndGroups', () => {
		it('Matching', () => {
			TEUtils.assertSome(
				pipe(regExp, MRegExp.matchAndGroups('afooa', 2)),
				Tuple.make('afooa', Tuple.make('o', ''))
			);
		});

		it('Non matching', () => {
			TEUtils.assertNone(MRegExp.match('afoob')(regExp));
		});
	});

	describe('capturedGroups', () => {
		it('Matching', () => {
			TEUtils.assertSome(pipe(regExp, MRegExp.capturedGroups('afooa', 2)), Tuple.make('o', ''));
		});
	});
});
