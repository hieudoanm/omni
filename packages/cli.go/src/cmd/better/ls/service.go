package ls

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

type entry struct {
	Name    string `json:"name"`
	Size    int64  `json:"size"`
	Mode    string `json:"mode"`
	ModTime string `json:"mod_time"`
	IsDir   bool   `json:"is_dir"`
}

func run(cmd *cobra.Command, dir string, all, long, human, reverse, sortByTime, sortBySize, jsonOutput bool) error {
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

	entries, err := os.ReadDir(absDir)
	if err != nil {
		return fmt.Errorf("cannot read directory: %w", err)
	}

	var results []entry
	for _, e := range entries {
		if !all && strings.HasPrefix(e.Name(), ".") {
			continue
		}
		fi, err := e.Info()
		if err != nil {
			continue
		}
		modeStr := fi.Mode().String()
		if len(modeStr) > 1 {
			modeStr = modeStr[1:]
		}
		results = append(results, entry{
			Name:    e.Name(),
			Size:    fi.Size(),
			Mode:    modeStr,
			ModTime: fi.ModTime().Format("Jan _2 15:04"),
			IsDir:   fi.IsDir(),
		})
	}

	sortEntries(results, sortByTime, sortBySize, reverse)

	if jsonOutput {
		return outputJSON(results, absDir)
	}

	if long {
		return outputLong(results, human)
	}

	return outputShort(results)
}

func sortEntries(entries []entry, byTime, bySize, reverse bool) {
	sort.Slice(entries, func(i, j int) bool {
		var less bool
		switch {
		case byTime:
			less = entries[i].ModTime > entries[j].ModTime
		case bySize:
			less = entries[i].Size > entries[j].Size
		default:
			less = strings.ToLower(entries[i].Name) < strings.ToLower(entries[j].Name)
		}
		if reverse {
			return !less
		}
		return less
	})
}

func outputJSON(results []entry, dir string) error {
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

func outputLong(results []entry, human bool) error {
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

func outputShort(results []entry) error {
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
