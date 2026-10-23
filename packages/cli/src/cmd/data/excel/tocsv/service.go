package tocsv

import (
	"fmt"
	"path/filepath"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/internal"
)

func runE(input, output string) error {
	sheets, err := internal.ParseXLSX(input)
	if err != nil {
		return fmt.Errorf("parse xlsx: %w", err)
	}

	outputDir := output
	if outputDir == "" {
		outputDir = filepath.Dir(input)
	}

	baseName := filepath.Base(input)
	ext := filepath.Ext(baseName)
	nameWithoutExt := strings.TrimSuffix(baseName, ext)

	for _, sheet := range sheets {
		sheetName := sheet.Name
		if sheetName == "" {
			sheetName = "Sheet1"
		}
		outFile := filepath.Join(outputDir, fmt.Sprintf("%s_%s.csv", nameWithoutExt, sheetName))
		if err := internal.WriteCSV(outFile, sheet.Rows); err != nil {
			return fmt.Errorf("write csv: %w", err)
		}
		fmt.Printf("Created: %s\n", outFile)
	}

	return nil
}
