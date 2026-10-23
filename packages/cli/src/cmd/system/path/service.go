package path

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
)

func pathRun(args []string, filter string, sortOutput bool, jsonOutput bool) error {
	path := os.Getenv("PATH")
	dirs := filepath.SplitList(path)

	if len(args) > 0 {
		full, err := exec.LookPath(args[0])
		if err != nil {
			return fmt.Errorf("command %q not found in PATH", args[0])
		}
		if jsonOutput {
			b, _ := json.MarshalIndent(map[string]string{
				"command": args[0],
				"path":    full,
			}, "", "  ")
			fmt.Println(string(b))
		} else {
			fmt.Println(full)
		}
		return nil
	}

	type entry struct {
		Index  int    `json:"index"`
		Dir    string `json:"dir"`
		Exists bool   `json:"exists"`
	}
	var entries []entry

	for i, d := range dirs {
		if filter != "" && !strings.Contains(strings.ToLower(d), strings.ToLower(filter)) {
			continue
		}
		_, err := os.Stat(d)
		entries = append(entries, entry{i, d, err == nil})
	}

	if sortOutput {
		sort.Slice(entries, func(i, j int) bool {
			return entries[i].Dir < entries[j].Dir
		})
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(entries, "", "  ")
		fmt.Println(string(b))
	} else {
		for _, e := range entries {
			mark := " "
			if !e.Exists {
				mark = "✗"
			}
			fmt.Printf(" %s %s\n", mark, e.Dir)
		}
	}
	return nil
}
