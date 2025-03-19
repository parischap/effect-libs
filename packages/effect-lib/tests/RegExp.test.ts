/* eslint-disable functional/no-expression-statements */
import { MRegExp } from '@parischap/effect-lib';
import { Array, Option, pipe, String } from 'effect';
import { describe, expect, it } from 'vitest';

const stringArrayEq = Array.getEquivalence(String.Equivalence);
const regExp = /af(o)o(bar)?a/;

describe('MRegExp', () => {
	describe('match', () => {
		const stringOptionEq = Option.getEquivalence(String.Equivalence);
		it('Matching', () => {
			expect(stringOptionEq(pipe(regExp, MRegExp.match('afooa')), Option.some('afooa'))).toBe(true);
			expect(stringOptionEq(pipe(regExp, MRegExp.match('afoobara')), Option.some('afoobara'))).toBe(
				true
			);
		});

		it('Non matching', () => {
			expect(pipe(regExp, MRegExp.match('afoob'), Option.isNone)).toBe(true);
		});
	});

	describe('matchAndGroups', () => {
		it('Matching', () => {
			const result = pipe(regExp, MRegExp.matchAndGroups('afooa', 2));
			expect(
				Option.isSome(result) &&
					result.value[0] === 'afooa' &&
					stringArrayEq(result.value[1], Array.make('o', ''))
			).toBe(true);
		});

		it('Non matching', () => {
			expect(pipe(regExp, MRegExp.match('afoob'), Option.isNone)).toBe(true);
		});
	});

	describe('capturedGroups', () => {
		it('Matching', () => {
			const result = pipe(regExp, MRegExp.capturedGroups('afooa', 2));
			expect(Option.isSome(result) && stringArrayEq(result.value, Array.make('o', ''))).toBe(true);
		});
	});
});
