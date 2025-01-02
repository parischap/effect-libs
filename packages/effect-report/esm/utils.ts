import { MArray, MString, MTypes } from '@parischap/effect-lib';

import { JsANSI, JsString } from '@parischap/js-lib';
import { Array, String, pipe } from 'effect';

const relative =
	(from: string, pathSep: string) =>
	(to: string): string => {
		const fromArray = pipe(from, String.split(pathSep));
		const toArray = pipe(to, String.split(pathSep));
		const commonLength = pipe(fromArray, MArray.longestCommonSubArray(toArray), Array.length);
		const diff = fromArray.length - commonLength;
		return pipe(
			toArray,
			MArray.takeRightBut(commonLength),
			Array.prependAll(diff <= 0 ? Array.of('.') : Array.makeBy(diff, () => '..')),
			Array.join(pathSep)
		);
	};

export const stackTraceFormatter =
	(thisProgramPath: string, eol: string, pathSep: string) =>
	(_: Error, stackTraces: ReadonlyArray<NodeJS.CallSite>) =>
		pipe(
			stackTraces,
			Array.map((stackTrace) => {
				const typeName = stackTrace.getTypeName();
				const methodName = stackTrace.getMethodName();
				const functionName = stackTrace.getFunctionName();
				const functionAndMethod =
					(methodName !== null ? `${methodName}.` : '') +
					(functionName !== null ? `${functionName}()` : '');
				const fileName = stackTrace.getFileName();
				const lineNumber = stackTrace.getLineNumber();
				const columnNumber = stackTrace.getColumnNumber();
				return (
					(typeName !== null ?
						functionAndMethod ? `${typeName}.${functionAndMethod}`
						:	`Class '${typeName}'`
					: functionAndMethod ? `${functionAndMethod}`
					: '') +
					(fileName !== undefined ?
						` in ${pipe(fileName, relative(thisProgramPath, pathSep), MString.takeRightFrom('node_modules'))}`
					:	'') +
					(lineNumber !== null ?
						columnNumber !== null ?
							`pos ${lineNumber},${columnNumber}`
						:	`line ${lineNumber}`
					: columnNumber !== null ? `col ${columnNumber}`
					: '')
				);
			}),
			Array.join(eol)
		);

export const formatError = (
	self: MTypes.Errorish,
	options: {
		readonly eol: string;
		readonly pathSep: string;
		readonly stringify: (u: unknown) => string;
		readonly tabChar: string;
	}
) => {
	// if there is no message, there might be other useful information in the object
	const message =
		self.message === '' ?
			'Error object' + options.eol + options.stringify(self)
		:	JsANSI.highContrastBlack(self.message);

	return self.stack !== undefined ?
			message +
				options.eol +
				options.tabChar +
				JsANSI.green('Stack trace:') +
				JsString.tabify(options.tabChar, 2)(self.stack)
		:	message;
};

const showUncaughtErrorAndExit = ({
	eol,
	error,
	message,
	pathSep,
	stringify,
	tabChar
}: {
	readonly eol: string;
	readonly error: unknown;
	readonly message: string;
	readonly pathSep: string;
	readonly stringify: (u: unknown) => string;
	readonly tabChar: string;
}): never => {
	console.error(
		JsANSI.red(message) +
			eol +
			JsString.tabify(tabChar)(
				MTypes.isErrorish(error) ?
					formatError(error, { eol, pathSep, stringify, tabChar })
				:	stringify(error)
			) +
			eol +
			eol
	);
	return process.exit(1);
};

export const catchUnexpectedErrors = ({
	eol,
	pathSep,
	stringify,
	tabChar
}: {
	readonly eol: string;
	readonly pathSep: string;
	readonly stringify: (u: unknown) => string;
	readonly tabChar: string;
}): void => {
	// eslint-disable-next-line functional/no-expression-statements
	process
		.on('unhandledRejection', (reason) => {
			return showUncaughtErrorAndExit({
				eol,
				error: reason,
				message: 'UNHANDLED REJECTION',
				pathSep,
				stringify,
				tabChar
			});
		})
		.on('uncaughtException', (error) => {
			return showUncaughtErrorAndExit({
				eol,
				error: error,
				message: 'UNCAUGHT EXCEPTION',
				pathSep,
				stringify,
				tabChar
			});
		});
};
