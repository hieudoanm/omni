package info

import (
	"fmt"
	"os"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/internal"
)

func runE(input string) error {
	sheets, err := internal.ParseXLSX(input)
	if err != nil {
		return fmt.Errorf("parse xlsx: %w", err)
	}

	totalSheets := len(sheets)
	totalRows := 0

	out := os.Stdout

	fmt.Fprintf(out, "File: %s\n", input)
	fmt.Fprintf(out, "Sheets: %d\n\n", totalSheets)

	for i, sheet := range sheets {
		rowCount := len(sheet.Rows)
		colCount := 0
		for _, row := range sheet.Rows {
			if len(row) > colCount {
				colCount = len(row)
			}
		}
		totalRows += rowCount
		fmt.Fprintf(out, "  %d. %s\n", i+1, sheet.Name)
		fmt.Fprintf(out, "     Rows: %d\n", rowCount)
		fmt.Fprintf(out, "     Columns: %d\n", colCount)
	}

	fmt.Fprintf(out, "\nTotal rows: %d\n", totalRows)

	return nil
}
