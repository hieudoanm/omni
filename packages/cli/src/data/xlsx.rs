use anyhow::{anyhow, Result};
use calamine::{open_workbook_auto, Data, Reader, Sheets};

pub struct XlsxSheet {
    pub name: String,
    pub rows: Vec<Vec<String>>,
}

fn cell_string(c: &Data) -> String {
    match c {
        Data::Empty => String::new(),
        Data::String(s) => s.clone(),
        Data::Float(f) => {
            if f.fract() == 0.0 && f.abs() < 1e15 {
                format!("{}", *f as i64)
            } else {
                format!("{f}")
            }
        }
        Data::Int(i) => i.to_string(),
        Data::Bool(b) => b.to_string(),
        Data::Error(e) => e.to_string(),
        Data::DateTime(d) => d.to_string(),
        Data::DateTimeIso(s) | Data::DurationIso(s) => s.clone(),
    }
}

/// Port of Go `internal.ParseXLSX`: sheet names + rows as strings.
pub fn parse_xlsx(path: &str) -> Result<Vec<XlsxSheet>> {
    let mut wb: Sheets<_> = open_workbook_auto(path).map_err(|e| anyhow!("open workbook: {e}"))?;
    let names = wb.sheet_names().to_vec();
    let mut out = Vec::with_capacity(names.len());
    for name in names {
        let range = wb
            .worksheet_range(&name)
            .map_err(|e| anyhow!("read sheet {name}: {e}"))?;
        let mut rows = Vec::with_capacity(range.height());
        for row in range.rows() {
            // Go emits every cell up to the row's used width; trim trailing empties
            // only when the whole row is empty (matches Go's sparse output loosely).
            let mut cells: Vec<String> = row.iter().map(cell_string).collect();
            while cells.last().map(|s| s.is_empty()).unwrap_or(false) {
                cells.pop();
            }
            if !cells.is_empty() || !rows.is_empty() {
                rows.push(cells);
            }
        }
        out.push(XlsxSheet { name, rows });
    }
    Ok(out)
}
