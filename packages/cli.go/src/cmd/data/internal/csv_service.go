package internal

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
)

func ReadCSVInput(args []string) ([][]string, error) {
	var r io.Reader
	if len(args) > 0 {
		f, err := os.Open(args[0])
		if err != nil {
			return nil, fmt.Errorf("open file: %w", err)
		}
		defer f.Close()
		r = f
	} else {
		r = os.Stdin
	}
	reader := csv.NewReader(r)
	reader.LazyQuotes = true
	all, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("read csv: %w", err)
	}
	return all, nil
}

func FormatCSVText(records [][]string) string {
	var lines []string
	for _, record := range records {
		lines = append(lines, strings.Join(record, " | "))
	}
	return strings.Join(lines, "\n")
}

func FormatCSVJSON(records [][]string) string {
	b, _ := json.MarshalIndent(records, "", "  ")
	return string(b)
}
