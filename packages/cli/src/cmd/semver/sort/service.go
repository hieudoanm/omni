package sort

import (
	"encoding/json"
	"fmt"
	"sort"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/semver/version"
)

func runSort(versions []string, jsonOutput bool) error {
	if len(versions) == 0 {
		return fmt.Errorf("need at least one version: use --versions")
	}

	parsed := make([]version.Version, len(versions))
	for i, s := range versions {
		v, err := version.Parse(s)
		if err != nil {
			return fmt.Errorf("%s: %w", s, err)
		}
		parsed[i] = v
	}
	sort.Slice(parsed, func(i, j int) bool {
		return parsed[i].Compare(parsed[j]) < 0
	})
	if jsonOutput {
		sorted := make([]string, len(parsed))
		for i, v := range parsed {
			sorted[i] = v.String()
		}
		out, err := json.MarshalIndent(map[string]interface{}{
			"sorted": sorted,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		for _, v := range parsed {
			fmt.Println(v)
		}
	}
	return nil
}
