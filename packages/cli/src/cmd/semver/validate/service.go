package validate

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/semver/version"
)

func runValidate(versions []string, jsonOutput bool) error {
	if len(versions) == 0 {
		return fmt.Errorf("need at least one version: use --versions")
	}

	if jsonOutput {
		results := make([]map[string]interface{}, 0)
		for _, s := range versions {
			_, err := version.Parse(s)
			valid := err == nil
			entry := map[string]interface{}{
				"version": s,
				"valid":   valid,
			}
			if err != nil {
				entry["error"] = err.Error()
			}
			results = append(results, entry)
		}
		out, err := json.MarshalIndent(results, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		for _, s := range versions {
			_, err := version.Parse(s)
			if err != nil {
				fmt.Printf("%s: invalid (%v)\n", s, err)
			} else {
				fmt.Printf("%s: valid\n", s)
			}
		}
	}
	return nil
}
