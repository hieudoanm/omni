package env

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"
)

func envRun(filter string, sortOutput bool, jsonOutput bool) error {
	env := os.Environ()
	type entry struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	}
	var entries []entry

	for _, e := range env {
		k, v, _ := strings.Cut(e, "=")
		if filter != "" && !strings.HasPrefix(k, filter) {
			continue
		}
		entries = append(entries, entry{k, v})
	}

	if sortOutput {
		sort.Slice(entries, func(i, j int) bool {
			return entries[i].Key < entries[j].Key
		})
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(entries, "", "  ")
		fmt.Println(string(b))
	} else {
		for _, e := range entries {
			fmt.Printf("%s=%s\n", e.Key, e.Value)
		}
	}
	return nil
}
