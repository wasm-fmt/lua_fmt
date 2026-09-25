[![Test](https://github.com/wasm-fmt/lua_fmt/actions/workflows/test.yml/badge.svg)](https://github.com/wasm-fmt/lua_fmt/actions/workflows/test.yml)

# Install

[![npm](https://img.shields.io/npm/v/@wasm-fmt/lua_fmt?color=000080)](https://www.npmjs.com/package/@wasm-fmt/lua_fmt)

```bash
npm install @wasm-fmt/lua_fmt
```

[![jsr.io](https://jsr.io/badges/@fmt/lua-fmt?color=000080)](https://jsr.io/@fmt/lua-fmt)

```bash
npx jsr add @fmt/lua-fmt
```

# Usage

## Node.js / Deno / Bun / Bundler

```javascript
import { format, formatRanges } from "@wasm-fmt/lua_fmt";

const input = `print "Hello World"`;

const formatted = format(input);
console.log(formatted);

// Ranges use UTF-8 byte offsets and [start, end) semantics.
const source = 'local value="名称"\nlocal y=2\n';
const encoder = new TextEncoder();
const start = encoder.encode('local value="名称"\n').length;
const partiallyFormatted = formatRanges(source, [{ start, end: encoder.encode(source).length }]);
console.log(partiallyFormatted);
```

## Web

For web environments, you need to initialize WASM module manually:

```javascript
import init, { format } from "@wasm-fmt/lua_fmt/web";

await init();

const input = `print "Hello World"`;

const formatted = format(input);
console.log(formatted);
```

### Vite

```JavaScript
import init, { format } from "@wasm-fmt/lua_fmt/vite";

await init();
// ...
```

Or use the `./bundler` entry with [vite-plugin-wasm](https://www.npmjs.com/package/vite-plugin-wasm)

```javascript
import { format } from "@wasm-fmt/lua_fmt/bundler";
```

## Entry Points

- `.` - Auto-detects environment (Node.js uses node, Webpack uses bundler, default is ESM)
- `./node` - Node.js environment (no init required)
- `./esm` - ESM environments like Deno (no init required)
- `./bundler` - Bundlers like Webpack (no init required)
- `./web` - Web browsers (requires manual init)
- `./vite` - Vite bundler (requires manual init)

## Bridge experiment

This branch exposes whole-file and range formatting through the wasm-fmt
Bridge ABI. StyLua accepts one range per call. An empty range list is
unchanged, while requests with multiple ranges fail explicitly.

# Credits

Thanks to:

- The [StyLua](https://github.com/JohnnyMorganz/StyLua) project created by [@JohnnyMorganz](https://github.com/JohnnyMorganz)
