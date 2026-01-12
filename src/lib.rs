use serde::Deserialize;
use stylua_lib::{
    format_code, CallParenType, CollapseSimpleStatement, Config as StyluaConfig, IndentType,
    LineEndings, OutputVerification, QuoteStyle, SortRequiresConfig,
};
use wasm_bindgen::prelude::wasm_bindgen;

/// Formats the given Lua code according to the provided configuration.
#[wasm_bindgen]
pub fn format(
    #[wasm_bindgen(param_description = "Lua code to format")] input: &str,
    #[wasm_bindgen(param_description = "Configuration for formatting")] config: Option<Config>,
) -> Result<String, String> {
    let config = config
        .map(|x| serde_wasm_bindgen::from_value::<LuaConfig>(x.into()))
        .transpose()
        .map_err(|op| op.to_string())?
        .unwrap_or_default();

    format_code(input, config.into(), None, OutputVerification::None).map_err(|e| e.to_string())
}

/// Formats a specific range of Lua code.
#[wasm_bindgen]
pub fn format_range(
    #[wasm_bindgen(param_description = "Lua code to format")] input: &str,
    #[wasm_bindgen(param_description = "Byte offset range")] range: Range,
    #[wasm_bindgen(param_description = "Configuration for formatting")] config: Option<Config>,
) -> Result<String, String> {
    let stylua_range = serde_wasm_bindgen::from_value::<stylua_lib::Range>(range.into())
        .map_err(|e| e.to_string())?;

    let config = config
        .map(|x| serde_wasm_bindgen::from_value::<LuaConfig>(x.into()))
        .transpose()
        .map_err(|op| op.to_string())?
        .unwrap_or_default();

    format_code(input, config.into(), Some(stylua_range), OutputVerification::None)
        .map_err(|e| e.to_string())
}

#[wasm_bindgen(typescript_custom_section)]
const TS_Config: &'static str = r#"
import type { Config, Range } from "./lua_fmt_config.d.ts";
export type * from "./lua_fmt_config.d.ts";
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "Config")]
    pub type Config;

    #[wasm_bindgen(typescript_type = "Range")]
    pub type Range;
}

#[derive(Deserialize, Clone, Default)]
struct LayoutConfig {
    #[serde(alias = "indentStyle")]
    indent_style: Option<IndentStyle>,
    #[serde(alias = "indentWidth")]
    indent_width: Option<u8>,
    #[serde(alias = "lineWidth")]
    line_width: Option<u16>,
    #[serde(alias = "lineEnding")]
    line_ending: Option<LineEnding>,
}

#[derive(Deserialize, Clone, Default)]
struct LuaConfig {
    #[serde(flatten)]
    layout: LayoutConfig,

    #[serde(alias = "quoteStyle")]
    quote_style: Option<QuoteStyle>,

    #[serde(alias = "callParentheses")]
    call_parentheses: Option<CallParenType>,

    #[serde(alias = "collapseSimpleStatement")]
    collapse_simple_statement: Option<CollapseSimpleStatement>,

    #[serde(alias = "sortRequires")]
    sort_requires: Option<bool>,
}

impl From<LuaConfig> for StyluaConfig {
    fn from(val: LuaConfig) -> Self {
        let mut config = StyluaConfig::default();

        if let Some(indent_style) = val.layout.indent_style {
            config.indent_type = indent_style.into();
        }

        if let Some(indent_width) = val.layout.indent_width {
            config.indent_width = indent_width as usize;
        }

        if let Some(line_width) = val.layout.line_width {
            config.column_width = line_width as usize;
        }

        if let Some(line_ending) = val.layout.line_ending {
            config.line_endings = line_ending.into();
        }

        if let Some(quote_style) = val.quote_style {
            config.quote_style = quote_style;
        }

        if let Some(call_parentheses) = val.call_parentheses {
            config.call_parentheses = call_parentheses;
        }

        if let Some(collapse_simple_statement) = val.collapse_simple_statement {
            config.collapse_simple_statement = collapse_simple_statement;
        }

        if let Some(enabled) = val.sort_requires {
            config.sort_requires = SortRequiresConfig { enabled };
        }

        config
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "snake_case")]
#[derive(Clone, Copy, Default)]
enum IndentStyle {
    Tab,
    #[default]
    Space,
}

impl From<IndentStyle> for IndentType {
    fn from(val: IndentStyle) -> Self {
        match val {
            IndentStyle::Tab => Self::Tabs,
            IndentStyle::Space => Self::Spaces,
        }
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "snake_case")]
#[derive(Clone, Copy, Default)]
enum LineEnding {
    #[default]
    Lf,
    Crlf,
}

impl From<LineEnding> for LineEndings {
    fn from(val: LineEnding) -> Self {
        match val {
            LineEnding::Lf => Self::Unix,
            LineEnding::Crlf => Self::Windows,
        }
    }
}
