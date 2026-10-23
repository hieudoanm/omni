package tail

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
)

func runTail(filePath string, lines int, jsonOutput bool) error {
	f, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer f.Close()

	sc := bufio.NewScanner(f)
	ring := make([]string, 0, lines)
	for sc.Scan() {
		if len(ring) >= lines {
			ring = ring[1:]
		}
		ring = append(ring, sc.Text())
	}
	if err := sc.Err(); err != nil {
		return err
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
