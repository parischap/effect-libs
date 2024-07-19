import { Error as PlatformError, Path as PlatformPath } from '@effect/platform';
import { NodePath as PlatformNodePath } from '@effect/platform-node';
import { MFs } from '@parischap/effect-lib';
import { Context, Effect, Layer, flow, pipe } from 'effect';
import { homedir } from 'node:os';

const moduleTag = '@parischap/node-effect-lib/NPath/';

const PlatformNodePathService = PlatformPath.Path;

// layerWin32 implements functions that behave similarly on Windows and Linux
// See Node js path doc for more information
const PlatformNodePathLive = PlatformNodePath.layerWin32;

export interface Parsed<out T extends MFs.Name> {
	readonly root: MFs.Folderpath;
	readonly dir: MFs.Folderpath;
	readonly base: T;
	readonly ext: string;
	readonly name: string;
}
export interface ServiceInterface {
	/** Current working directory */
	readonly currentDirectory: MFs.Folderpath;

	/**
	 * User's home directory
	 */
	readonly homeDir: MFs.Folderpath;

	/**
	 * System root directory
	 */
	readonly rootDir: MFs.Folderpath;

	/**
	 * Join all arguments together and normalize the resulting path.
	 */
	readonly join: {
		<TN extends MFs.Name>(
			...paths: readonly [p1: MFs.Folderpath, ...ps: ReadonlyArray<MFs.Foldername>, pn: TN]
		): MFs.ToPath<TN>;
		(...paths: ReadonlyArray<string>): string;
	};

	/**
	 * Used to convert a path to an absolute path. If lastSegment isn't already absolute, previousSegments are prepended in right to left order, until an absolute path is found. If after using all previousSegments paths still no absolute path is found, the current working directory is used as well. The resulting path is normalized, and trailing slashes are removed unless the path gets resolved to the root directory.
	 */
	readonly resolve: <T extends MFs.Path>(
		...paths: readonly [...leftPaths: ReadonlyArray<MFs.Folderpath>, rightPath: T]
	) => T;

	/**
	 * Used to convert an absolute path to a relative path. If to or from is the zero-length string, the current working directory is used instead.
	 */
	readonly relative: <T extends MFs.Path>(from: MFs.Path, to: T) => T;

	/**
	 * Returns all the segments of a path but the last. No trailing slash.
	 */
	readonly dirname: (p: MFs.Path) => MFs.Folderpath;

	/**
	 * Returns the last segment of a path.
	 */
	readonly basename: <T extends MFs.Path>(p: T) => MFs.ToName<T>;

	/**
	 * Returns the extension of the path
	 */
	readonly extname: (p: string) => string;

	/**
	 * normalizes a path
	 */
	readonly normalize: <T extends MFs.Path>(p: T) => T;

	/**
	 * Parse a path
	 */
	readonly parse: <T extends MFs.Path>(p: T) => Parsed<MFs.ToName<T>>;

	/**
	 * Format a path
	 */
	readonly format: <T extends MFs.Name>(p: Parsed<T>) => MFs.ToPath<T>;

	/**
	 * Checks if a path is absolute
	 */
	readonly isAbsolute: {
		(p: MFs.Path): boolean;
	};

	/**
	 * The platform-specific file separator. '\\' or '/'.
	 */
	readonly sep: string;
	readonly fromFileUrl: (url: URL) => Effect.Effect<MFs.Filepath, PlatformError.BadArgument>;
	readonly toFileUrl: (path: MFs.Path) => Effect.Effect<URL, PlatformError.BadArgument>;
}

export class Service extends Context.Tag(moduleTag + 'Service')<Service, ServiceInterface>() {}

export const layer = Layer.effect(
	Service,
	Effect.gen(function* () {
		const path = yield* pipe(PlatformNodePathService);

		const currentDirectoryStr = path.resolve();
		const homeDirStr = homedir();

		const currentDirectory = MFs.Folderpath(currentDirectoryStr);
		const homeDir = MFs.Folderpath(homeDirStr);
		const parse: ServiceInterface['parse'] = <T extends MFs.Path>(p: T) =>
			path.parse(p) as Parsed<MFs.ToName<T>>;
		const rootDir = parse(homeDir).root;

		return {
			currentDirectory,
			homeDir,
			rootDir,
			join: (...paths: ReadonlyArray<string>) => path.join(...paths) as never,
			resolve: <T extends MFs.Path>(
				...paths: readonly [...leftPaths: ReadonlyArray<MFs.Folderpath>, rightPath: T]
			) => path.resolve(...paths) as T,
			relative: <T extends MFs.Path>(from: MFs.Path, to: T) => path.relative(from, to) as T,
			dirname: flow(path.dirname, MFs.Folderpath),
			basename: <T extends MFs.Path>(p: T) => path.basename(p) as MFs.ToName<T>,
			extname: path.extname,
			normalize: <T extends MFs.Path>(p: T) => path.normalize(p) as T,
			parse,
			format: <T extends MFs.Name>(p: Parsed<T>) => path.format(p) as MFs.ToPath<T>,
			isAbsolute: path.isAbsolute,
			sep: path.sep,
			fromFileUrl: (url) =>
				path.fromFileUrl(url) as Effect.Effect<MFs.Filepath, PlatformError.BadArgument>,
			toFileUrl: path.toFileUrl
		};
	})
);

export const live = pipe(layer, Layer.provide(PlatformNodePathLive));
