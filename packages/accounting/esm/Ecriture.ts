import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Inspectable, Pipeable, Predicate } from 'effect';

export const moduleTag = '@parischap/accounting/Ecriture/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type of an Ecriture
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Code of the journal impacted by this Ecriture
	 *
	 * @since 0.0.1
	 */
	readonly journalCode: string;

	/**
	 * Unique ecriture number
	 *
	 * @since 0.0.1
	 */
	readonly ecritureNum: number;

	/**
	 * Exercice to which this Ecriture belongs
	 *
	 * @since 0.0.1
	 */
	readonly exercice: number;

	/**
	 * Compte impacted by this Ecriture
	 *
	 * @since 0.0.1
	 */
	readonly compteNum: string;

	/**
	 * Compte auxiliaire impacted by this Ecriture
	 *
	 * @since 0.0.1
	 */
	readonly compteAuxNum: string;

	/**
	 * Reference of the piece that justifies this Ecriture
	 *
	 * @since 0.0.1
	 */
	readonly pieceRef: string;

	/**
	 * Date at which this Ecriture is to be posted in format AAAAMMDD
	 *
	 * @since 0.0.1
	 */
	readonly pieceDate: string;

	/**
	 * Free text describing this Ecriture
	 *
	 * @since 0.0.1
	 */
	readonly ecritureLib: string;

	/**
	 * Amount of this Ecriture. Negative for debit, positive for credit
	 *
	 * @since 0.0.1
	 */
	readonly debitCredit: number;

	/**
	 * String that relates several Ecriture in the same account indicating that tey compensate one
	 * another.
	 *
	 * @since 0.0.1
	 */
	readonly ecritureLet: string;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */

export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/**
 * Constructor
 *
 * @since 0.0.1
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);
