/* eslint-disable functional/no-expression-statements */
import { ASStyle, ASText } from '@parischap/ansi-styles';
import { MFunction, MUtils } from '@parischap/effect-lib';
import {
	PPByPasser,
	PPMarkShowerConstructor,
	PPOption,
	PPPropertyFilter,
	PPStringifiedValue,
	PPValue,
	PPValueBasedStylerConstructor,
	PPValueOrder
} from '@parischap/pretty-print';
import { Array, Equal, HashMap, HashSet, Option, pipe, Predicate } from 'effect';
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
			describe('toHeaderMarkShower', () => {
				const value = PPValue.fromTopValue(3);
				const differingPropertyNumbers = { allPropertyNumber: 5, actualPropertyNumber: 3 };
				const equalPropertyNumbers = { allPropertyNumber: 3, actualPropertyNumber: 3 };
				const utilInspectLike = PPOption.darkModeUtilInspectLike;
				const valueBasedStylerConstructor =
					PPValueBasedStylerConstructor.fromOption(utilInspectLike);
				const markShowerConstructor = PPMarkShowerConstructor.fromOption(utilInspectLike);
				const constructors = {
					valueBasedStylerConstructor,
					markShowerConstructor
				};
				const fromNonPrimitive = PPOption.NonPrimitive.Initialized.fromNonPrimitive(constructors);
				const nonPrimitiveMake = PPOption.NonPrimitive.make;

				it('showId = false, propertyNumberDisplayOption = None', () => {
					const headerMarkShower = fromNonPrimitive(
						PPOption.NonPrimitive.record
					).toHeaderMarkShower(differingPropertyNumbers);
					expect(pipe(value, headerMarkShower, ASText.isEmpty)).toBe(true);
				});

				it('showId = false, propertyNumberDisplayOption = All', () => {
					const headerMarkShower = pipe(
						{
							...PPOption.NonPrimitive.record,
							propertyNumberDisplayOption: PPOption.PropertyNumberDisplayOption.All
						},
						nonPrimitiveMake,
						fromNonPrimitive
					).toHeaderMarkShower(differingPropertyNumbers);
					expect(ASText.equivalence(pipe(value, headerMarkShower), ASStyle.green('(5) '))).toBe(
						true
					);
				});

				it('showId = false, propertyNumberDisplayOption = Actual', () => {
					const headerMarkShower = pipe(
						{
							...PPOption.NonPrimitive.record,
							propertyNumberDisplayOption: PPOption.PropertyNumberDisplayOption.Actual
						},
						nonPrimitiveMake,
						fromNonPrimitive
					).toHeaderMarkShower(differingPropertyNumbers);
					expect(ASText.equivalence(pipe(value, headerMarkShower), ASStyle.green('(3) '))).toBe(
						true
					);
				});

				it('showId = false, propertyNumberDisplayOption = AllAndActual', () => {
					const headerMarkShower = pipe(
						{
							...PPOption.NonPrimitive.record,
							propertyNumberDisplayOption: PPOption.PropertyNumberDisplayOption.AllAndActual
						},
						nonPrimitiveMake,
						fromNonPrimitive
					).toHeaderMarkShower(equalPropertyNumbers);
					expect(ASText.equivalence(pipe(value, headerMarkShower), ASStyle.green('(3,3) '))).toBe(
						true
					);
				});

				describe('showId = false, propertyNumberDisplayOption = AllAndActualIfDifferent', () => {
					it('With equal property numbers', () => {
						const headerMarkShower = pipe(
							{
								...PPOption.NonPrimitive.record,
								propertyNumberDisplayOption:
									PPOption.PropertyNumberDisplayOption.AllAndActualIfDifferent
							},
							nonPrimitiveMake,
							fromNonPrimitive
						).toHeaderMarkShower(equalPropertyNumbers);
						expect(pipe(value, headerMarkShower, ASText.isEmpty)).toBe(true);
					});

					it('With differing property numbers', () => {
						const headerMarkShower = pipe(
							{
								...PPOption.NonPrimitive.record,
								propertyNumberDisplayOption:
									PPOption.PropertyNumberDisplayOption.AllAndActualIfDifferent
							},
							nonPrimitiveMake,
							fromNonPrimitive
						).toHeaderMarkShower(differingPropertyNumbers);
						expect(ASText.equivalence(pipe(value, headerMarkShower), ASStyle.green('(5,3) '))).toBe(
							true
						);
					});
				});

				it('showId = true, propertyNumberDisplayOption = None', () => {
					const headerMarkShower = pipe(
						{
							...PPOption.NonPrimitive.record,
							showId: true,
							propertyNumberDisplayOption: PPOption.PropertyNumberDisplayOption.None
						},
						nonPrimitiveMake,
						fromNonPrimitive
					).toHeaderMarkShower(differingPropertyNumbers);
					expect(ASText.equivalence(pipe(value, headerMarkShower), ASStyle.green('Object '))).toBe(
						true
					);
				});

				it('showId = true, propertyNumberDisplayOption = AllAndActual', () => {
					const headerMarkShower = pipe(
						{
							...PPOption.NonPrimitive.record,
							showId: true,
							propertyNumberDisplayOption: PPOption.PropertyNumberDisplayOption.AllAndActual
						},
						nonPrimitiveMake,
						fromNonPrimitive
					).toHeaderMarkShower(differingPropertyNumbers);
					expect(
						ASText.equivalence(pipe(value, headerMarkShower), ASStyle.green('Object(5,3) '))
					).toBe(true);
				});

				describe('showId = true, propertyNumberDisplayOption = AllAndActualIfDifferent', () => {
					it('With differing property numbers', () => {
						const headerMarkShower = pipe(
							{
								...PPOption.NonPrimitive.record,
								showId: true,
								propertyNumberDisplayOption:
									PPOption.PropertyNumberDisplayOption.AllAndActualIfDifferent
							},
							nonPrimitiveMake,
							fromNonPrimitive
						).toHeaderMarkShower(differingPropertyNumbers);
						expect(
							ASText.equivalence(pipe(value, headerMarkShower), ASStyle.green('Object(5,3) '))
						).toBe(true);
					});

					it('With equal property numbers', () => {
						const headerMarkShower = pipe(
							{
								...PPOption.NonPrimitive.record,
								showId: true,
								propertyNumberDisplayOption:
									PPOption.PropertyNumberDisplayOption.AllAndActualIfDifferent
							},
							nonPrimitiveMake,
							fromNonPrimitive
						).toHeaderMarkShower(equalPropertyNumbers);
						expect(
							ASText.equivalence(pipe(value, headerMarkShower), ASStyle.green('Object '))
						).toBe(true);
					});
				});
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
		const stringifierWithoutFunctionByPasserShowingPrototype = PPOption.toStringifier(
			PPOption.make({
				...PPOption.utilInspectLike,
				id: 'WithoutFunctionByPasser',
				byPassers: Array.of(PPByPasser.objectToString),
				generalNonPrimitiveOption: {
					...PPOption.NonPrimitive.record,
					propertyFilters: Array.of(
						PPPropertyFilter.removeNotFulfillingKeyPredicateMaker({
							id: 'keepAAndLength',
							predicate: Predicate.or(MFunction.strictEquals('a'), MFunction.strictEquals('length'))
						})
					),
					maxPrototypeDepth: +Infinity
				}
			})
		);
		const stringifierWithInfiniteMaxDepth = PPOption.toStringifier(
			PPOption.make({ ...PPOption.utilInspectLike, id: 'NoDepthLimit', maxDepth: +Infinity })
		);
		const stringifierWithLimitedPropertiesShowPropNumber = PPOption.toStringifier(
			PPOption.make({
				...PPOption.utilInspectLike,
				id: 'WithModifiedNonPrimitiveOptions',
				generalNonPrimitiveOption: {
					...PPOption.NonPrimitive.record,
					maxPropertyNumber: 2,
					propertyNumberDisplayOption: PPOption.PropertyNumberDisplayOption.AllAndActual
				}
			})
		);
		const stringifierWithSortedProperties = PPOption.toStringifier(
			PPOption.make({
				...PPOption.utilInspectLike,
				id: 'WithModifiedNonPrimitiveOptions',
				generalNonPrimitiveOption: {
					...PPOption.NonPrimitive.record,
					propertySortOrder: Option.some(PPValueOrder.byOneLineStringKey)
				}
			})
		);

		const fooFunction = Object.assign(
			function foo(n: number) {
				return n + 1;
			},
			{ a: 1 }
		);

		describe('Check bypasser handling', () => {
			it('With function', () => {
				expect(pipe(fooFunction, stringifier, PPStringifiedValue.toUnstyledStrings)).toStrictEqual(
					Array.of('[Function: foo]')
				);
			});

			it('With date', () => {
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

		describe('Check circularity handling', () => {
			it('Simple example with color', () => {
				const circular = { a: 1 as unknown };
				/* eslint-disable-next-line functional/immutable-data */
				circular.a = circular;

				expect(pipe(circular, stringifier, PPStringifiedValue.toAnsiString())).toBe(
					pipe(
						ASStyle.green(
							'<Ref *1> ',
							ASStyle.red('{ a'),
							ASStyle.white(': '),
							ASStyle.green('[Circular *1]'),
							ASStyle.red(' }')
						),
						ASText.toAnsiString
					)
				);
			});

			it('More complex example without color', () => {
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
		});

		describe('Check non-primitive handling', () => {
			it('Empty array', () => {
				expect(pipe([], stringifier, PPStringifiedValue.toUnstyledStrings)).toStrictEqual(
					Array.of('[]')
				);
			});

			it('Empty record', () => {
				expect(pipe({}, stringifier, PPStringifiedValue.toUnstyledStrings)).toStrictEqual(
					Array.of('{}')
				);
			});

			it('Simple array', () => {
				expect(pipe([3, 4], stringifier, PPStringifiedValue.toUnstyledStrings)).toStrictEqual(
					Array.of('[ 3, 4 ]')
				);
			});

			it('Nested objects and arrays', () => {
				const map = new Map();
				/* eslint-disable-next-line functional/immutable-data */
				map.set({ mapA: 1, mapB: 2 }, 1);
				/* eslint-disable-next-line functional/immutable-data */
				map.set({ mapA: 6, mapB: 5 }, 3);
				const test = {
					c: { e: ['a', 'b'], d: [3, 4], a: map },
					a: ['r', { c: HashSet.make(new Uint8Array(3), new Uint8Array(3)) }],
					b: 't'
				};
				expect(
					pipe(test, stringifierWithInfiniteMaxDepth, PPStringifiedValue.toUnstyledStrings)
				).toStrictEqual(
					Array.make(
						'{',
						'  c: {',
						"    e: [ 'a', 'b' ],",
						'    d: [ 3, 4 ],',
						'    a: Map { { mapA: 1, mapB: 2 } => 1, { mapA: 6, mapB: 5 } => 3 }',
						'  },',
						"  a: [ 'r', { c: EffectHashSet { Uint8Array { 0, 0, 0 }, Uint8Array { 0, 0, 0 } } } ],",
						"  b: 't'",
						'}'
					)
				);
			});

			it('Show property number when necessary', () => {
				expect(
					pipe(
						{ b: 1, a: 2, c: 3 },
						stringifierWithLimitedPropertiesShowPropNumber,
						PPStringifiedValue.toUnstyledStrings
					)
				).toStrictEqual(Array.make('(3,2) { b: 1, a: 2 }'));
			});

			it('Sort properties', () => {
				expect(
					pipe(
						{ b: 1, a: 2, c: 3 },
						stringifierWithSortedProperties,
						PPStringifiedValue.toUnstyledStrings
					)
				).toStrictEqual(Array.make('{ a: 2, b: 1, c: 3 }'));
			});

			it('Unbypassed function with some prototype properties', () => {
				expect(
					pipe(
						fooFunction,
						stringifierWithoutFunctionByPasserShowingPrototype,
						PPStringifiedValue.toUnstyledStrings
					)
				).toStrictEqual(Array.of('{ length: 1, a: 1, length@: 0 }'));
			});

			describe('Treeify', () => {
				const toTreeify = {
					A: {
						A1: {
							A11: null,
							A12: [{ A121: null, A122: null, A123: null }, { A124: null }],
							A13: null
						},
						A2: null,
						A3: null
					},
					B: HashMap.make(['B1', null], ['B2', null])
				};
				it('Show leaves', () => {
					expect(
						pipe(
							toTreeify,
							PPOption.toStringifier(PPOption.treeify),
							PPStringifiedValue.toUnstyledStrings
						)
					).toStrictEqual([
						'├─ A',
						'│  ├─ A1',
						'│  │  ├─ A11: null',
						'│  │  ├─ A12',
						'│  │  │  ├─ 0',
						'│  │  │  │  ├─ A121: null',
						'│  │  │  │  ├─ A122: null',
						'│  │  │  │  └─ A123: null',
						'│  │  │  └─ 1',
						'│  │  │     └─ A124: null',
						'│  │  └─ A13: null',
						'│  ├─ A2: null',
						'│  └─ A3: null',
						'└─ B',
						'   ├─ B2 => null',
						'   └─ B1 => null'
					]);
				});

				it('Hide leaves', () => {
					expect(
						pipe(
							toTreeify,
							PPOption.toStringifier(PPOption.treeifyHideLeaves),
							PPStringifiedValue.toUnstyledStrings
						)
					).toStrictEqual([
						'├─ A',
						'│  ├─ A1',
						'│  │  ├─ A11',
						'│  │  ├─ A12',
						'│  │  │  ├─ 0',
						'│  │  │  │  ├─ A121',
						'│  │  │  │  ├─ A122',
						'│  │  │  │  └─ A123',
						'│  │  │  └─ 1',
						'│  │  │     └─ A124',
						'│  │  └─ A13',
						'│  ├─ A2',
						'│  └─ A3',
						'└─ B',
						'   ├─ B2',
						'   └─ B1'
					]);
				});
			});
		});
	});
});
