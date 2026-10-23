package env

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"
)

type envEntry struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

func run(name, sortBy string, jsonOutput bool) error {
	environ := os.Environ()
	var results []envEntry

	for _, e := range environ {
		parts := strings.SplitN(e, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key, val := parts[0], parts[1]
		if name != "" && !strings.Contains(strings.ToLower(key), strings.ToLower(name)) {
			continue
		}
		results = append(results, envEntry{Key: key, Value: val})
	}

	sort.Slice(results, func(i, j int) bool {
		switch sortBy {
		case "value":
			return strings.ToLower(results[i].Value) < strings.ToLower(results[j].Value)
		default:
			return strings.ToLower(results[i].Key) < strings.ToLower(results[j].Key)
		}
	})

	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"variables": results,
			"count":     len(results),
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
		return nil
	}

	return outputTable(results)
}

func outputTable(results []envEntry) error {
	headers := []string{"KEY", "VALUE"}
	rows := make([][]string, 0, len(results))
	for _, e := range results {
		rows = append(rows, []string{e.Key, e.Value})
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
