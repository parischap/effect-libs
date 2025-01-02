import { Error as PlatformError, FileSystem as PlatformFs } from '@effect/platform';
import { NodeFileSystem as PlatformNodeFs } from '@effect/platform-node';
import { MFs, MFunction, MPredicate, MTuple, MTypes } from '@parischap/effect-lib';
import * as NPath from './Path.js';

import {
	Array,
	Cause,
	Chunk,
	Context,
	Effect,
	Either,
	Layer,
	Option,
	Predicate,
	Scope,
	Sink,
	Stream,
	Struct,
	Tuple,
	flow,
	pipe
} from 'effect';

import { Concurrency } from 'effect/Types';

const moduleTag = '@parischap/node-effect-lib/Fs/';

const PlatformNodeFsService = PlatformFs.FileSystem;
const PlatformNodeFsLive = PlatformNodeFs.layer;

/** @category Type guards */
export const isFileStat = (s: PlatformFs.File.Info): s is PlatformFs.File.Info & { type: 'File' } =>
	s.type === 'File';

/** @category Type guards */
export const isFolderStat = (
	s: PlatformFs.File.Info
): s is PlatformFs.File.Info & { type: 'Directory' } => s.type === 'Directory';

/**
 * WithStat is a structure that associates a name or path to its stat
 *
 * @category Models
 */
export interface WithStat<out P extends MFs.Path | MFs.Name = MFs.Path | MFs.Name> {
	readonly target: P;
	readonly stat: PlatformFs.File.Info &
		(readonly [P] extends readonly [MFs.FileBrand] ? { readonly type: 'File' }
		: readonly [P] extends readonly [MFs.FolderBrand] ? { readonly type: 'Directory' }
		: { readonly type: 'File' | 'Directory' });
}

type ExpandedWithStat<P extends MFs.Path | MFs.Name> = P extends unknown ? WithStat<P> : never;

/** @category Models */
export interface FilenameWithStat extends WithStat<MFs.Filename> {}
/** @category Models */
export interface FoldernameWithStat extends WithStat<MFs.Foldername> {}
/** @category Models */
export interface FilepathWithStat extends WithStat<MFs.Filepath> {}
/** @category Models */
export interface FolderpathWithStat extends WithStat<MFs.Folderpath> {}

const makeExpandedWithStat = <P extends MFs.Path | MFs.Name>(
	params: MTypes.Data<WithStat<P>>
): ExpandedWithStat<P> => params as ExpandedWithStat<P>;

/** @category Type guards */
export const isFilenameWithStat = (p: WithStat<MFs.Name>): p is FilenameWithStat =>
	isFileStat(p.stat);

/** @category Type guards */
export const isFoldernameWithStat = (p: WithStat<MFs.Name>): p is FoldernameWithStat =>
	isFolderStat(p.stat);

/** @category Type guards */
export const isFilePathWithStat = (p: WithStat<MFs.Path>): p is FilepathWithStat =>
	isFileStat(p.stat);

/** @category Type guards */
export const isFolderPathWithStat = (p: WithStat<MFs.Path>): p is FolderpathWithStat =>
	isFolderStat(p.stat);

export interface ServiceInterface {
	/** Get information about a path. Always follows symbolic links */
	readonly stat: <P extends MFs.Path>(
		path: P
	) => Effect.Effect<
		PlatformFs.File.Info &
			(readonly [P] extends readonly [MFs.Filepath] ? { readonly type: 'File' }
			: readonly [P] extends readonly [MFs.Folderpath] ? { readonly type: 'Directory' }
			: never),
		PlatformError.PlatformError
	>;

	/**
	 * Get information about a path. Does not follow symbolic links. Does not work at the moment. To
	 * be updated when Platform node has been corrected.
	 */
	//readonly lstat: (path: MFs.Path) => Effect.Effect<PlatformFs.File.Info, PlatformError.PlatformError>;

	/** Reads the contents of a file. See default value for encoding in NodeJs readfile doc. */
	readonly readFileString: (
		path: MFs.Filepath,
		encoding?: string
	) => Effect.Effect<string, PlatformError.PlatformError>;

	/** Lists the contents of a directory. */
	readonly readDirectory: (
		path: MFs.Folderpath
	) => Effect.Effect<ReadonlyArray<MFs.Name>, PlatformError.PlatformError>;

	/** Same as readDirectory but also returns files' stats */
	readonly readDirectoryWithStats: (
		path: MFs.Folderpath,
		concurrencyOptions?: { readonly concurrency?: Concurrency }
	) => Effect.Effect<
		ReadonlyArray<FilenameWithStat | FoldernameWithStat>,
		PlatformError.PlatformError
	>;

	/**
	 * Reads the contents of the directory at path and of all directories (including symlinks) below
	 * except these excluded by excludeDir. Returns an error if circularity is detected. If glob
	 * receives a relative path, excludeDir will receive a relative path as well. If glob receives an
	 * absolute path, excludeDir will receive an absolute path as well.
	 */
	readonly glob: (params: {
		readonly path: MFs.Folderpath;
		readonly excludeDir: Predicate.Predicate<MFs.Folderpath>;
		readonly concurrencyOptions?: { readonly concurrency?: Concurrency };
	}) => Stream.Stream<FilepathWithStat, PlatformError.PlatformError>;

	/**
	 * Reads the directory tree upward starting at path until either isTargetDir returns true or the
	 * user's home directory is reached.
	 *
	 * @returns The matching path if found. Returns Cause.NoSuchElementException otherwise
	 */
	readonly readDirectoriesUpwardWhile: <E, R>(params: {
		readonly path: MFs.Folderpath;
		readonly isTargetDir: MPredicate.EffectPredicate<
			readonly [currentPath: MFs.Folderpath, contents: ReadonlyArray<WithStat<MFs.Name>>],
			E,
			R
		>;
		readonly concurrencyOptions?: { readonly concurrency?: Concurrency };
	}) => Effect.Effect<
		MFs.Folderpath,
		PlatformError.PlatformError | E | Cause.NoSuchElementException,
		R
	>;

	/** Checks if a path can be accessed. You can optionally specify the level of access to check for. */
	readonly access: (
		path: MFs.Path,
		options?: PlatformFs.AccessFileOptions
	) => Effect.Effect<void, PlatformError.PlatformError>;

	/**
	 * Copy a directory from `fromPath` to `toPath`.
	 *
	 * Equivalent to `cp -r`.
	 */
	readonly copy: (
		fromPath: MFs.Folderpath,
		toPath: MFs.Folderpath,
		options?: PlatformFs.CopyOptions
	) => Effect.Effect<void, PlatformError.PlatformError>;
	/** Copy a file from `fromPath` to `toPath`. */
	readonly copyFile: (
		fromPath: MFs.Filepath,
		toPath: MFs.Filepath
	) => Effect.Effect<void, PlatformError.PlatformError>;
	/** Change the permissions of a path. */
	readonly chmod: (
		path: MFs.Path,
		mode: number
	) => Effect.Effect<void, PlatformError.PlatformError>;
	/** Change the owner and group of a path. */
	readonly chown: (
		path: MFs.Path,
		uid: number,
		gid: number
	) => Effect.Effect<void, PlatformError.PlatformError>;
	/** Check if a path exists. */
	readonly exists: (path: MFs.Path) => Effect.Effect<boolean, PlatformError.PlatformError>;
	/** Create a hard link from `fromPath` to `toPath`. */
	readonly link: (
		fromPath: MFs.Filepath,
		toPath: MFs.Filepath
	) => Effect.Effect<void, PlatformError.PlatformError>;
	/**
	 * Create a directory at `path`. You can optionally specify the mode and whether to recursively
	 * create nested directories.
	 */
	readonly makeDirectory: (
		path: MFs.Folderpath,
		options?: PlatformFs.MakeDirectoryOptions
	) => Effect.Effect<void, PlatformError.PlatformError>;
	/**
	 * Create a temporary directory.
	 *
	 * By default the directory will be created inside the system's default temporary directory, but
	 * you can specify a different location by setting the `directory` option.
	 *
	 * You can also specify a prefix for the directory name by setting the `prefix` option.
	 */
	readonly makeTempDirectory: (
		options?: PlatformFs.MakeTempDirectoryOptions
	) => Effect.Effect<MFs.Folderpath, PlatformError.PlatformError>;
	/**
	 * Create a temporary directory inside a scope.
	 *
	 * Functionally equivalent to `makeTempDirectory`, but the directory will be automatically deleted
	 * when the scope is closed.
	 */
	readonly makeTempDirectoryScoped: (
		options?: PlatformFs.MakeTempDirectoryOptions
	) => Effect.Effect<MFs.Folderpath, PlatformError.PlatformError, Scope.Scope>;
	/**
	 * Create a temporary file. The directory creation is functionally equivalent to
	 * `makeTempDirectory`. The file name will be a randomly generated string.
	 */
	readonly makeTempFile: (
		options?: PlatformFs.MakeTempFileOptions
	) => Effect.Effect<MFs.Filepath, PlatformError.PlatformError>;
	/**
	 * Create a temporary file inside a scope.
	 *
	 * Functionally equivalent to `makeTempFile`, but the file will be automatically deleted when the
	 * scope is closed.
	 */
	readonly makeTempFileScoped: (
		options?: PlatformFs.MakeTempFileOptions
	) => Effect.Effect<MFs.Filepath, PlatformError.PlatformError, Scope.Scope>;
	/**
	 * Open the file at `path` with the specified `options`. The file handle will be automatically
	 * closed when the scope is closed.
	 */
	readonly open: (
		path: MFs.Filepath,
		options?: PlatformFs.OpenFileOptions
	) => Effect.Effect<PlatformFs.File, PlatformError.PlatformError, Scope.Scope>;
	/** Read the contents of a file. */
	readonly readFile: (path: MFs.Filepath) => Effect.Effect<Uint8Array, PlatformError.PlatformError>;
	/** Read the destination of a symbolic link. */
	readonly readLink: (path: MFs.Path) => Effect.Effect<string, PlatformError.PlatformError>;
	/** Resolve a path to its canonicalized absolute pathname. */
	readonly realPath: <T extends MFs.Path>(path: T) => Effect.Effect<T, PlatformError.PlatformError>;
	/**
	 * Remove a file or directory.
	 *
	 * By setting the `recursive` option to `true`, you can recursively remove nested directories.
	 */
	readonly remove: (
		path: MFs.Path,
		options?: PlatformFs.RemoveOptions
	) => Effect.Effect<void, PlatformError.PlatformError>;
	/** Rename a file or directory. */
	readonly rename: <T extends MFs.Path>(
		oldPath: T,
		newPath: T
	) => Effect.Effect<void, PlatformError.PlatformError>;
	/** Create a writable `Sink` for the specified `path`. */
	readonly sink: (
		path: MFs.Filepath,
		options?: PlatformFs.SinkOptions
	) => Sink.Sink<void, Uint8Array, never, PlatformError.PlatformError>;
	/**
	 * Create a readable `Stream` for the specified `path`.
	 *
	 * Changing the `bufferSize` option will change the internal buffer size of the stream. It
	 * defaults to `4`.
	 *
	 * The `chunkSize` option will change the size of the chunks emitted by the stream. It defaults to
	 * 64kb.
	 *
	 * Changing `offset` and `bytesToRead` will change the offset and the number of bytes to read from
	 * the file.
	 */
	readonly stream: (
		path: MFs.Filepath,
		options?: PlatformFs.StreamOptions
	) => Stream.Stream<Uint8Array, PlatformError.PlatformError>;
	/** Create a symbolic link from `fromPath` to `toPath`. */
	readonly symlink: <T extends MFs.Path>(
		fromPath: T,
		toPath: T
	) => Effect.Effect<void, PlatformError.PlatformError>;
	/**
	 * Truncate a file to a specified length. If the `length` is not specified, the file will be
	 * truncated to length `0`.
	 */
	readonly truncate: (
		path: MFs.Filepath,
		length?: PlatformFs.SizeInput
	) => Effect.Effect<void, PlatformError.PlatformError>;
	/** Change the file system timestamps of path. */
	readonly utimes: (
		path: MFs.Path,
		atime: Date | number,
		mtime: Date | number
	) => Effect.Effect<void, PlatformError.PlatformError>;
	/** Watch a directory or file for changes */
	readonly watch: (
		path: MFs.Path
	) => Stream.Stream<PlatformFs.WatchEvent, PlatformError.PlatformError>;
	/** Write data to a file at `path`. */
	readonly writeFile: (
		path: MFs.Filepath,
		data: Uint8Array,
		options?: PlatformFs.WriteFileOptions
	) => Effect.Effect<void, PlatformError.PlatformError>;
	/** Write a string to a file at `path`. */
	readonly writeFileString: (
		path: MFs.Filepath,
		data: string,
		options?: PlatformFs.WriteFileStringOptions
	) => Effect.Effect<void, PlatformError.PlatformError>;
}

export class Service extends Context.Tag(moduleTag + 'Service/')<Service, ServiceInterface>() {}

export const layer = Layer.effect(
	Service,
	Effect.gen(function* () {
		const fs = yield* pipe(PlatformNodeFsService);
		const nPath = yield* pipe(NPath.Service);

		const stat: ServiceInterface['stat'] = fs.stat as never;

		const readDirectory: ServiceInterface['readDirectory'] = (path) =>
			fs.readDirectory(path) as unknown as Effect.Effect<
				ReadonlyArray<MFs.Name>,
				PlatformError.PlatformError
			>;

		const realPath: ServiceInterface['realPath'] = <T extends MFs.Path>(path: T) =>
			fs.realPath(path) as Effect.Effect<T, PlatformError.PlatformError>;

		const readDirectoryWithStats: ServiceInterface['readDirectoryWithStats'] = (
			path,
			concurrencyOptions
		) =>
			Effect.flatMap(readDirectory(path), (names) =>
				pipe(
					names,
					Array.map((name) =>
						pipe(
							stat(nPath.join(path, name)),
							Effect.map((stat) => makeExpandedWithStat({ target: name, stat }))
						)
					),
					Effect.allWith(concurrencyOptions)
				)
			);

		return {
			stat,
			realPath,
			readDirectory,
			readDirectoryWithStats,
			glob: ({ concurrencyOptions, excludeDir, path }) =>
				Stream.paginateChunkEffect(
					Tuple.make(Array.of(path), Array.empty<MFs.Folderpath>()),
					([nextSeeds, parents]) =>
						Effect.gen(function* () {
							const realNextSeeds = yield* pipe(
								nextSeeds,
								Array.map(realPath),
								Effect.allWith(concurrencyOptions)
							);
							const newParents = yield* pipe(
								realNextSeeds,
								Either.liftPredicate(flow(Array.intersection(parents), MTypes.isOverOne), () =>
									PlatformError.SystemError({
										reason: 'BadResource',
										pathOrDescriptor: path,
										module: 'FileSystem',
										method: 'glob',
										message: 'Circularity detected. Following paths are cycling'
										//message: `Circularity detected. Following paths are cycling: ${Array.join(duplicates, ', ')}`
									})
								),
								Either.map(Array.appendAll(parents))
							);
							const namesWithStatArray = yield* pipe(
								nextSeeds,
								Array.map((nextSeed) => readDirectoryWithStats(nextSeed, concurrencyOptions)),
								Effect.allWith(concurrencyOptions)
							);
							return pipe(
								namesWithStatArray,
								Array.zipWith(nextSeeds, (namesWithStat, nextSeed) =>
									Array.map(namesWithStat, (nameWithStat) => {
										return makeExpandedWithStat({
											...nameWithStat,
											target: nPath.join(nextSeed, nameWithStat.target)
										});
									})
								),
								Array.flatten,
								Array.partition(isFolderPathWithStat),
								Tuple.mapBoth({
									onFirst: Chunk.fromIterable,
									onSecond: flow(
										Array.filterMap(
											flow(Struct.get('target'), Option.liftPredicate(Predicate.not(excludeDir)))
										),
										Option.liftPredicate(MTypes.isOverOne),
										Option.map(flow(MTuple.fromSingleValue, Tuple.appendElement(newParents)))
									)
								})
							);
						})
				),
			readDirectoriesUpwardWhile: ({ concurrencyOptions, isTargetDir, path }) =>
				pipe(
					Stream.iterate(path, nPath.dirname),
					Stream.takeUntilEffect(
						flow(
							realPath,
							Effect.map(
								Predicate.or(
									MFunction.strictEquals(nPath.homeDir),
									MFunction.strictEquals(nPath.rootDir)
								)
							)
						)
					),
					Stream.mapEffect((currentPath) =>
						pipe(
							readDirectoryWithStats(currentPath, concurrencyOptions),
							Effect.flatMap(
								flow(MTuple.fromSingleValue, MTuple.prependElement(currentPath), isTargetDir)
							),
							Effect.map(flow(MTuple.fromSingleValue, MTuple.prependElement(currentPath)))
						)
					),
					Stream.takeUntil(Tuple.getSecond),
					Stream.runLast,
					Effect.flatMap(Option.flatMap(Option.liftPredicate(([_, isTargetDir]) => isTargetDir))),
					Effect.map(Tuple.getFirst)
				),
			access: fs.access,
			copy: fs.copy,
			copyFile: fs.copyFile,
			chmod: fs.chmod,
			chown: fs.chown,
			exists: fs.exists,
			link: fs.link,
			makeDirectory: fs.makeDirectory,
			makeTempDirectory: fs.makeTempDirectory as ServiceInterface['makeTempDirectory'],
			makeTempDirectoryScoped:
				fs.makeTempDirectoryScoped as ServiceInterface['makeTempDirectoryScoped'],
			makeTempFile: fs.makeTempFile as ServiceInterface['makeTempFile'],
			makeTempFileScoped: fs.makeTempFileScoped as ServiceInterface['makeTempFileScoped'],
			open: fs.open,
			readFile: fs.readFile,
			readFileString: fs.readFileString,
			readLink: fs.readLink,
			remove: fs.remove,
			rename: fs.rename,
			sink: fs.sink,
			stream: fs.stream,
			symlink: fs.symlink,
			truncate: fs.truncate,
			utimes: fs.utimes,
			watch: fs.watch,
			writeFile: fs.writeFile,
			writeFileString: fs.writeFileString
		};
	})
);

export const live = pipe(layer, Layer.provide(PlatformNodeFsLive), Layer.provide(NPath.live));
