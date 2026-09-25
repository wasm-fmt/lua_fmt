// @ts-check

const encoder = new TextEncoder();

/**
 * @type {import("@wasm-fmt/runtime").FormatterAdapter<
 *   typeof import("./lua_fmt.d.ts")
 * >}
 */
const adapter = {
	create(wasm, host) {
		const runtime = host.createRuntime(wasm, { encodeConfig });

		/** @type {typeof import("./lua_fmt.d.ts")} */
		const api = {
			/**
			 * @param {string} source
			 * @param {import("./lua_fmt.d.ts").ConfigInput | null} [config]
			 */
			format(source, config) {
				return runtime.format(source, config ?? undefined);
			},
			/**
			 * @param {string} source
			 * @param {readonly import("./lua_fmt.d.ts").TextRange[]} ranges
			 * @param {import("./lua_fmt.d.ts").ConfigInput | null} [config]
			 */
			formatRanges(source, ranges, config) {
				return runtime.formatRanges(source, ranges, config ?? undefined);
			},
			/** @param {import("./lua_fmt_config.d.ts").Config} [config] */
			createConfig(config) {
				return /** @type {import("./lua_fmt.d.ts").ConfigHandle} */ (runtime.createConfig(config ?? {}));
			},
			/** @param {import("./lua_fmt.d.ts").ConfigHandle} handle */
			releaseConfig(handle) {
				return runtime.releaseConfig(handle);
			},
		};

		return api;
	},
};

export default adapter;

/** @param {unknown} config */
function encodeConfig(config) {
	if (typeof config === "string") return encoder.encode(config);

	const json = JSON.stringify(config);
	if (json === undefined) {
		throw new TypeError("config must be JSON serializable");
	}
	return encoder.encode(json);
}
