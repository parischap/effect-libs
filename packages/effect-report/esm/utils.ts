import * as MArray from '@parischap/effect-lib/MArray'
import * as MString from '@parischap/effect-lib/MString'
import * as MTypes from '@parischap/effect-lib/MTypes'

import * as JsAnsi from '@parischap/js-lib/JsAnsi'
import * as JsString from '@parischap/js-lib/JsString'
import {pipe} from 'effect'
import * as Array from 'effect/Array'
import * as String from 'effect/String'

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
      Array.join(pathSep),
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
          (methodName !== null ? `${methodName}.` : '')
          + (functionName !== null ? `${functionName}()` : '');
        const fileName = stackTrace.getFileName();
        const lineNumber = stackTrace.getLineNumber();
        const columnNumber = stackTrace.getColumnNumber();
        return (
          (typeName !== null ?
            functionAndMethod ? `${typeName}.${functionAndMethod}`
            : `Class '${typeName}'`
          : functionAndMethod ? `${functionAndMethod}`
          : '')
          + (fileName !== undefined ?
            ` in ${pipe(fileName, relative(thisProgramPath, pathSep), MString.takeRightFrom('node_modules'))}`
          : '')
          + (lineNumber !== null ?
            columnNumber !== null ?
              `pos ${lineNumber},${columnNumber}`
            : `line ${lineNumber}`
          : columnNumber !== null ? `col ${columnNumber}`
          : '')
        );
      }),
      Array.join(eol),
    );

export const formatError = (
  self: Error,
  options: {
    readonly eol: string;
    readonly pathSep: string;
    readonly stringify: (u: unknown) => string;
    readonly tabChar: string;
  },
) => {
  // if there is no message, there might be other useful information in the object
  const message =
    self.message.length === 0 ?
      'Error object' + options.eol + options.stringify(self)
    : JsAnsi.highContrastBlack(self.message);

  return self.stack !== undefined ?
      message
        + options.eol
        + options.tabChar
        + JsAnsi.green('Stack trace:')
        + JsString.tabify(options.tabChar, 2)(self.stack)
    : message;
};

const showUncaughtErrorAndExit = ({
  eol,
  error,
  message,
  pathSep,
  stringify,
  tabChar,
}: {
  readonly eol: string;
  readonly error: unknown;
  readonly message: string;
  readonly pathSep: string;
  readonly stringify: (u: unknown) => string;
  readonly tabChar: string;
}): never => {
  console.error(
    JsAnsi.red(message)
      + eol
      + JsString.tabify(tabChar)(
        MTypes.isErrorish(error) ?
          formatError(error, { eol, pathSep, stringify, tabChar })
        : stringify(error),
      )
      + eol
      + eol,
  );
  return process.exit(1);
};

export const catchUnexpectedErrors = ({
  eol,
  pathSep,
  stringify,
  tabChar,
}: {
  readonly eol: string;
  readonly pathSep: string;
  readonly stringify: (u: unknown) => string;
  readonly tabChar: string;
}): void => {
  process
    .on('unhandledRejection', (reason) => {
      return showUncaughtErrorAndExit({
        eol,
        error: reason,
        message: 'UNHANDLED REJECTION',
        pathSep,
        stringify,
        tabChar,
      });
    })
    .on('uncaughtException', (error) => {
      return showUncaughtErrorAndExit({
        eol,
        error: error,
        message: 'UNCAUGHT EXCEPTION',
        pathSep,
        stringify,
        tabChar,
      });
    });
};
