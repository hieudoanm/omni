package internal

import (
	"encoding/csv"
	"fmt"
	"os"
)

func WriteCSV(path string, records [][]string) error {
	f, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("create file: %w", err)
	}
	defer f.Close()

	writer := csv.NewWriter(f)
	defer writer.Flush()

	for _, record := range records {
		if err := writer.Write(record); err != nil {
			return fmt.Errorf("write csv: %w", err)
		}
	}

	return writer.Error()
}
