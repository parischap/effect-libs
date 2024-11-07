import * as Errors from '@parischap/date/Errors';

/*
 * Formats a date string according to the passed format. See Token.ts for the list and description of the tokens that can be used in the format param.
 * @param format example: `yyyy-MM-ddTHH:mm:ssXXX`
 * @param locale locale to use to parse the date. If omitted, system locale is used. The locale is used for tokens that output a string like `MMM`, `MMMM`, `EEE`, `EEEE`,...
 * @returns The function returns an error if the locale does not exist. Otherwise, it returns a function that takes a date to format (`input`) and returns a string.
 */

export const formatDate = (
	format: string,
	locale?: string
): Either.Either<Errors.InexistentLocale, (input: Date) => string> => {
	const searchPattern = new RegExp(
		pipe(
			Token,
			HashMap.keys,
			Array.fromIterable,
			// We sort the patterns in reverse order so smaller patterns match after larger ones in which they may be included.
			Array.sort(Order.reverse(Order.string)),
			(arr) => MRegExpString.either(...arr),
			MRegExpString.capture
		),
		'g'
	);
};
