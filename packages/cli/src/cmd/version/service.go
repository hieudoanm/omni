package version

import (
	"encoding/json"
	"fmt"
)

func runVersion(jsonOutput bool) error {
	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"version": V,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		fmt.Printf("Version: %s\n", V)
	}
	return nil
}
