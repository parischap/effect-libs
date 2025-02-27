/* eslint-disable functional/no-expression-statements */
import { ASStyle, ASText } from '@parischap/ansi-styles';
import { MFunction, MUtils } from '@parischap/effect-lib';
import {
	PPByPasser,
	PPMarkShowerConstructor,
	PPOption,
	PPStringifiedValue,
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

	describe('toStringifier', () => {
		const stringifier = PPOption.toStringifier(PPOption.darkModeUtilInspectLike);
		const stringifierWithoutFunctionByPasser = PPOption.toStringifier(
			PPOption.make({ ...PPOption.utilInspectLike, byPassers: Array.of(PPByPasser.objectToString) })
		);
		const stringifierWithInfiniteMaxDepth = PPOption.toStringifier(
			PPOption.make({ ...PPOption.utilInspectLike, maxDepth: +Infinity })
		);

		const foo = function (n: number) {
			return n + 1;
		};

		describe('Check bypasser handling', () => {
			it('Simple function', () => {
				expect(pipe(foo, stringifier, PPStringifiedValue.toUnstyledStrings)).toStrictEqual(
					Array.of('[Function: foo]')
				);
			});

			it('Simple date', () => {
				const dummy = new Date(0);
				expect(pipe(dummy, stringifier, PPStringifiedValue.toUnstyledStrings)).toStrictEqual(
					Array.of(dummy.toString())
				);
			});
		});

		it('Check primitive handling', () => {
			expect(pipe(5, stringifier, PPStringifiedValue.toUnstyledStrings)).toStrictEqual(
				Array.of('5')
			);
		});

		describe('Check maxDepth handling', () => {
			it('With object', () => {
				expect(pipe({ a: { a: { a: 1 } } }, stringifier, PPStringifiedValue.toAnsiString())).toBe(
					pipe(
						ASStyle.red(
							'{ a',
							ASStyle.white(': '),
							ASStyle.green('{ '),
							'a',
							ASStyle.white(': '),
							ASStyle.green('[Object] }'),
							' }'
						),
						ASText.toAnsiString
					)
				);
			});

			it('With map', () => {
				expect(
					pipe({ a: { a: new Map() } }, stringifier, PPStringifiedValue.toUnstyledStrings)
				).toStrictEqual(Array.of('{ a: { a: [Map] } }'));
			});
		});

		it('Check circularity handling', () => {
			const circular = { a: 1 as unknown, b: { inner: 1 as unknown, circular: 1 as unknown } };
			/* eslint-disable functional/immutable-data */
			circular.a = [circular];
			circular.b.inner = circular.b;
			circular.b.circular = circular;
			/* eslint-enable functional/immutable-data*/
			expect(
				pipe(circular, stringifierWithInfiniteMaxDepth, PPStringifiedValue.toUnstyledStrings)
			).toStrictEqual([
				'<Ref *1> {',
				'  a: [ [Circular *1] ],',
				'  b: <Ref *2> { inner: [Circular *2], circular: [Circular *1] }',
				'}'
			]);
		});

		describe('Check non-primitive handling', () => {
			describe('fromProperties', () => {
				it('Unbypassed simple function', () => {
					expect(
						pipe(foo, stringifierWithoutFunctionByPasser, PPStringifiedValue.toUnstyledStrings)
					).toStrictEqual(Array.of('{}'));
				});

				it('Unbypassed simple function with properties', () => {
					expect(
						pipe(
							Object.assign(MFunction.clone(foo), { a: 1 }),
							stringifierWithoutFunctionByPasser,
							PPStringifiedValue.toUnstyledStrings
						)
					).toStrictEqual(Array.of('{ a: 1 }'));
				});
			});

			describe('FromValueIterable', () => {
				it('Empty array', () => {
					expect(pipe([], stringifier, PPStringifiedValue.toUnstyledStrings)).toStrictEqual(
						Array.of('[]')
					);
				});

				it('Simple array', () => {
					expect(pipe([3, 4], stringifier, PPStringifiedValue.toUnstyledStrings)).toStrictEqual(
						Array.of('[ 3, 4 ]')
					);
				});
			});
		});
	});
});
