package head

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
)

func runHead(filePath string, lines int, jsonOutput bool) error {
	f, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer f.Close()

	sc := bufio.NewScanner(f)
	var outputLines []string
	for i := 0; i < lines && sc.Scan(); i++ {
		outputLines = append(outputLines, sc.Text())
	}
	if err := sc.Err(); err != nil {
		return err
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"file":  filePath,
			"lines": outputLines,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		for _, line := range outputLines {
			fmt.Println(line)
		}
	}
	return nil
}
