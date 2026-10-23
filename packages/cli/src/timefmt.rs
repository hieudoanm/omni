/// Map common Go reference-time layout tokens to chrono format specifiers.
/// Covers the layouts used across the CLI (`2006-01-02`, `15:04:05`, RFC-ish
/// subsets); unknown text passes through unchanged.
pub fn go_layout(layout: &str) -> String {
    let mut out = String::with_capacity(layout.len() * 2);
    let b = layout.as_bytes();
    let mut i = 0;
    const TOKENS: &[(&str, &str)] = &[
        ("2006-01-02 15:04:05", "%Y-%m-%d %H:%M:%S"),
        ("2006-01-02T15:04:05", "%Y-%m-%dT%H:%M:%S"),
        ("2006-01-02", "%Y-%m-%d"),
        ("15:04:05", "%H:%M:%S"),
        ("January", "%B"),
        ("Jan", "%b"),
        ("Monday", "%A"),
        ("Mon", "%a"),
        ("2006", "%Y"),
        ("06", "%y"),
        ("01", "%m"),
        ("02", "%d"),
        ("15", "%H"),
        ("04", "%M"),
        ("05", "%S"),
        ("PM", "%p"),
        ("pm", "%p"),
        ("MST", "%Z"),
        ("-0700", "%z"),
        ("Z07:00", "%:z"),
        ("Z0700", "%z"),
        ("Z07", "%#z"),
    ];
    while i < b.len() {
        let rest = &layout[i..];
        let mut matched = false;
        for (go, chrono) in TOKENS {
            if rest.starts_with(go) {
                out.push_str(chrono);
                i += go.len();
                matched = true;
                break;
            }
        }
        if !matched {
            out.push(b[i] as char);
            i += 1;
        }
    }
    out
}
