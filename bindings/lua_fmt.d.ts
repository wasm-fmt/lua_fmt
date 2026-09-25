import type { ConfigHandle as BridgeConfigHandle } from "@wasm-fmt/runtime";
import type { Config } from "./lua_fmt_config.d.ts";
export type * from "./lua_fmt_config.d.ts";

export type ConfigHandle = BridgeConfigHandle<"lua_fmt">;
export type ConfigInput = Config | ConfigHandle;
export interface TextRange {
	/** Inclusive UTF-8 byte offset in the original source. */
	readonly start: number;
	/** Exclusive UTF-8 byte offset in the original source. */
	readonly end: number;
}

/** Format an entire Lua source string. */
export declare function format(input: string, config?: ConfigInput | null): string;
/** Format the source selected by one UTF-8 byte range. */
export declare function formatRanges(input: string, ranges: readonly TextRange[], config?: ConfigInput | null): string;
/** Create a reusable formatter configuration. */
export declare function createConfig(config?: Config): ConfigHandle;
/** Release a reusable formatter configuration. */
export declare function releaseConfig(handle: ConfigHandle): void;
