/* eslint-disable functional/no-expression-statements */
import { JsString } from '@parischap/js-lib';
import { describe, expect, it } from 'vitest';

describe('JsString', () => {
	describe('isoToYyyymmdd', () => {
		it('Value 1', () => {
			expect(JsString.isoToYyyymmdd('2024-12-05')).toBe('20241205');
		});
	});

	describe('yyyymmddToIso', () => {
		it('Value 1', () => {
			expect(JsString.yyyymmddToIso('20241205')).toBe('2024-12-05');
		});
	});

	describe('tabify', () => {
		const simpleTabify = JsString.tabify('aa', 3);
		it('Value 1', () => {
			expect(simpleTabify('')).toBe('aaaaaa');
		});
		it('Value 2', () => {
			expect(simpleTabify('foo')).toBe('aaaaaafoo');
		});
		it('Value 3', () => {
			expect(simpleTabify('foo\r\nfoo1')).toBe('aaaaaafoo\r\naaaaaafoo1');
		});
	});
});
