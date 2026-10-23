package uuid

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/google/uuid"
)

func runUUIDs(count int, jsonOutput bool) (string, error) {
	var uuids []string
	for i := 0; i < count; i++ {
		uuids = append(uuids, uuid.New().String())
	}

	var output string
	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"uuids": uuids,
			"count": count,
		}, "", "  ")
		output = string(b)
	} else {
		output = strings.Join(uuids, "\n")
	}
	fmt.Println(output)
	return output, nil
}
