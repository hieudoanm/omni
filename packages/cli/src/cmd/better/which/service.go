package which

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

type whichEntry struct {
	Name string `json:"name"`
	Path string `json:"path"`
}

func run(args []string, all, jsonOutput bool) error {
	pathEnv := os.Getenv("PATH")
	pathDirs := filepath.SplitList(pathEnv)

	// Deduplicate directories
	seen := make(map[string]bool)
	var uniqueDirs []string
	for _, d := range pathDirs {
		abs, err := filepath.Abs(d)
		if err != nil {
			continue
		}
		if seen[abs] {
			continue
		}
		seen[abs] = true
		uniqueDirs = append(uniqueDirs, abs)
	}

	var results []whichEntry
	seenResults := make(map[string]bool)

	for _, name := range args {
		found := false
		for _, dir := range uniqueDirs {
			full := filepath.Join(dir, name)
			fi, err := os.Stat(full)
			if err != nil {
				continue
			}
			if fi.Mode()&0o111 == 0 {
				continue
			}
			key := name + ":" + full
			if seenResults[key] {
				continue
			}
			seenResults[key] = true
			results = append(results, whichEntry{Name: name, Path: full})
			found = true
			if !all {
				break
			}
		}
		if !found && !all {
			results = append(results, whichEntry{Name: name, Path: "not found"})
		}
	}

	sort.Slice(results, func(i, j int) bool {
		if results[i].Name != results[j].Name {
			return results[i].Name < results[j].Name
		}
		return results[i].Path < results[j].Path
	})

	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"entries": results,
			"count":   len(results),
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
		return nil
	}

	return outputTable(results)
}

func outputTable(results []whichEntry) error {
	headers := []string{"NAME", "PATH"}
	rows := make([][]string, 0, len(results))
	for _, r := range results {
		rows = append(rows, []string{r.Name, r.Path})
	}
	return printTable(headers, rows)
}

func printTable(headers []string, rows [][]string) error {
	colWidths := make([]int, len(headers))
	for i, h := range headers {
		colWidths[i] = len(h)
	}
	for _, row := range rows {
		for i, val := range row {
			if len(val) > colWidths[i] {
				colWidths[i] = len(val)
			}
		}
	}
	for i := range colWidths {
		if colWidths[i] < 3 {
			colWidths[i] = 3
		}
	}

	printSeparator(colWidths)
	fmt.Print("|")
	for i, h := range headers {
		fmt.Printf(" %-*s |", colWidths[i], h)
	}
	fmt.Println()
	printSeparator(colWidths)
	for _, row := range rows {
		fmt.Print("|")
		for i, val := range row {
			fmt.Printf(" %-*s |", colWidths[i], val)
		}
		fmt.Println()
	}
	printSeparator(colWidths)
	return nil
}

func printSeparator(colWidths []int) {
	fmt.Print("|")
	for _, w := range colWidths {
		fmt.Print(strings.Repeat("-", w+2) + "|")
	}
	fmt.Println()
}
