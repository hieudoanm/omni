package code

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

type symbolMatch struct {
	File     string `json:"file"`
	Line     int    `json:"line"`
	Symbol   string `json:"symbol"`
	Kind     string `json:"kind"`
	Language string `json:"language"`
}

func searchCodeSymbols(symbol string, root string, lang string, kind string, maxResults int) ([]symbolMatch, error) {
	symbolRe, err := regexp.Compile(symbol)
	if err != nil {
		return nil, fmt.Errorf("invalid symbol pattern %q: %w", symbol, err)
	}

	var results []symbolMatch

	filepath.Walk(root, func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() {
			return nil
		}

		langName, patterns, ok := codePatternsFor(path, lang)
		if !ok {
			return nil
		}

		if kind != "" && !containsKind(patterns, kind) {
			return nil
		}

		data, err := os.ReadFile(path)
		if err != nil {
			return nil
		}

		lines := strings.Split(string(data), "\n")
		for i, line := range lines {
			trimmed := strings.TrimSpace(line)
			for _, p := range patterns {
				matches := p.re.FindStringSubmatch(trimmed)
				if matches == nil {
					continue
				}
				name := matches[p.nameIdx]
				if !symbolRe.MatchString(name) {
					continue
				}
				if kind != "" && p.kind != kind {
					continue
				}
				results = append(results, symbolMatch{
					File:     path,
					Line:     i + 1,
					Symbol:   name,
					Kind:     p.kind,
					Language: langName,
				})
				if maxResults > 0 && len(results) >= maxResults {
					return fmt.Errorf("done")
				}
			}
		}
		return nil
	})

	return results, nil
}

func outputCodeResults(results []symbolMatch, symbol string, jsonOutput bool) error {
	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"symbol":  symbol,
			"results": results,
			"count":   len(results),
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
		return nil
	}

	if len(results) == 0 {
		fmt.Println("(no symbols found)")
		return nil
	}

	for _, r := range results {
		fmt.Printf("%s:%d: %s %s\n", r.File, r.Line, r.Kind, r.Symbol)
	}
	fmt.Printf("\n%d symbols found\n", len(results))
	return nil
}
