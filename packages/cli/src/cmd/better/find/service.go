package find

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/spf13/cobra"
)

type findEntry struct {
	Name    string `json:"name"`
	Size    int64  `json:"size"`
	Mode    string `json:"mode"`
	ModTime string `json:"mod_time"`
	IsDir   bool   `json:"is_dir"`
}

func run(cmd *cobra.Command, dir, pattern, name, fileType string, maxDepth int, all, long, human, jsonOutput bool) error {
	absDir, err := filepath.Abs(dir)
	if err != nil {
		return fmt.Errorf("cannot resolve path: %w", err)
	}

	info, err := os.Stat(absDir)
	if err != nil {
		return fmt.Errorf("cannot access %q: %w", dir, err)
	}
	if !info.IsDir() {
		return fmt.Errorf("%q is not a directory", dir)
	}

	var results []findEntry

	walkFn := func(path string, fi os.FileInfo, err error) error {
		if err != nil {
			return nil
		}

		if path == absDir {
			return nil
		}

		rel, _ := filepath.Rel(absDir, path)

		if !all && isHiddenPath(rel) {
			if fi.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		if fileType == "d" && !fi.IsDir() {
			return nil
		}
		if fileType == "f" && fi.IsDir() {
			return nil
		}

		if pattern != "" {
			match, _ := filepath.Match(pattern, fi.Name())
			if !match {
				return nil
			}
		}

		if name != "" && !strings.Contains(strings.ToLower(fi.Name()), strings.ToLower(name)) {
			return nil
		}

		modeStr := fi.Mode().String()
		if len(modeStr) > 1 {
			modeStr = modeStr[1:]
		}

		results = append(results, findEntry{
			Name:    rel,
			Size:    fi.Size(),
			Mode:    modeStr,
			ModTime: fi.ModTime().Format("Jan _2 15:04"),
			IsDir:   fi.IsDir(),
		})
		return nil
	}

	if maxDepth > 0 {
		walkWithDepth(absDir, 0, maxDepth, walkFn)
	} else {
		filepath.Walk(absDir, walkFn)
	}

	sort.Slice(results, func(i, j int) bool {
		return strings.ToLower(results[i].Name) < strings.ToLower(results[j].Name)
	})

	if jsonOutput {
		return outputJSON(results, absDir)
	}

	if long {
		return outputLong(results, human)
	}

	return outputShort(results)
}

func outputJSON(results []findEntry, dir string) error {
	out, err := json.MarshalIndent(map[string]interface{}{
		"directory": dir,
		"entries":   results,
		"count":     len(results),
	}, "", "  ")
	if err != nil {
		return err
	}
	fmt.Println(string(out))
	return nil
}

func outputLong(results []findEntry, human bool) error {
	sizeHeader := "Size (bytes)"
	if human {
		sizeHeader = "Size"
	}
	headers := []string{"Type", "Mode", sizeHeader, "Modified", "Name"}
	rows := make([][]string, 0, len(results))

	for _, e := range results {
		size := fmt.Sprintf("%d", e.Size)
		if human {
			size = humanSize(e.Size)
		}
		rows = append(rows, []string{
			fileTypeChar(e.IsDir),
			e.Mode,
			size,
			e.ModTime,
			e.Name,
		})
	}
	return printTable(headers, rows)
}

func outputShort(results []findEntry) error {
	headers := []string{"Name"}
	rows := make([][]string, 0, len(results))

	for _, e := range results {
		name := e.Name
		if e.IsDir {
			name += "/"
		}
		rows = append(rows, []string{name})
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

func fileTypeChar(isDir bool) string {
	if isDir {
		return "d"
	}
	return "-"
}

func isHiddenPath(rel string) bool {
	for _, part := range strings.Split(rel, string(filepath.Separator)) {
		if part != "" && strings.HasPrefix(part, ".") {
			return true
		}
	}
	return false
}

func walkWithDepth(root string, depth, maxDepth int, fn filepath.WalkFunc) {
	entries, err := os.ReadDir(root)
	if err != nil {
		return
	}
	for _, e := range entries {
		path := filepath.Join(root, e.Name())
		fi, err := e.Info()
		if err != nil {
			continue
		}
		if fn(path, fi, err) != nil {
			continue
		}
		if fi.IsDir() && (maxDepth == 0 || depth+1 < maxDepth) {
			walkWithDepth(path, depth+1, maxDepth, fn)
		}
	}
}
