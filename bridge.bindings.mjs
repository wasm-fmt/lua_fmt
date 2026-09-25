import { defineBindings } from "@wasm-fmt/bindgen";

export default defineBindings({
	name: "lua_fmt",
	wasm: "target/wasm32-unknown-unknown/release/lua_fmt.wasm",
	wasmFile: "lua_fmt_bg.wasm",
	adapter: "bindings/lua_fmt_binding.js",
	types: {
		main: "bindings/lua_fmt.d.ts",
	},
	assets: [
		"package.json",
		"jsr.jsonc",
		"README.md",
		"LICENSE-MIT",
		"LICENSE-APACHE",
		"bindings/.npmignore",
		"bindings/lua_fmt_config.d.ts",
	],
	outDir: "pkg",
	clean: true,
});
