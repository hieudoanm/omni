package split

import (
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/internal"
)

func runE(filePath, format string, rows int, output string) error {
	if format == "excel" {
		return fmt.Errorf("excel format not yet supported, use csv")
	}

	f, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("open file: %w", err)
	}
	defer f.Close()

	reader := csv.NewReader(f)
	reader.LazyQuotes = true

	header, err := reader.Read()
	if err != nil {
		return fmt.Errorf("read header: %w", err)
	}

	outputDir := output
	if outputDir == "" {
		outputDir = filepath.Dir(filePath)
	}

	baseName := filepath.Base(filePath)
	ext := filepath.Ext(baseName)
	nameWithoutExt := baseName[:len(baseName)-len(ext)]

	part := 1
	for {
		var chunk [][]string
		chunk = append(chunk, header)

		count := 0
		for count < rows {
			record, err := reader.Read()
			if err == io.EOF {
				break
			}
			if err != nil {
				return fmt.Errorf("read row: %w", err)
			}
			chunk = append(chunk, record)
			count++
		}

		if len(chunk) <= 1 {
			break
		}

		outFile := filepath.Join(outputDir, fmt.Sprintf("%s_part_%03d.csv", nameWithoutExt, part))
		if err := internal.WriteCSV(outFile, chunk); err != nil {
			return err
		}
		fmt.Printf("Created: %s\n", outFile)

		if count < rows {
			break
		}
		part++
	}

	return nil
}
