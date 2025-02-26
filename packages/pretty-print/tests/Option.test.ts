/* eslint-disable functional/no-expression-statements */
import { ASStyle, ASText } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import {
	PPMarkShowerConstructor,
	PPOption,
	PPValue,
	PPValueBasedFormatterConstructor
} from '@parischap/pretty-print';
import { Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('Option', () => {
	describe('NonPrimitive', () => {
		const record = PPOption.NonPrimitive.record;
		describe('Prototype and guards', () => {
			describe('Equal.equals', () => {
				const dummy = PPOption.NonPrimitive.make(record);

				it('Matching', () => {
					expect(Equal.equals(record, dummy)).toBe(true);
				});

				it('Non-matching', () => {
					expect(Equal.equals(record, PPOption.NonPrimitive.array)).toBe(false);
				});
			});

			it('.toString()', () => {
				expect(record.toString()).toBe(`Object`);
			});

			it('.pipe()', () => {
				expect(record.pipe(PPOption.NonPrimitive.id)).toBe('Object');
			});

			describe('has', () => {
				it('Matching', () => {
					expect(PPOption.NonPrimitive.has(record)).toBe(true);
				});
				it('Non matching', () => {
					expect(PPOption.NonPrimitive.has(new Date())).toBe(false);
				});
			});
		});

		describe('Initialized', () => {
			const value = PPValue.fromTopValue(3);
			const propertyNumbers = { allPropertyNumber: 5, actualPropertyNumber: 3 };
			const utilInspectLike = PPOption.darkModeUtilInspectLike;
			const valueBasedFormatterConstructor =
				PPValueBasedFormatterConstructor.fromOption(utilInspectLike);
			const markShowerConstructor = PPMarkShowerConstructor.fromOption(utilInspectLike);
			const constructors = {
				valueBasedFormatterConstructor,
				markShowerConstructor
			};
			const fromPrimitive = PPOption.NonPrimitive.Initialized.fromNonPrimitive(constructors);
			const fooMap = PPOption.NonPrimitive.maps('Foo');
			it('fromPrimitive showing nothing', () => {
				const recordInitialized = fromPrimitive(PPOption.NonPrimitive.record);
				const headerMarkShower = recordInitialized.toHeaderMarkShower(propertyNumbers);
				expect(pipe(value, headerMarkShower, ASText.isEmpty)).toBe(true);
			});

			it('fromPrimitive showing id and all number', () => {
				const recordInitialized = fromPrimitive(fooMap);
				const headerMarkShower = recordInitialized.toHeaderMarkShower(propertyNumbers);
				expect(ASText.equivalence(pipe(value, headerMarkShower), ASStyle.green('Foo(5) '))).toBe(
					true
				);
			});

			it('fromPrimitive showing all number', () => {
				const initialized = fromPrimitive(PPOption.NonPrimitive.make({ ...fooMap, showId: false }));
				const headerMarkShower = initialized.toHeaderMarkShower(propertyNumbers);
				expect(ASText.equivalence(pipe(value, headerMarkShower), ASStyle.green('(5) '))).toBe(true);
			});

			it('fromPrimitive showing id', () => {
				const initialized = fromPrimitive(
					PPOption.NonPrimitive.make({
						...fooMap,
						propertyNumberDisplayOption: PPOption.PropertyNumberDisplayOption.Type.None
					})
				);
				const headerMarkShower = initialized.toHeaderMarkShower(propertyNumbers);
				expect(ASText.equivalence(pipe(value, headerMarkShower), ASStyle.green('Foo '))).toBe(true);
			});

			it('fromPrimitive showing id and all and actual numbers', () => {
				const initialized = fromPrimitive(
					PPOption.NonPrimitive.make({
						...fooMap,
						propertyNumberDisplayOption: PPOption.PropertyNumberDisplayOption.Type.AllAndActual
					})
				);
				const headerMarkShower = initialized.toHeaderMarkShower(propertyNumbers);
				expect(ASText.equivalence(pipe(value, headerMarkShower), ASStyle.green('Foo(5,3) '))).toBe(
					true
				);
			});
		});
	});

	describe('Tag, prototype and guards', () => {
		const utilInspectLike = PPOption.utilInspectLike;

		it('moduleTag', () => {
			expect(PPOption.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			const dummy = PPOption.make(utilInspectLike);
			it('Matching', () => {
				expect(Equal.equals(utilInspectLike, dummy)).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(utilInspectLike, PPOption.darkModeUtilInspectLike)).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(utilInspectLike.toString()).toBe(`UtilInspectLike`);
		});

		it('.pipe()', () => {
			expect(utilInspectLike.pipe(PPOption.id)).toBe('UtilInspectLike');
		});

		describe('has', () => {
			it('Matching', () => {
				expect(PPOption.has(utilInspectLike)).toBe(true);
			});
			it('Non matching', () => {
				expect(PPOption.has(new Date())).toBe(false);
			});
		});
	});
});
