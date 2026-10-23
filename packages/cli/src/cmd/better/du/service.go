package du

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

type duEntry struct {
	Path  string `json:"path"`
	Size  int64  `json:"size_bytes"`
	Items int    `json:"items,omitempty"`
	IsDir bool   `json:"is_dir"`
}

type duResult struct {
	duEntry
	Children []duEntry `json:"children,omitempty"`
}

func run(dir string, depth int, sortBy string, all, human bool, threshold int64, jsonOutput bool) error {
	absDir, err := filepath.Abs(dir)
	if err != nil {
		return fmt.Errorf("cannot resolve path: %w", err)
	}
	info, err := os.Stat(absDir)
	if err != nil || !info.IsDir() {
		return fmt.Errorf("cannot access %q", dir)
	}

	var results []duEntry
	maxDepth := depth
	if maxDepth <= 0 {
		maxDepth = -1
	}

	err = walkSize(absDir, absDir, 0, maxDepth, all, &results)
	if err != nil {
		return err
	}

	sort.Slice(results, func(i, j int) bool {
		switch sortBy {
		case "name":
			return strings.ToLower(results[i].Path) < strings.ToLower(results[j].Path)
		default:
			return results[i].Size > results[j].Size
		}
	})

	if threshold > 0 {
		thresholdBytes := threshold * 1024
		var filtered []duEntry
		for _, r := range results {
			if r.Size >= thresholdBytes {
				filtered = append(filtered, r)
			}
		}
		results = filtered
	}

	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"directory": absDir,
			"entries":   results,
			"count":     len(results),
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
		return nil
	}

	return outputTable(results, human)
}

func outputTable(results []duEntry, human bool) error {
	sizeHeader := "Size (bytes)"
	if human {
		sizeHeader = "Size"
	}
	headers := []string{"Type", sizeHeader, "Path"}
	rows := make([][]string, 0, len(results))

	for _, r := range results {
		size := fmt.Sprintf("%d", r.Size)
		if human {
			size = humanSize(r.Size)
		}
		typ := "d"
		if !r.IsDir {
			typ = "-"
		}
		rows = append(rows, []string{typ, size, r.Path})
	}
	return printTable(headers, rows)
}

func walkSize(root, dir string, currentDepth, maxDepth int, all bool, results *[]duEntry) error {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return err
	}

	var totalSize int64
	var itemCount int
	var subDirs []duEntry

	for _, e := range entries {
		if strings.HasPrefix(e.Name(), ".") {
			continue
		}
		fi, err := e.Info()
		if err != nil {
			continue
		}
		path := filepath.Join(dir, e.Name())

		if fi.IsDir() {
			subResults := []duEntry{}
			subErr := walkSize(root, path, currentDepth+1, maxDepth, all, &subResults)
			if subErr != nil {
				continue
			}
			subSize := fi.Size()
			for _, sr := range subResults {
				subSize += sr.Size
			}
			if (maxDepth < 0 || currentDepth+1 <= maxDepth) || currentDepth == 0 && maxDepth == 0 {
				subDirs = append(subDirs, duEntry{
					Path:  relPath(root, path),
					Size:  subSize,
					Items: 1,
					IsDir: true,
				})
			}
			totalSize += subSize
			itemCount++
		} else {
			totalSize += fi.Size()
			itemCount++
			if all {
				*results = append(*results, duEntry{
					Path:  relPath(root, path),
					Size:  fi.Size(),
					Items: 1,
					IsDir: false,
				})
			}
		}
	}

	if currentDepth > 0 || len(subDirs) > 0 {
		rel := relPath(root, dir)
		if currentDepth == 0 {
			if len(subDirs) > 0 {
				*results = append(*results, duEntry{
					Path:  rel,
					Size:  totalSize,
					Items: itemCount,
					IsDir: true,
				})
			}
			*results = append(*results, subDirs...)
		} else {
			if rel != "" && (maxDepth < 0 || currentDepth <= maxDepth) {
				*results = append(*results, duEntry{
					Path:  rel,
					Size:  totalSize,
					Items: itemCount,
					IsDir: true,
				})
			}
		}
	}

	return nil
}

func relPath(root, path string) string {
	rel, err := filepath.Rel(root, path)
	if err != nil {
		return path
	}
	if rel == "." {
		return "."
	}
	return rel
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

func humanSize(bytes int64) string {
	if bytes == 0 {
		return "0B"
	}
	units := []string{"B", "K", "M", "G", "T"}
	i := int(math.Floor(math.Log(float64(bytes)) / math.Log(1024)))
	if i >= len(units) {
		i = len(units) - 1
	}
	val := float64(bytes) / math.Pow(1024, float64(i))
	if i == 0 {
		return fmt.Sprintf("%dB", bytes)
	}
	return fmt.Sprintf("%.1f%s", val, units[i])
}
