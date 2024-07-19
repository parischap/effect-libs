export const toString = (regexp: string | RegExp) =>
	typeof regexp === 'string' ? regexp : regexp.source;
export const zeroOrMore = (s: string): string => `(?:${s})*`;
export const oneOrMore = (s: string): string => `(?:${s})+`;
export const repeatBetween = (s: string, low: string, high = ''): string =>
	`(?:${s}){${low},${high}}`;
export const optional = (s: string): string => `(?:${s})?`;
export const either = (...args: ReadonlyArray<string>): string => `(?:${args.join('|')})`;
export const makeLine = (s: string): string => `^${s}$`;
export const makeEndOfLine = (s: string): string => `${s}$`;
export const negativeLookAhead = (s: string): string => `(?!${s})`;
export const positiveLookAhead = (s: string): string => `(?=${s})`;
export const capture = (s: string): string => `(${s})`;
/*export const range = (start: string, end: string): string =>
	`[${start}-${end}]`;*/

export const escapeRegex = (s: string) => s.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

export const anyChar = '.';
export const anythingButDot = '[^.]';

export const backslash = '\\';
export const dollar = backslash + '$';
export const plus = backslash + '+';
export const sign = either(plus, '-');
export const star = backslash + '*';
export const dot = backslash + '.';
export const digit = backslash + 'd';
export const positiveInteger = either('0', '[1-9]' + zeroOrMore(digit));
export const letter = /[A-Za-z]/.source;
export const anyWordLetter = backslash + 'w';
export const anyWord = oneOrMore(anyWordLetter);
export const slash = backslash + '/';
export const CR = backslash + 'r';
export const LF = backslash + 'n';
export const lineBreak = either(optional(CR) + LF, CR);
