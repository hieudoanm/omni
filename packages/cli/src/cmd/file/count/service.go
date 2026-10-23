package count

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

func runCount(filePath string, jsonOutput bool) error {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return err
	}

	var lines int
	for _, b := range data {
		if b == '\n' {
			lines++
		}
	}
	words := len(strings.Fields(string(data)))
	bytes := len(data)

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"file":  filePath,
			"lines": lines,
			"words": words,
			"bytes": bytes,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Printf("%8d %8d %8d %s\n", lines, words, bytes, filePath)
	}
	return nil
}
