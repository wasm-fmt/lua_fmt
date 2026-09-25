use serde::Deserialize;
use std::ops::Range;
use stylua_lib::{
    BlockNewlineGaps, CallParenType, CollapseSimpleStatement, Config as StyluaConfig, IndentType,
    LineEndings, OutputVerification, QuoteStyle, Range as StyluaRange, SortRequiresConfig,
    SpaceAfterFunctionNames, format_code,
};

/// Formats the given Lua code according to the provided configuration.
#[bridge::formatter]
fn format(source: &str, config: &LuaConfig) -> Result<String, String> {
    format_code(source, config.clone().into(), None, OutputVerification::None)
        .map_err(|err| err.to_string())
}

/// Formats the part of a Lua source selected by a single UTF-8 byte range.
///
/// StyLua accepts one byte range. Bridge preserves an explicitly empty range
/// request as `Unchanged` and rejects multiple ranges instead of silently
/// dropping any of them.
#[bridge::formatter]
fn format_range(
    source: &str,
    ranges: &[Range<u32>],
    config: &LuaConfig,
) -> Result<bridge::FormatResult, String> {
    let [range] = ranges else {
        if ranges.is_empty() {
            return Ok(bridge::FormatResult::Unchanged);
        }

        return Err("StyLua supports exactly one formatting range per request".to_string());
    };

    let start = usize::try_from(range.start)
        .map_err(|_| "range start cannot be represented by this target".to_string())?;
    let end = usize::try_from(range.end)
        .map_err(|_| "range end cannot be represented by this target".to_string())?;
    let range = StyluaRange::from_values(Some(start), Some(end));

    format_code(source, config.clone().into(), Some(range), OutputVerification::None)
        .map(bridge::FormatResult::FullUpdate)
        .map_err(|err| err.to_string())
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

#[bridge::config]
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

    #[serde(alias = "blockNewlineGaps")]
    block_newline_gaps: Option<BlockNewlineGaps>,

    #[serde(alias = "spaceAfterFunctionNames")]
    space_after_function_names: Option<SpaceAfterFunctionNames>,

    #[serde(alias = "sortRequires")]
    sort_requires: Option<bool>,
}

impl bridge::Config for LuaConfig {
    fn decode(bytes: &[u8]) -> Result<Self, String> {
        if bytes.is_empty() {
            return Ok(Self::default());
        }

        serde_json::from_slice(bytes).map_err(|err| err.to_string())
    }
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

        if let Some(block_newline_gaps) = val.block_newline_gaps {
            config.block_newline_gaps = block_newline_gaps;
        }

        if let Some(space_after_function_names) = val.space_after_function_names {
            config.space_after_function_names = space_after_function_names;
        }

        if let Some(enabled) = val.sort_requires {
            config.sort_requires = SortRequiresConfig { enabled };
        }

        config
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
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
#[serde(rename_all = "lowercase")]
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn formats_with_default_config() {
        assert_eq!(format("local x=1", &LuaConfig::default()).unwrap(), "local x = 1\n");
    }

    #[test]
    fn empty_range_request_is_unchanged() {
        assert_eq!(
            format_range("local x=1", &[], &LuaConfig::default()).unwrap(),
            bridge::FormatResult::Unchanged
        );
    }

    #[test]
    fn formats_a_utf8_byte_range_with_an_exclusive_end() {
        let source = "local value=\"名称\"\nlocal y=2\n";
        let second_line_start = source.find("local y").unwrap();
        let second_line_end = source.len();
        let range =
            u32::try_from(second_line_start).unwrap()..u32::try_from(second_line_end).unwrap();

        assert_eq!(
            format_range(source, &[range], &LuaConfig::default()).unwrap(),
            bridge::FormatResult::FullUpdate("local value=\"名称\"\nlocal y = 2\n".to_string())
        );
    }

    #[test]
    fn rejects_multiple_ranges() {
        let error = format_range("local x=1\nlocal y=2\n", &[0..9, 10..19], &LuaConfig::default())
            .unwrap_err();

        assert_eq!(error, "StyLua supports exactly one formatting range per request");
    }
}
