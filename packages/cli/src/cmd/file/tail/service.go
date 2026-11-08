package tail

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

func runTail(filePath string, lines int, jsonOutput bool) error {
	f, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer f.Close()

	reader := bufio.NewReader(f)
	ring := make([]string, 0, lines)
	for {
		line, err := reader.ReadString('\n')
		line = strings.TrimRight(line, "\r\n")
		if line != "" || err == nil {
			if len(ring) >= lines {
				ring = ring[1:]
			}
			ring = append(ring, line)
		}
		if err != nil {
			break
		}
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"file":  filePath,
			"lines": ring,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		for _, line := range ring {
			fmt.Println(line)
		}
	}
	return nil
}
