package head

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

func runHead(filePath string, lines int, jsonOutput bool) error {
	f, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer f.Close()

	reader := bufio.NewReader(f)
	var outputLines []string
	for i := 0; i < lines; i++ {
		line, err := reader.ReadString('\n')
		line = strings.TrimRight(line, "\r\n")
		if line != "" || err == nil {
			outputLines = append(outputLines, line)
		}
		if err != nil {
			break
		}
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
