/* eslint-disable functional/no-expression-statements */
import { MBrand, MUtils } from '@parischap/effect-lib';
import { pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MBrand', () => {
	it('moduleTag', () => {
		expect(MBrand.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
	});

	describe('Email', () => {
		it('unsafeFromString', () => {
			expect(MBrand.Email.unsafeFromString('foo')).toBe('foo');
		});
		it('fromString throwing', () => {
			expect(() => MBrand.Email.fromString('foo')).toThrow();
		});
		it('fromString passing', () => {
			expect(MBrand.Email.fromString('foo@bar.baz')).toBe('foo@bar.baz');
		});
	});

	describe('SemVer', () => {
		it('unsafeFromString', () => {
			expect(MBrand.SemVer.unsafeFromString('foo')).toBe('foo');
		});
		it('fromString throwing', () => {
			expect(() => MBrand.SemVer.fromString('foo')).toThrow();
		});
		it('fromString passing', () => {
			expect(MBrand.SemVer.fromString('1.0.1')).toBe('1.0.1');
		});
	});

	describe('Real', () => {
		it('unsafeFromNumber', () => {
			expect(MBrand.Real.unsafeFromNumber(NaN)).toBe(NaN);
		});
		it('fromNumber throwing', () => {
			expect(() => MBrand.Real.fromNumber(NaN)).toThrow();
		});
		it('fromNumber passing', () => {
			expect(MBrand.Real.fromNumber(18.4)).toBe(18.4);
		});
	});

	describe('Int', () => {
		it('unsafeFromNumber', () => {
			expect(MBrand.Int.unsafeFromNumber(NaN)).toBe(NaN);
		});
		it('fromNumber throwing', () => {
			expect(() => MBrand.Int.fromNumber(NaN)).toThrow();
		});
		it('fromNumber throwing', () => {
			expect(() => MBrand.Int.fromNumber(18.4)).toThrow();
		});
		it('fromNumber passing', () => {
			expect(MBrand.Int.fromNumber(18)).toBe(18);
		});
		it('fromReal throwing', () => {
			expect(() => pipe(18.4, MBrand.Real.fromNumber, MBrand.Int.fromReal)).toThrow();
		});
		it('fromReal passing', () => {
			expect(pipe(18, MBrand.Real.fromNumber, MBrand.Int.fromReal)).toBe(18);
		});
	});

	describe('PositiveInt', () => {
		it('unsafeFromNumber', () => {
			expect(MBrand.PositiveInt.unsafeFromNumber(NaN)).toBe(NaN);
		});
		it('fromNumber throwing', () => {
			expect(() => MBrand.PositiveInt.fromNumber(NaN)).toThrow();
		});
		it('fromNumber throwing', () => {
			expect(() => MBrand.PositiveInt.fromNumber(-18)).toThrow();
		});
		it('fromNumber passing', () => {
			expect(MBrand.PositiveInt.fromNumber(18)).toBe(18);
		});
		it('fromReal throwing', () => {
			expect(() => pipe(18.4, MBrand.Real.fromNumber, MBrand.PositiveInt.fromReal)).toThrow();
		});
		it('fromReal passing', () => {
			expect(pipe(18, MBrand.Real.fromNumber, MBrand.PositiveInt.fromReal)).toBe(18);
		});
		it('fromInt throwing', () => {
			expect(() => pipe(-18, MBrand.Int.fromNumber, MBrand.PositiveInt.fromInt)).toThrow();
		});
		it('fromInt passing', () => {
			expect(pipe(18, MBrand.Int.fromNumber, MBrand.PositiveInt.fromInt)).toBe(18);
		});
	});
});
