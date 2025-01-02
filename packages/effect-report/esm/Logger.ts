import { MString, MTypes } from '@parischap/effect-lib';
import { JsANSI, JsString } from '@parischap/js-lib';
import { Array, Effect, FiberId, List, LogLevel, Logger, Option, String, pipe } from 'effect';

//const moduleTag = '@parischap/effect-lib/Logger/';

class TitleMessage {
	readonly title: string;

	constructor({ title }: MTypes.Data<TitleMessage>) {
		this.title = title;
	}
}

export const logDebugTitle = (title: string): Effect.Effect<void> =>
	Effect.logDebug(new TitleMessage({ title }));
export const logInfoTitle = (title: string): Effect.Effect<void> =>
	Effect.logInfo(new TitleMessage({ title }));

const colorizeByLogLevel = (logLevel: LogLevel.LogLevel): ((s: string) => string) => {
	switch (logLevel) {
		case LogLevel.Fatal:
		case LogLevel.Error:
			return JsANSI.red;
		case LogLevel.Warning:
			return JsANSI.yellow;
		default:
			return JsANSI.green;
	}
};

const colorizeBySpanLevel = (spanLevel: number): ((s: string) => string) =>
	pipe(
		Array.make(JsANSI.cyan, JsANSI.yellow, JsANSI.magenta),
		Array.get(spanLevel),
		Option.getOrElse(() => JsANSI.blue)
	);

export const live = ({
	eol,
	startTime,
	stringify,
	tabChar
}: {
	readonly eol: string;
	readonly startTime: number;
	readonly stringify: (u: unknown) => string;
	readonly tabChar: string;
}) =>
	Logger.replace(
		Logger.defaultLogger,
		Logger.make(({ date, fiberId, logLevel, message, spans }) => {
			try {
				const isString = MTypes.isString(message);
				// Don't show time and threadName if we print an empty message
				if (isString && String.isEmpty(message.trim())) console.log('');
				else {
					const isTitle = message instanceof TitleMessage;

					const spanLevel = List.size(spans);

					const latestSpanCreationTime = pipe(
						spans,
						List.head,
						Option.map((span) => span.startTime),
						Option.getOrElse(() => startTime)
					);

					const strMessage =
						isTitle ? message.title
						: isString ? message
						: stringify(message);

					const isMultiLine = JsString.isMultiLine(strMessage);

					console.log(
						pipe(
							(isMultiLine ? 'Multi-line message' : strMessage) +
								` (${FiberId.threadName(fiberId)})`,
							isTitle ? colorizeBySpanLevel(spanLevel) : JsANSI.highContrastBlack,
							MString.prepend(
								colorizeByLogLevel(logLevel)(`${date.getTime() - latestSpanCreationTime}ms `)
							),
							String.concat(isMultiLine ? eol + JsString.tabify(tabChar)(strMessage) : ''),
							JsString.tabify(tabChar, spanLevel)
						)
					);
				}
			} catch (e) {
				console.log(
					JsANSI.red('Logging error' + eol + (MTypes.isErrorish(e) ? e.message : stringify(e)))
				);
			}
		})
	);
